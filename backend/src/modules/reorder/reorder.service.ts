import prisma from '../../config/database';
import logger from '../../config/logger';

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  reorderLevel: number;
  minStock: number;
  suggestedQuantity: number;
  estimatedCost: number;
  suppliers: SuggestedSupplier[];
  urgency: 'critical' | 'high' | 'medium';
}

export interface SuggestedSupplier {
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  lastPurchasePrice?: number;
  lastPurchaseDate?: string;
  totalPurchases: number;
}

export interface DraftPurchaseOrderResult {
  purchaseId: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  totalItems: number;
  estimatedTotal: number;
  status: string;
}

export class SmartReorderService {
  /**
   * Detect all products that are at or below their reorder level
   */
  async detectLowStock(): Promise<ReorderSuggestion[]> {
    // Get all inventory items grouped by product, summing across warehouses
    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        product: {
          include: {
            purchaseItems: {
              orderBy: { purchase: { orderDate: 'desc' } },
              take: 10,
              include: {
                purchase: {
                  include: { supplier: { select: { id: true, name: true, email: true, phone: true } } },
                },
              },
            },
          },
        },
      },
    });

    // Aggregate per product
    const productStockMap = new Map<string, { quantity: number; product: any }>();
    for (const item of inventoryItems) {
      const existing = productStockMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        productStockMap.set(item.productId, { quantity: item.quantity, product: item.product });
      }
    }

    const suggestions: ReorderSuggestion[] = [];

    for (const [productId, { quantity, product }] of productStockMap.entries()) {
      if (!product.trackInventory || !product.isActive || product.deletedAt) continue;
      if (quantity > product.reorderLevel) continue; // not low stock

      // Determine urgency
      let urgency: 'critical' | 'high' | 'medium';
      if (quantity <= 0) {
        urgency = 'critical';
      } else if (quantity <= product.minStock) {
        urgency = 'high';
      } else {
        urgency = 'medium';
      }

      // Suggest quantity: bring up to 2× reorder level minimum, or at least 1
      const suggestedQuantity = Math.max(
        product.reorderLevel * 2 - quantity,
        product.minStock * 3,
        10
      );

      // Build supplier suggestions from purchase history
      const supplierMap = new Map<string, SuggestedSupplier>();
      for (const purchaseItem of product.purchaseItems) {
        const supplier = purchaseItem.purchase?.supplier;
        if (!supplier) continue;
        const existing = supplierMap.get(supplier.id);
        if (existing) {
          existing.totalPurchases += 1;
        } else {
          supplierMap.set(supplier.id, {
            supplierId: supplier.id,
            supplierName: supplier.name,
            supplierEmail: supplier.email || undefined,
            supplierPhone: supplier.phone || undefined,
            lastPurchasePrice: parseFloat(purchaseItem.unitPrice.toString()),
            lastPurchaseDate: purchaseItem.purchase.orderDate?.toISOString(),
            totalPurchases: 1,
          });
        }
      }

      // Sort: most purchased supplier first
      const suppliers = Array.from(supplierMap.values()).sort(
        (a, b) => b.totalPurchases - a.totalPurchases
      );

      const unitCost = parseFloat(product.cost.toString());
      suggestions.push({
        productId,
        productName: product.name,
        productSku: product.sku,
        currentStock: quantity,
        reorderLevel: product.reorderLevel,
        minStock: product.minStock,
        suggestedQuantity,
        estimatedCost: suggestedQuantity * unitCost,
        suppliers,
        urgency,
      });
    }

    // Sort by urgency: critical first
    const urgencyOrder = { critical: 0, high: 1, medium: 2 };
    suggestions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return suggestions;
  }

  /**
   * Create a draft purchase order from selected reorder items
   */
  async createDraftPurchaseOrder(
    supplierId: string,
    items: Array<{ productId: string; quantity: number; unitPrice: number }>,
    notes: string,
    createdBy: string
  ): Promise<DraftPurchaseOrderResult> {
    // Validate supplier exists
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, deletedAt: null, isActive: true },
    });
    if (!supplier) {
      throw new Error('Supplier not found or inactive');
    }

    // Validate products
    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, deletedAt: null },
      });
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
    }

    // Generate purchase number
    const count = await prisma.purchase.count();
    const purchaseNumber = `PO-AUTO-${String(count + 1).padStart(5, '0')}`;

    // Calculate totals
    let subtotal = 0;
    const purchaseItems = items.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        tax: 0,
        total: lineTotal,
        received: 0,
      };
    });

    const purchase = await prisma.purchase.create({
      data: {
        purchaseNumber,
        supplierId,
        status: 'draft',
        orderDate: new Date(),
        subtotal,
        tax: 0,
        discount: 0,
        shipping: 0,
        total: subtotal,
        notes: notes || 'Auto-generated by Smart Reorder System',
        createdBy,
        items: {
          create: purchaseItems,
        },
      },
      include: { supplier: true },
    });

    logger.info(`Smart Reorder: Draft PO ${purchaseNumber} created for supplier ${supplier.name}`);

    return {
      purchaseId: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplier.name,
      totalItems: items.length,
      estimatedTotal: subtotal,
      status: purchase.status,
    };
  }

  /**
   * Send notifications to all manager-level users about low stock
   */
  async notifyManagers(suggestions: ReorderSuggestion[]): Promise<number> {
    if (suggestions.length === 0) return 0;

    // Find users with manager roles (procurement, super-admin, inventory manager)
    const managerRoleSlugs = [
      'super-administrator',
      'inventory-manager',
      'procurement-officer',
    ];

    const managers = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        roles: {
          some: {
            role: { slug: { in: managerRoleSlugs } },
          },
        },
      },
      select: { id: true, firstName: true, email: true },
    });

    if (managers.length === 0) return 0;

    const critical = suggestions.filter((s) => s.urgency === 'critical').length;
    const high = suggestions.filter((s) => s.urgency === 'high').length;

    const title = `⚠️ Low Stock Alert: ${suggestions.length} product${suggestions.length > 1 ? 's' : ''} need reordering`;
    const message = `Smart Reorder detected ${suggestions.length} products below reorder level. ${critical} critical, ${high} high priority. Visit the Smart Reorder page to create purchase orders.`;

    const notifications = managers.map((manager) => ({
      userId: manager.id,
      type: 'low_stock_alert',
      title,
      message,
      data: JSON.stringify({
        totalItems: suggestions.length,
        critical,
        high,
        products: suggestions.slice(0, 5).map((s) => s.productName),
      }),
    }));

    await prisma.notification.createMany({ data: notifications });

    logger.info(
      `Smart Reorder: Sent low-stock notifications to ${managers.length} manager(s) for ${suggestions.length} products`
    );

    return managers.length;
  }

  /**
   * Run a full reorder scan: detect + notify
   */
  async runReorderScan(requestingUserId: string) {
    const suggestions = await this.detectLowStock();
    let notifiedCount = 0;

    if (suggestions.length > 0) {
      notifiedCount = await this.notifyManagers(suggestions);
    }

    logger.info(
      `Smart Reorder scan by user ${requestingUserId}: ${suggestions.length} low-stock items, ${notifiedCount} managers notified`
    );

    return {
      scannedAt: new Date().toISOString(),
      lowStockCount: suggestions.length,
      managersNotified: notifiedCount,
      suggestions,
    };
  }
}

export default new SmartReorderService();
