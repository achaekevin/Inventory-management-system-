import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError';

export class ExternalApiService {
  // ==================== MOBILE APPS ====================

  /**
   * Fast full/incremental sync payload for mobile devices
   */
  async getMobileSyncPayload() {
    const [products, categories, warehouses, customers] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null, isActive: true },
        select: {
          id: true,
          name: true,
          sku: true,
          barcode: true,
          price: true,
          categoryId: true,
          minStock: true,
        },
        take: 100,
      }),
      prisma.category.findMany({
        where: { deletedAt: null, isActive: true },
        select: { id: true, name: true, slug: true },
      }),
      prisma.warehouse.findMany({
        where: { deletedAt: null, isActive: true },
        select: { id: true, name: true, code: true },
      }),
      prisma.customer.findMany({
        where: { deletedAt: null, isActive: true },
        select: { id: true, firstName: true, lastName: true, companyName: true, email: true, phone: true },
        take: 50,
      }),
    ]);

    return {
      syncedAt: new Date(),
      version: 'v1.0.0',
      counts: {
        products: products.length,
        categories: categories.length,
        warehouses: warehouses.length,
        customers: customers.length,
      },
      data: {
        products: products.map((p) => ({
          ...p,
          price: Number(p.price),
        })),
        categories,
        warehouses,
        customers: customers.map((c) => ({
          ...c,
          name: c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        })),
      },
    };
  }

  /**
   * Submit sale order directly from Mobile POS app
   */
  async createMobileSale(data: {
    saleNumber?: string;
    customerId?: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    paymentMethod?: string;
  }, userId: string) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Sale order items cannot be empty');
    }

    const saleNumber = data.saleNumber || `MOB-SALE-${Date.now().toString().slice(-6)}`;
    let subtotal = 0;

    const formattedItems = data.items.map((item) => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        tax: 0,
        total,
      };
    });

    const newSale = await prisma.sale.create({
      data: {
        saleNumber,
        invoiceNumber: `INV-${saleNumber}`,
        customerId: data.customerId || null,
        status: 'completed',
        saleDate: new Date(),
        subtotal,
        tax: 0,
        discount: 0,
        total: subtotal,
        paymentMethod: data.paymentMethod || 'cash',
        paymentStatus: 'paid',
        createdBy: userId || 'mobile-app',
        items: {
          create: formattedItems,
        },
      },
      include: { items: true },
    });

    return {
      saleId: newSale.id,
      saleNumber: newSale.saleNumber,
      invoiceNumber: newSale.invoiceNumber,
      total: Number(newSale.total),
      itemCount: newSale.items.length,
      status: newSale.status,
      createdAt: newSale.createdAt,
    };
  }

  // ==================== BARCODE SCANNERS ====================

  /**
   * Scan Barcode / SKU / QR Code lookup
   */
  async scanBarcode(barcode: string) {
    if (!barcode) throw new BadRequestError('Barcode query parameter required');

    const clean = barcode.trim();

    const product = await prisma.product.findFirst({
      where: {
        deletedAt: null,
        OR: [{ barcode: clean }, { sku: clean }, { qrCode: clean }, { name: { contains: clean } }],
      },
      include: {
        category: true,
        brand: true,
        inventory: {
          include: { warehouse: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`No product found matching barcode/SKU "${clean}"`);
    }

    const totalStock = product.inventory.reduce((acc, item) => acc + item.quantity, 0);

    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: Number(product.price),
      cost: Number(product.cost),
      category: product.category?.name,
      brand: product.brand?.name,
      totalStock,
      isLowStock: totalStock <= product.minStock,
      warehouses: product.inventory.map((inv) => ({
        warehouseId: inv.warehouseId,
        warehouseName: inv.warehouse?.name,
        quantity: inv.quantity,
        available: inv.available,
      })),
    };
  }

  /**
   * Fast barcode stock adjustment by scanner
   */
  async adjustStockByScanner(data: {
    barcode: string;
    warehouseId: string;
    quantity: number;
    action: 'increase' | 'decrease';
  }, userId: string) {
    const scanned = await this.scanBarcode(data.barcode);
    const qtyChange = Math.abs(data.quantity) * (data.action === 'decrease' ? -1 : 1);

    const invItem = await prisma.inventoryItem.upsert({
      where: {
        productId_warehouseId: {
          productId: scanned.productId,
          warehouseId: data.warehouseId,
        },
      },
      update: {
        quantity: { increment: qtyChange },
        available: { increment: qtyChange },
      },
      create: {
        productId: scanned.productId,
        warehouseId: data.warehouseId,
        quantity: Math.max(0, qtyChange),
        available: Math.max(0, qtyChange),
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId: scanned.productId,
        warehouseId: data.warehouseId,
        type: data.action === 'decrease' ? 'OUT' : 'IN',
        quantity: Math.abs(data.quantity),
        reason: `Barcode Scanner Stock Adjustment (${data.action})`,
        createdBy: userId || 'barcode-scanner',
      },
    });

    return {
      productId: scanned.productId,
      productName: scanned.name,
      warehouseId: data.warehouseId,
      newQuantity: invItem.quantity,
      action: data.action,
      updatedAt: invItem.updatedAt,
    };
  }

  // ==================== THIRD-PARTY INTEGRATIONS ====================

  /**
   * Products Catalog API for External E-commerce / ERP
   */
  async getProductsCatalog(query: { limit?: number; page?: number; category?: string }) {
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const page = Math.max(1, Number(query.page) || 1);

    const products = await prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      take: limit,
      skip: (page - 1) * limit,
      include: { category: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      page,
      limit,
      count: products.length,
      items: products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        price: Number(p.price),
        category: p.category?.name,
        brand: p.brand?.name,
        minStock: p.minStock,
        createdAt: p.createdAt,
      })),
    };
  }

  /**
   * Real-time Inventory Levels API for External Systems
   */
  async getInventoryLevels() {
    const items = await prisma.inventoryItem.findMany({
      include: {
        product: { select: { name: true, sku: true, barcode: true } },
        warehouse: { select: { name: true, code: true } },
      },
    });

    return items.map((item) => ({
      inventoryId: item.id,
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      barcode: item.product.barcode,
      warehouseCode: item.warehouse.code,
      warehouseName: item.warehouse.name,
      quantity: item.quantity,
      reserved: item.reserved,
      available: item.available,
      updatedAt: item.updatedAt,
    }));
  }

  // ==================== EXTERNAL SYSTEMS ====================

  /**
   * Ingest Webhook / External System Event
   */
  async ingestExternalEvent(payload: any, tokenName: string) {
    await prisma.activityLog.create({
      data: {
        userId: 'external-system',
        action: 'EXTERNAL_WEBHOOK_EVENT',
        module: 'External API',
        details: JSON.stringify({ tokenName, payload }),
      },
    });

    return {
      status: 'acknowledged',
      receivedAt: new Date(),
      eventId: `evt_${Date.now()}`,
    };
  }
}

export default new ExternalApiService();
