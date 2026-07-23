import prisma from '../../config/database';

export class ReportService {
  /**
   * Get sales report
   */
  async getSalesReport(fromDate: Date, toDate: Date, _groupBy: 'day' | 'week' | 'month' = 'day') {
    const sales = await prisma.sale.findMany({
      where: {
        saleDate: {
          gte: fromDate,
          lte: toDate,
        },
        deletedAt: null,
        status: 'completed',
      },
      include: {
        items: true,
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
        saleDate: 'asc',
      },
    });

    // Calculate totals
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.length, 0);
    const totalQuantity = sales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    return {
      summary: {
        totalSales,
        totalOrders: sales.length,
        totalItems,
        totalQuantity,
        averageOrderValue: sales.length > 0 ? totalSales / sales.length : 0,
      },
      sales: sales.map((sale) => ({
        id: sale.id,
        saleNumber: sale.saleNumber,
        invoiceNumber: sale.invoiceNumber,
        date: sale.saleDate,
        customer: sale.customer,
        subtotal: sale.subtotal,
        tax: sale.tax,
        discount: sale.discount,
        total: sale.total,
        itemsCount: sale.items.length,
        paymentStatus: sale.paymentStatus,
      })),
    };
  }

  /**
   * Get purchase report
   */
  async getPurchaseReport(fromDate: Date, toDate: Date) {
    const purchases = await prisma.purchase.findMany({
      where: {
        orderDate: {
          gte: fromDate,
          lte: toDate,
        },
        deletedAt: null,
      },
      include: {
        items: true,
        supplier: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        orderDate: 'asc',
      },
    });

    const totalPurchases = purchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);
    const totalItems = purchases.reduce((sum, purchase) => sum + purchase.items.length, 0);

    return {
      summary: {
        totalPurchases,
        totalOrders: purchases.length,
        totalItems,
        averageOrderValue: purchases.length > 0 ? totalPurchases / purchases.length : 0,
      },
      purchases: purchases.map((purchase) => ({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        date: purchase.orderDate,
        supplier: purchase.supplier,
        subtotal: purchase.subtotal,
        tax: purchase.tax,
        discount: purchase.discount,
        shipping: purchase.shipping,
        total: purchase.total,
        status: purchase.status,
        itemsCount: purchase.items.length,
      })),
    };
  }

  /**
   * Get inventory report
   */
  async getInventoryReport(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const inventory = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            cost: true,
            minStock: true,
            reorderLevel: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Calculate totals
    const totalValue = inventory.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.cost),
      0
    );
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(
      (item) => item.quantity <= item.product.minStock
    ).length;
    const outOfStockItems = inventory.filter((item) => item.quantity === 0).length;

    return {
      summary: {
        totalValue,
        totalItems,
        lowStockItems,
        outOfStockItems,
      },
      inventory: inventory.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        category: item.product.category.name,
        brand: item.product.brand?.name,
        warehouse: item.warehouse.name,
        quantity: item.quantity,
        available: item.available,
        reserved: item.reserved,
        minStock: item.product.minStock,
        reorderLevel: item.product.reorderLevel,
        cost: item.product.cost,
        price: item.product.price,
        value: item.quantity * Number(item.product.cost),
        status:
          item.quantity === 0
            ? 'out_of_stock'
            : item.quantity <= item.product.minStock
            ? 'low_stock'
            : 'in_stock',
      })),
    };
  }

  /**
   * Get product performance report
   */
  async getProductPerformanceReport(fromDate: Date, toDate: Date, limit: number = 20) {
    const salesData = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          saleDate: {
            gte: fromDate,
            lte: toDate,
          },
          deletedAt: null,
          status: 'completed',
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: limit,
    });

    const products = await Promise.all(
      salesData.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            cost: true,
            category: {
              select: {
                name: true,
              },
            },
            brand: {
              select: {
                name: true,
              },
            },
          },
        });

        return {
          product: product,
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
          ordersCount: item._count,
          profit: Number(item._sum.total || 0) - (item._sum.quantity || 0) * Number(product?.cost || 0),
        };
      })
    );

    return {
      topProducts: products,
    };
  }

  /**
   * Get top customers report
   */
  async getTopCustomersReport(fromDate: Date, toDate: Date, limit: number = 10) {
    const topSales = await prisma.sale.groupBy({
      by: ['customerId'],
      where: {
        saleDate: {
          gte: fromDate,
          lte: toDate,
        },
        deletedAt: null,
        status: 'completed',
        customerId: {
          not: null,
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: limit,
    });

    const customers = await Promise.all(
      topSales.map(async (item) => {
        if (!item.customerId) return null;

        const customer = await prisma.customer.findUnique({
          where: { id: item.customerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
            type: true,
          },
        });

        return {
          customer: customer,
          totalPurchases: item._sum.total || 0,
          ordersCount: item._count,
          averageOrderValue: Number(item._sum.total || 0) / item._count,
        };
      })
    );

    return {
      topCustomers: customers,
    };
  }

  /**
   * Get profit and loss report
   */
  async getProfitLossReport(fromDate: Date, toDate: Date) {
    // Get sales revenue
    const sales = await prisma.sale.aggregate({
      where: {
        saleDate: {
          gte: fromDate,
          lte: toDate,
        },
        deletedAt: null,
        status: 'completed',
      },
      _sum: {
        subtotal: true,
        tax: true,
        discount: true,
        total: true,
      },
    });

    // Get cost of goods sold (from sale items)
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          saleDate: {
            gte: fromDate,
            lte: toDate,
          },
          deletedAt: null,
          status: 'completed',
        },
      },
      include: {
        product: {
          select: {
            cost: true,
          },
        },
      },
    });

    const costOfGoodsSold = saleItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.cost),
      0
    );

    // Get purchase expenses
    const purchases = await prisma.purchase.aggregate({
      where: {
        orderDate: {
          gte: fromDate,
          lte: toDate,
        },
        deletedAt: null,
        status: {
          in: ['completed', 'received'],
        },
      },
      _sum: {
        total: true,
      },
    });

    const revenue = Number(sales._sum.total || 0);
    const grossProfit = revenue - costOfGoodsSold;
    const netProfit = grossProfit; // Simplified - can add operating expenses

    return {
      revenue,
      costOfGoodsSold,
      grossProfit,
      grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      netProfit,
      netProfitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      totalPurchases: Number(purchases._sum.total || 0),
      period: {
        from: fromDate,
        to: toDate,
      },
    };
  }

  /**
   * Get low stock report
   */
  async getLowStockReport() {
    const inventory = await prisma.inventoryItem.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            minStock: true,
            reorderLevel: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        warehouse: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    const lowStockInventory = inventory.filter(
      (item) => item.quantity === 0 || item.quantity <= (item.product.minStock || 0)
    );

    return {
      items: lowStockInventory.map((item) => ({
        product: item.product,
        warehouse: item.warehouse,
        currentStock: item.quantity,
        minStock: item.product.minStock,
        reorderLevel: item.product.reorderLevel,
        status: item.quantity === 0 ? 'out_of_stock' : 'low_stock',
      })),
      summary: {
        totalItems: lowStockInventory.length,
        outOfStock: lowStockInventory.filter((i) => i.quantity === 0).length,
        lowStock: lowStockInventory.filter(
          (i) => i.quantity > 0 && i.quantity <= i.product.minStock
        ).length,
      },
    };
  }
}

export default new ReportService();
