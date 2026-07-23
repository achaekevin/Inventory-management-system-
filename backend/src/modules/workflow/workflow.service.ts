import prisma from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors/AppError';
import logger from '../../config/logger';

// ─── Status machine ──────────────────────────────────────────────────────────

export type WorkflowStatus =
  | 'draft'
  | 'submitted'
  | 'pending_supervisor'
  | 'pending_finance'
  | 'approved'
  | 'ordered'
  | 'received'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type WorkflowStep =
  | 'submitted'
  | 'supervisor_approved'
  | 'supervisor_rejected'
  | 'finance_approved'
  | 'finance_rejected'
  | 'ordered'
  | 'received';

// Roles allowed to perform each action
const ROLE_ACTIONS: Record<string, string[]> = {
  submit: ['super-administrator', 'procurement-officer', 'inventory-manager'],
  supervisor_approve: ['super-administrator', 'supervisor', 'operations-manager'],
  supervisor_reject: ['super-administrator', 'supervisor', 'operations-manager'],
  finance_approve: ['super-administrator', 'finance-officer', 'finance-manager'],
  finance_reject: ['super-administrator', 'finance-officer', 'finance-manager'],
  place_order: ['super-administrator', 'procurement-officer'],
  receive_goods: ['super-administrator', 'warehouse-manager', 'inventory-manager'],
};

// ─── Helper: notify users by roles ──────────────────────────────────────────

async function notifyByRoles(
  roleSlugs: string[],
  type: string,
  title: string,
  message: string,
  data?: object
) {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      roles: { some: { role: { slug: { in: roleSlugs } } } },
    },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
    })),
  });
}

// ─── Helper: get user roles ──────────────────────────────────────────────────

async function getUserRoleSlugs(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { select: { slug: true } } },
  });
  return userRoles.map((ur) => ur.role.slug);
}

// ─── Workflow Service ─────────────────────────────────────────────────────────

export class WorkflowService {
  /**
   * Get purchase with approval steps
   */
  async getPurchaseWithHistory(purchaseId: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        supplier: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
        approvalSteps: {
          orderBy: { createdAt: 'asc' },
          include: {
            // actorId is a string - we join manually
          },
        },
      },
    });

    if (!purchase || purchase.deletedAt) {
      throw new NotFoundError('Purchase not found');
    }

    // Enrich steps with actor names
    const actorIds = [...new Set(purchase.approvalSteps.map((s) => s.actorId))];
    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const actorMap = new Map(actors.map((a) => [a.id, a]));

    const enrichedSteps = purchase.approvalSteps.map((step) => ({
      ...step,
      actor: actorMap.get(step.actorId) || null,
    }));

    return { ...purchase, approvalSteps: enrichedSteps };
  }

  /**
   * GET /workflow/purchases/pending
   * Returns purchases that need action from the requesting user's role
   */
  async getPendingForUser(userId: string) {
    const roleSlugs = await getUserRoleSlugs(userId);
    const isSuperAdmin = roleSlugs.includes('super-administrator');

    const statusFilters: WorkflowStatus[] = [];

    if (isSuperAdmin || roleSlugs.some((r) => ROLE_ACTIONS.supervisor_approve.includes(r))) {
      statusFilters.push('submitted', 'pending_supervisor');
    }
    if (isSuperAdmin || roleSlugs.some((r) => ROLE_ACTIONS.finance_approve.includes(r))) {
      statusFilters.push('pending_finance');
    }
    if (isSuperAdmin || roleSlugs.some((r) => ROLE_ACTIONS.place_order.includes(r))) {
      statusFilters.push('approved');
    }
    if (isSuperAdmin || roleSlugs.some((r) => ROLE_ACTIONS.receive_goods.includes(r))) {
      statusFilters.push('ordered');
    }

    const uniqueStatuses = [...new Set(statusFilters)];

    if (uniqueStatuses.length === 0) return [];

    return prisma.purchase.findMany({
      where: { status: { in: uniqueStatuses }, deletedAt: null },
      include: {
        supplier: { select: { id: true, name: true } },
        items: { select: { id: true } },
        approvalSteps: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get all workflow purchases (admin view)
   */
  async getAllWorkflowPurchases(filters?: { status?: string; search?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { purchaseNumber: { contains: filters.search } },
        { supplier: { name: { contains: filters.search } } },
      ];
    }

    return prisma.purchase.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
        items: { select: { id: true } },
        approvalSteps: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ─── State transitions ────────────────────────────────────────────────────

  /**
   * Submit a draft purchase for approval
   */
  async submitForApproval(purchaseId: string, userId: string, comment?: string) {
    const purchase = await this.getPurchaseWithHistory(purchaseId);

    if (purchase.status !== 'draft') {
      throw new BadRequestError(`Cannot submit a purchase with status "${purchase.status}"`);
    }

    await this.transition(purchaseId, userId, 'submitted', 'pending_supervisor', comment);

    await notifyByRoles(
      ROLE_ACTIONS.supervisor_approve,
      'purchase_submitted',
      `📋 Purchase ${purchase.purchaseNumber} submitted for approval`,
      `Purchase order ${purchase.purchaseNumber} has been submitted and requires your supervisor approval.`,
      { purchaseId, purchaseNumber: purchase.purchaseNumber }
    );

    logger.info(`Purchase ${purchase.purchaseNumber} submitted by ${userId}`);
    return this.getPurchaseWithHistory(purchaseId);
  }

  /**
   * Supervisor approves the purchase
   */
  async supervisorApprove(purchaseId: string, userId: string, comment?: string) {
    const purchase = await this.getPurchaseWithHistory(purchaseId);

    if (purchase.status !== 'submitted' && purchase.status !== 'pending_supervisor') {
      throw new BadRequestError(`Cannot approve at this stage: "${purchase.status}"`);
    }

    await this.checkRole(userId, ROLE_ACTIONS.supervisor_approve);
    await this.transition(purchaseId, userId, 'supervisor_approved', 'pending_finance', comment);

    await notifyByRoles(
      ROLE_ACTIONS.finance_approve,
      'purchase_supervisor_approved',
      `✅ Purchase ${purchase.purchaseNumber} approved by Supervisor`,
      `Purchase ${purchase.purchaseNumber} passed supervisor review and now requires finance approval.`,
      { purchaseId, purchaseNumber: purchase.purchaseNumber }
    );

    logger.info(`Purchase ${purchase.purchaseNumber} supervisor-approved by ${userId}`);
    return this.getPurchaseWithHistory(purchaseId);
  }

  /**
   * Supervisor rejects the purchase
   */
  async supervisorReject(purchaseId: string, userId: string, comment?: string) {
    const purchase = await this.getPurchaseWithHistory(purchaseId);

    if (purchase.status !== 'submitted' && purchase.status !== 'pending_supervisor') {
      throw new BadRequestError(`Cannot reject at this stage: "${purchase.status}"`);
    }

    await this.checkRole(userId, ROLE_ACTIONS.supervisor_reject);
    await this.transition(purchaseId, userId, 'supervisor_rejected', 'rejected', comment);

    await notifyByRoles(
      ROLE_ACTIONS.submit,
      'purchase_rejected',
      `❌ Purchase ${purchase.purchaseNumber} rejected by Supervisor`,
      `Purchase ${purchase.purchaseNumber} was rejected by the supervisor${comment ? `: ${comment}` : '.'}.`,
      { purchaseId, purchaseNumber: purchase.purchaseNumber }
    );

    logger.info(`Purchase ${purchase.purchaseNumber} supervisor-rejected by ${userId}`);
    return this.getPurchaseWithHistory(purchaseId);
  }

  /**
   * Finance approves the purchase
   */
  async financeApprove(purchaseId: string, userId: string, comment?: string) {
    const purchase = await this.getPurchaseWithHistory(purchaseId);

    if (purchase.status !== 'pending_finance') {
      throw new BadRequestError(`Cannot finance-approve at this stage: "${purchase.status}"`);
    }

    await this.checkRole(userId, ROLE_ACTIONS.finance_approve);
    await this.transition(purchaseId, userId, 'finance_approved', 'approved', comment);

    // Also stamp the legacy approvedBy field
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { approvedBy: userId, approvedAt: new Date() },
    });

    await notifyByRoles(
      ROLE_ACTIONS.place_order,
      'purchase_finance_approved',
      `💰 Purchase ${purchase.purchaseNumber} fully approved`,
      `Purchase ${purchase.purchaseNumber} has passed finance review. Ready to place supplier order.`,
      { purchaseId, purchaseNumber: purchase.purchaseNumber }
    );

    logger.info(`Purchase ${purchase.purchaseNumber} finance-approved by ${userId}`);
    return this.getPurchaseWithHistory(purchaseId);
  }

  /**
   * Finance rejects the purchase
   */
  async financeReject(purchaseId: string, userId: string, comment?: string) {
    const purchase = await this.getPurchaseWithHistory(purchaseId);

    if (purchase.status !== 'pending_finance') {
      throw new BadRequestError(`Cannot finance-reject at this stage: "${purchase.status}"`);
    }

    await this.checkRole(userId, ROLE_ACTIONS.finance_reject);
    await this.transition(purchaseId, userId, 'finance_rejected', 'rejected', comment);

    await notifyByRoles(
      ROLE_ACTIONS.submit,
      'purchase_rejected',
      `❌ Purchase ${purchase.purchaseNumber} rejected by Finance`,
      `Purchase ${purchase.purchaseNumber} was rejected by finance${comment ? `: ${comment}` : '.'}.`,
      { purchaseId, purchaseNumber: purchase.purchaseNumber }
    );

    logger.info(`Purchase ${purchase.purchaseNumber} finance-rejected by ${userId}`);
    return this.getPurchaseWithHistory(purchaseId);
  }

  /**
   * Place the supplier order (approved → ordered)
   */
  async placeOrder(purchaseId: string, userId: string, comment?: string) {
    const purchase = await this.getPurchaseWithHistory(purchaseId);

    if (purchase.status !== 'approved') {
      throw new BadRequestError(`Cannot place order at this stage: "${purchase.status}"`);
    }

    await this.checkRole(userId, ROLE_ACTIONS.place_order);
    await this.transition(purchaseId, userId, 'ordered', 'ordered', comment);

    await notifyByRoles(
      ROLE_ACTIONS.receive_goods,
      'purchase_ordered',
      `🚚 Purchase ${purchase.purchaseNumber} — order placed with supplier`,
      `Order ${purchase.purchaseNumber} has been sent to the supplier. Awaiting goods receipt.`,
      { purchaseId, purchaseNumber: purchase.purchaseNumber }
    );

    logger.info(`Purchase ${purchase.purchaseNumber} order placed by ${userId}`);
    return this.getPurchaseWithHistory(purchaseId);
  }

  /**
   * Mark goods as received (ordered → received/completed)
   */
  async receiveGoods(purchaseId: string, userId: string, comment?: string) {
    const purchase = await this.getPurchaseWithHistory(purchaseId);

    if (purchase.status !== 'ordered') {
      throw new BadRequestError(`Cannot receive goods at this stage: "${purchase.status}"`);
    }

    await this.checkRole(userId, ROLE_ACTIONS.receive_goods);

    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { receivedDate: new Date() },
    });

    await this.transition(purchaseId, userId, 'received', 'completed', comment);

    logger.info(`Purchase ${purchase.purchaseNumber} goods received by ${userId}`);
    return this.getPurchaseWithHistory(purchaseId);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async transition(
    purchaseId: string,
    actorId: string,
    step: WorkflowStep,
    newStatus: WorkflowStatus,
    comment?: string
  ) {
    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: newStatus, updatedAt: new Date() },
      }),
      prisma.purchaseApprovalStep.create({
        data: { purchaseId, step, actorId, comment: comment || null },
      }),
    ]);
  }

  private async checkRole(userId: string, allowedRoles: string[]) {
    const userRoles = await getUserRoleSlugs(userId);
    const hasPermission = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasPermission) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
  }
}

export default new WorkflowService();
