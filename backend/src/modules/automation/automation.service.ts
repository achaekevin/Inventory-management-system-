import prisma from '../../config/database';
import logger from '../../config/logger';

// ─── Rule type constants ──────────────────────────────────────────────────────

export type AutomationRuleType =
  | 'low_stock_po'
  | 'high_value_notify'
  | 'overdue_payment_reminder'
  | 'archive_inactive_product';

// ─── Config shapes per rule type ─────────────────────────────────────────────

export interface LowStockPoConfig {
  preferredSupplierId?: string; // optional override; uses last-purchase supplier if omitted
}

export interface HighValueNotifyConfig {
  threshold: number;       // purchase total in KSh
  notifyRoles: string[];   // role slugs to notify
}

export interface OverduePaymentReminderConfig {
  graceDays: number;       // days after due date before reminder fires
  notifyRoles: string[];   // role slugs to notify
}

export interface ArchiveInactiveProductConfig {
  inactiveDays: number;    // days since last sale before archival
}

export interface RuleExecutionResult {
  itemsAffected: number;
  details: object[];
}

// ─── Helper: notify users by role slugs ──────────────────────────────────────

async function notifyByRoles(
  roleSlugs: string[],
  type: string,
  title: string,
  message: string,
  data?: object
): Promise<number> {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      roles: { some: { role: { slug: { in: roleSlugs } } } },
    },
    select: { id: true },
  });

  if (users.length === 0) return 0;

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
    })),
  });

  return users.length;
}

// ─── Automation Service ───────────────────────────────────────────────────────

export class AutomationService {

  // ─── CRUD ────────────────────────────────────────────────────────────────

  async listRules() {
    return prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { status: true, itemsAffected: true, createdAt: true },
        },
      },
    });
  }

  async createRule(data: {
    name: string;
    description?: string;
    type: AutomationRuleType;
    config: object;
    isEnabled?: boolean;
    intervalHours?: number;
    createdBy: string;
  }) {
    return prisma.automationRule.create({ data });
  }

  async updateRule(id: string, data: {
    name?: string;
    description?: string;
    config?: object;
    isEnabled?: boolean;
    intervalHours?: number;
  }) {
    return prisma.automationRule.update({ where: { id }, data });
  }

  async deleteRule(id: string) {
    return prisma.automationRule.delete({ where: { id } });
  }

  async getRule(id: string) {
    const rule = await prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new Error(`AutomationRule ${id} not found`);
    return rule;
  }

  async getRuleLogs(ruleId: string, limit = 50) {
    return prisma.automationLog.findMany({
      where: { ruleId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAllLogs(limit = 100) {
    return prisma.automationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        rule: { select: { id: true, name: true, type: true } },
      },
    });
  }

  // ─── Manual trigger ───────────────────────────────────────────────────────

  async runRule(id: string): Promise<{ result: RuleExecutionResult; log: object }> {
    const rule = await this.getRule(id);
    logger.info(`[Automation] Manual run: "${rule.name}" (${rule.type})`);

    let result: RuleExecutionResult;
    let logStatus: 'success' | 'error' | 'skipped' = 'success';
    let logMessage: string | undefined;

    try {
      switch (rule.type as AutomationRuleType) {
        case 'low_stock_po':
          result = await this.runLowStockPO(rule.config as LowStockPoConfig);
          break;
        case 'high_value_notify':
          result = await this.runHighValueNotify(rule.config as HighValueNotifyConfig);
          break;
        case 'overdue_payment_reminder':
          result = await this.runOverduePaymentReminder(rule.config as OverduePaymentReminderConfig);
          break;
        case 'archive_inactive_product':
          result = await this.runArchiveInactiveProduct(rule.config as ArchiveInactiveProductConfig);
          break;
        default:
          result = { itemsAffected: 0, details: [] };
          logStatus = 'skipped';
          logMessage = `Unknown rule type: ${rule.type}`;
      }
    } catch (err: any) {
      result = { itemsAffected: 0, details: [] };
      logStatus = 'error';
      logMessage = err.message || 'Unknown error';
      logger.error(`[Automation] Rule "${rule.name}" failed: ${logMessage}`);
    }

    // Write execution log + update lastRunAt
    const [log] = await Promise.all([
      prisma.automationLog.create({
        data: {
          ruleId: id,
          status: logStatus,
          message: logMessage || `${result.itemsAffected} item(s) affected`,
          itemsAffected: result.itemsAffected,
          details: result.details as any,
        },
      }),
      prisma.automationRule.update({
        where: { id },
        data: { lastRunAt: new Date() },
      }),
    ]);

    logger.info(`[Automation] Rule "${rule.name}" → ${logStatus} (${result.itemsAffected} affected)`);
    return { result, log };
  }

  // ─── Scheduler entry point ────────────────────────────────────────────────

  async runDueRules(): Promise<void> {
    const rules = await prisma.automationRule.findMany({
      where: { isEnabled: true },
    });

    const now = new Date();
    for (const rule of rules) {
      const intervalMs = (rule.intervalHours || 24) * 60 * 60 * 1000;
      const lastRun = rule.lastRunAt ? new Date(rule.lastRunAt).getTime() : 0;
      if (now.getTime() - lastRun >= intervalMs) {
        try {
          await this.runRule(rule.id);
        } catch (err: any) {
          logger.error(`[Automation Scheduler] Rule "${rule.name}" failed: ${err.message}`);
        }
      }
    }
  }

  // ─── Rule #1 — Low Stock Auto PO ────────────────────────────────────────

  private async runLowStockPO(config: LowStockPoConfig): Promise<RuleExecutionResult> {
    // Get all inventory items, aggregate stock per product
    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        product: {
          include: {
            purchaseItems: {
              orderBy: { purchase: { orderDate: 'desc' } },
              take: 5,
              include: {
                purchase: {
                  include: { supplier: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
      },
    });

    // Aggregate stock per product
    const productStockMap = new Map<string, { quantity: number; product: any }>();
    for (const item of inventoryItems) {
      const existing = productStockMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        productStockMap.set(item.productId, { quantity: item.quantity, product: item.product });
      }
    }

    // Find products below reorder level
    const lowStockProducts: Array<{ productId: string; productName: string; quantity: number; reorderLevel: number; supplierId: string; supplierName: string; quantity_to_order: number }> = [];

    for (const [productId, { quantity, product }] of productStockMap.entries()) {
      if (!product.trackInventory || !product.isActive || product.deletedAt) continue;
      if (quantity > product.reorderLevel) continue;

      // Find preferred supplier
      let supplierId = config.preferredSupplierId;
      let supplierName = '';
      if (!supplierId) {
        // Use last-purchase supplier
        const lastPurchase = product.purchaseItems.find((pi: any) => pi.purchase?.supplier);
        if (lastPurchase) {
          supplierId = lastPurchase.purchase.supplier.id;
          supplierName = lastPurchase.purchase.supplier.name;
        }
      } else {
        const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, isActive: true, deletedAt: null } });
        supplierName = supplier?.name || supplierId;
      }

      if (!supplierId) continue; // no supplier found, skip

      // Check if a recent draft PO already covers this product
      const existingDraft = await prisma.purchaseItem.findFirst({
        where: {
          productId,
          purchase: {
            status: { in: ['draft', 'submitted', 'pending_supervisor', 'pending_finance', 'approved'] },
            deletedAt: null,
          },
        },
      });

      if (existingDraft) continue; // already in pipeline

      const quantityToOrder = Math.max(product.reorderLevel * 2 - quantity, product.minStock * 2, 10);
      lowStockProducts.push({
        productId,
        productName: product.name,
        quantity,
        reorderLevel: product.reorderLevel,
        supplierId,
        supplierName,
        quantity_to_order: quantityToOrder,
      });
    }

    if (lowStockProducts.length === 0) {
      return { itemsAffected: 0, details: [] };
    }

    // Group by supplier and create one draft PO per supplier
    const bySupplier = new Map<string, typeof lowStockProducts>();
    for (const p of lowStockProducts) {
      const existing = bySupplier.get(p.supplierId) || [];
      existing.push(p);
      bySupplier.set(p.supplierId, existing);
    }

    const createdPOs: object[] = [];
    const systemUserId = await this.getSystemUserId();

    for (const [supplierId, items] of bySupplier.entries()) {
      const count = await prisma.purchase.count();
      const purchaseNumber = `PO-AUTO-${String(count + 1).padStart(5, '0')}`;

      let subtotal = 0;
      const purchaseItems = items.map((item) => {
        const product = productStockMap.get(item.productId)!.product;
        const unitPrice = parseFloat(product.cost.toString());
        const total = item.quantity_to_order * unitPrice;
        subtotal += total;
        return {
          productId: item.productId,
          quantity: item.quantity_to_order,
          unitPrice,
          discount: 0,
          tax: 0,
          total,
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
          notes: `Auto-generated by Automation Rule: Low-Stock PO. Products: ${items.map(i => i.productName).join(', ')}`,
          createdBy: systemUserId,
          items: { create: purchaseItems },
        },
        include: { supplier: true },
      });

      createdPOs.push({
        purchaseId: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        supplierName: purchase.supplier.name,
        itemCount: items.length,
        total: subtotal,
      });
    }

    // Notify procurement officers
    await notifyByRoles(
      ['super-administrator', 'procurement-officer', 'inventory-manager'],
      'automation_low_stock_po',
      `🤖 Auto PO Created: ${createdPOs.length} purchase order(s)`,
      `Automation detected ${lowStockProducts.length} low-stock product(s) and auto-created ${createdPOs.length} draft purchase order(s). Review and submit for approval.`,
      { createdPOs }
    );

    return { itemsAffected: createdPOs.length, details: createdPOs };
  }

  // ─── Rule #2 — High-Value Purchase Notify ────────────────────────────────

  private async runHighValueNotify(config: HighValueNotifyConfig): Promise<RuleExecutionResult> {
    const threshold = config.threshold || 100000;
    const notifyRoles = config.notifyRoles || ['super-administrator'];

    // Find high-value purchases in pending states not yet notified recently
    const recentCutoff = new Date(Date.now() - 6 * 60 * 60 * 1000); // 6 hours

    const purchases = await prisma.purchase.findMany({
      where: {
        deletedAt: null,
        status: { in: ['draft', 'submitted', 'pending_supervisor', 'pending_finance'] },
        total: { gte: threshold },
        // Avoid re-notifying purchases updated in last 6h (already processed)
        updatedAt: { lt: recentCutoff },
      },
      include: { supplier: { select: { id: true, name: true } } },
    });

    if (purchases.length === 0) {
      return { itemsAffected: 0, details: [] };
    }

    for (const purchase of purchases) {
      await notifyByRoles(
        notifyRoles,
        'automation_high_value_purchase',
        `💰 High-Value Purchase Requires Attention: ${purchase.purchaseNumber}`,
        `Purchase order ${purchase.purchaseNumber} from ${purchase.supplier?.name} totals KSh ${Number(purchase.total).toLocaleString()} and is currently in "${purchase.status}" status. Please review and approve promptly.`,
        { purchaseId: purchase.id, purchaseNumber: purchase.purchaseNumber, total: purchase.total }
      );
    }

    const details = purchases.map(p => ({
      purchaseId: p.id,
      purchaseNumber: p.purchaseNumber,
      supplierName: p.supplier?.name,
      total: p.total,
      status: p.status,
    }));

    return { itemsAffected: purchases.length, details };
  }

  // ─── Rule #3 — Overdue Payment Reminder ──────────────────────────────────

  private async runOverduePaymentReminder(config: OverduePaymentReminderConfig): Promise<RuleExecutionResult> {
    const graceDays = config.graceDays ?? 0;
    const notifyRoles = config.notifyRoles || ['super-administrator'];
    const cutoff = new Date(Date.now() - graceDays * 24 * 60 * 60 * 1000);

    // Find customers with outstanding balances and overdue credit log entries
    const overdueCustomers = await prisma.customerCreditLog.findMany({
      where: {
        type: 'sale_on_credit',
        dueDate: { lt: cutoff },
        // Only where customer still has outstanding balance > 0
        customer: {
          outstandingBalance: { gt: 0 },
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            outstandingBalance: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      distinct: ['customerId'],
    });

    if (overdueCustomers.length === 0) {
      return { itemsAffected: 0, details: [] };
    }

    for (const entry of overdueCustomers) {
      const customer = entry.customer;
      const name = customer.companyName || `${customer.firstName} ${customer.lastName}`.trim();
      const daysOverdue = Math.floor((Date.now() - new Date(entry.dueDate!).getTime()) / (1000 * 60 * 60 * 24));

      await notifyByRoles(
        notifyRoles,
        'automation_overdue_payment',
        `⚠️ Overdue Payment: ${name}`,
        `Customer "${name}" (${customer.email}) has an outstanding balance of KSh ${Number(customer.outstandingBalance).toLocaleString()} that is ${daysOverdue} day(s) overdue. Please follow up.`,
        { customerId: customer.id, name, email: customer.email, outstandingBalance: customer.outstandingBalance, daysOverdue }
      );
    }

    const details = overdueCustomers.map(e => {
      const customer = e.customer;
      return {
        customerId: customer.id,
        customerName: customer.companyName || `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email,
        outstandingBalance: customer.outstandingBalance,
        dueDate: e.dueDate,
      };
    });

    return { itemsAffected: overdueCustomers.length, details };
  }

  // ─── Rule #4 — Archive Inactive Products ─────────────────────────────────

  private async runArchiveInactiveProduct(config: ArchiveInactiveProductConfig): Promise<RuleExecutionResult> {
    const inactiveDays = config.inactiveDays || 90;
    const cutoffDate = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);

    // Get products that have had no sale items since cutoffDate and are currently active
    const activeProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, name: true, sku: true, saleItems: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    const toArchive = activeProducts.filter(product => {
      if (product.saleItems.length === 0) return true; // never sold
      const lastSale = new Date(product.saleItems[0].createdAt);
      return lastSale < cutoffDate;
    });

    if (toArchive.length === 0) {
      return { itemsAffected: 0, details: [] };
    }

    // Archive all identified products
    await prisma.product.updateMany({
      where: { id: { in: toArchive.map(p => p.id) } },
      data: { isActive: false, updatedAt: new Date() },
    });

    // Notify admins
    await notifyByRoles(
      ['super-administrator', 'inventory-manager'],
      'automation_products_archived',
      `📦 ${toArchive.length} Product(s) Archived`,
      `Automation archived ${toArchive.length} product(s) that had no sales activity in the last ${inactiveDays} days.`,
      { archivedCount: toArchive.length, products: toArchive.map(p => p.name).slice(0, 10) }
    );

    const details = toArchive.map(p => ({ productId: p.id, productName: p.name, sku: p.sku }));
    return { itemsAffected: toArchive.length, details };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async getSystemUserId(): Promise<string> {
    const admin = await prisma.user.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
        roles: { some: { role: { slug: 'super-administrator' } } },
      },
      select: { id: true },
    });
    if (!admin) throw new Error('No active super-administrator found to create auto POs');
    return admin.id;
  }
}

export default new AutomationService();
