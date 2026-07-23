import prisma from '../../config/database';

export class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get sales stats
    const [todaySales, monthSales, lastMonthSales, totalSales] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: startOfToday },
          status: 'completed',
          deletedAt: null,
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: startOfMonth },
          status: 'completed',
          deletedAt: null,
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: 'completed',
          deletedAt: null,
        },
        _sum: { total: true },
      }),
      prisma.sale.count({
        where: {
          status: 'completed',
          deletedAt: null,
        },
      }),
    ]);

    // Get purchase stats
    const [monthPurchases, totalPurchases] = await Promise.all([
      prisma.purchase.aggregate({
        where: {
          orderDate: { gte: startOfMonth },
          deletedAt: null,
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.purchase.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    // Get inventory stats
    const allInventoryItems = await prisma.inventoryItem.findMany({
      include: {
        product: {
          select: {
            minStock: true,
            cost: true,
          },
        },
      },
    });

    const totalProducts = await prisma.product.count({
      where: {
        deletedAt: null,
        isActive: true,
      },
    });

    const lowStockCount = allInventoryItems.filter(
      (item) => item.quantity > 0 && item.quantity <= (item.product.minStock || 0)
    ).length;

    const outOfStockCount = allInventoryItems.filter((item) => item.quantity === 0).length;

    const inventoryValue = allInventoryItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.cost || 0),
      0
    );



    // Get customer stats
    const [totalCustomers, activeCustomers] = await Promise.all([
      prisma.customer.count({
        where: {
          deletedAt: null,
        },
      }),
      prisma.customer.count({
        where: {
          deletedAt: null,
          isActive: true,
        },
      }),
    ]);

    // Calculate growth percentages
    const salesGrowth =
      Number(lastMonthSales._sum.total) > 0
        ? ((Number(monthSales._sum.total || 0) - Number(lastMonthSales._sum.total)) /
            Number(lastMonthSales._sum.total)) *
          100
        : 0;

    return {
      sales: {
        today: {
          amount: Number(todaySales._sum.total || 0),
          count: todaySales._count,
        },
        thisMonth: {
          amount: Number(monthSales._sum.total || 0),
          count: monthSales._count,
          growth: salesGrowth,
        },
        total: totalSales,
      },
      purchases: {
        thisMonth: {
          amount: Number(monthPurchases._sum.total || 0),
          count: monthPurchases._count,
        },
        total: totalPurchases,
      },
      inventory: {
        totalProducts,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalValue: inventoryValue,
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
      },
    };
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10) {
    const activities = await prisma.activityLog.findMany({
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return activities.map((activity) => ({
      id: activity.id,
      user: activity.user,
      action: activity.action,
      module: activity.module,
      details: activity.details,
      timestamp: activity.createdAt,
    }));
  }

  /**
   * Get top selling products
   */
  async getTopSellingProducts(limit: number = 10, days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          saleDate: { gte: fromDate },
          status: 'completed',
          deletedAt: null,
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const products = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        });

        return {
          product,
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      })
    );

    return products;
  }

  /**
   * Get recent sales
   */
  async getRecentSales(limit: number = 10) {
    const sales = await prisma.sale.findMany({
      take: limit,
      where: {
        deletedAt: null,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    return sales.map((sale) => ({
      id: sale.id,
      saleNumber: sale.saleNumber,
      invoiceNumber: sale.invoiceNumber,
      customer: sale.customer,
      total: sale.total,
      status: sale.status,
      paymentStatus: sale.paymentStatus,
      date: sale.saleDate,
    }));
  }

  /**
   * Get sales chart data
   */
  async getSalesChartData(days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const sales = await prisma.sale.findMany({
      where: {
        saleDate: { gte: fromDate },
        status: 'completed',
        deletedAt: null,
      },
      select: {
        saleDate: true,
        total: true,
      },
      orderBy: {
        saleDate: 'asc',
      },
    });

    // Group by date
    const salesByDate = sales.reduce((acc: any, sale) => {
      const date = sale.saleDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 };
      }
      acc[date].total += Number(sale.total);
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(salesByDate);
  }

  /**
   * Get payment methods distribution
   */
  async getPaymentMethodsDistribution(days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const payments = await prisma.payment.groupBy({
      by: ['method'],
      where: {
        createdAt: { gte: fromDate },
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return payments.map((payment) => ({
      method: payment.method,
      amount: Number(payment._sum.amount || 0),
      count: payment._count,
    }));
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(limit: number = 10) {
    const inventory = await prisma.inventoryItem.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            minStock: true,
            reorderLevel: true,
          },
        },
        warehouse: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
    });

    const lowStockItems = inventory.filter(
      (item) => item.quantity === 0 || item.quantity <= (item.product.minStock || 0)
    ).slice(0, limit);

    return lowStockItems.map((item) => ({
      product: item.product,
      warehouse: item.warehouse.name,
      currentStock: item.quantity,
      minStock: item.product.minStock,
      reorderLevel: item.product.reorderLevel,
      status: item.quantity === 0 ? 'out_of_stock' : 'low_stock',
    }));
  }

  /**
   * Get pending orders summary
   */
  async getPendingOrders() {
    const [pendingPurchases, pendingSales] = await Promise.all([
      prisma.purchase.count({
        where: {
          status: {
            in: ['pending', 'approved'],
          },
          deletedAt: null,
        },
      }),
      prisma.sale.count({
        where: {
          paymentStatus: {
            in: ['pending', 'partial'],
          },
          deletedAt: null,
        },
      }),
    ]);

    return {
      purchases: pendingPurchases,
      sales: pendingSales,
    };
  }
}

export default new DashboardService();
