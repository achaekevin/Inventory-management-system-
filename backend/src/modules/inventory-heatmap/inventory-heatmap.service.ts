import prisma from '../../config/database';

export type HeatClassification = 'OVERSTOCK' | 'LOW_STOCK' | 'FAST_MOVING' | 'SLOW_MOVING' | 'NORMAL';

export interface HeatMapItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode: string | null;
  categoryName: string;
  warehouseName: string;
  quantity: number;
  available: number;
  minStock: number;
  reorderLevel: number;
  price: number;
  totalValue: number;
  salesCount30Days: number;
  classification: HeatClassification;
  heatScore: number; // 0 to 100
}

export class InventoryHeatmapService {
  /**
   * Get Inventory Heat Map data and movement metrics
   */
  async getHeatmapData(query: { warehouseId?: string; classification?: string }) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000);

    // Fetch all inventory items
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: query.warehouseId ? { warehouseId: query.warehouseId } : {},
      include: {
        product: {
          include: { category: true, brand: true },
        },
        warehouse: true,
      },
    });

    // Fetch recent sales items for velocity calculations
    const recentSaleItems = await prisma.saleItem.findMany({
      where: {
        createdAt: { gte: sixtyDaysAgo },
      },
    });

    // Map sales counts per product ID
    const salesMap30: Record<string, number> = {};
    const salesMap60: Record<string, number> = {};

    recentSaleItems.forEach((item) => {
      const is30 = new Date(item.createdAt) >= thirtyDaysAgo;
      salesMap60[item.productId] = (salesMap60[item.productId] || 0) + item.quantity;
      if (is30) {
        salesMap30[item.productId] = (salesMap30[item.productId] || 0) + item.quantity;
      }
    });

    const itemsMapped: HeatMapItem[] = inventoryItems.map((item) => {
      const p = item.product;
      const sales30 = salesMap30[p.id] || 0;
      const sales60 = salesMap60[p.id] || 0;
      const price = Number(p.price);
      const totalValue = item.quantity * price;

      let classification: HeatClassification = 'NORMAL';

      if (item.quantity <= p.minStock || item.available <= p.minStock) {
        classification = 'LOW_STOCK';
      } else if (item.quantity > (p.reorderLevel || 10) * 3 || item.quantity > (p.minStock || 5) * 4) {
        classification = 'OVERSTOCK';
      } else if (sales30 >= 15) {
        classification = 'FAST_MOVING';
      } else if (sales60 < 5 && item.quantity >= 10) {
        classification = 'SLOW_MOVING';
      }

      // Calculate Heat Score (0 to 100)
      let heatScore = 50;
      if (classification === 'LOW_STOCK') heatScore = 95; // High urgency
      else if (classification === 'OVERSTOCK') heatScore = 80;
      else if (classification === 'FAST_MOVING') heatScore = 85;
      else if (classification === 'SLOW_MOVING') heatScore = 20;

      return {
        id: item.id,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        barcode: p.barcode,
        categoryName: p.category?.name || 'Uncategorized',
        warehouseName: item.warehouse.name,
        quantity: item.quantity,
        available: item.available,
        minStock: p.minStock,
        reorderLevel: p.reorderLevel,
        price,
        totalValue: Number(totalValue.toFixed(2)),
        salesCount30Days: sales30,
        classification,
        heatScore,
      };
    });

    // Filter by classification if requested
    let filteredItems = itemsMapped;
    if (query.classification && query.classification !== 'ALL') {
      filteredItems = itemsMapped.filter(
        (i) => i.classification === query.classification?.toUpperCase()
      );
    }

    // Counts summary
    const counts = {
      all: itemsMapped.length,
      lowStock: itemsMapped.filter((i) => i.classification === 'LOW_STOCK').length,
      overstock: itemsMapped.filter((i) => i.classification === 'OVERSTOCK').length,
      fastMoving: itemsMapped.filter((i) => i.classification === 'FAST_MOVING').length,
      slowMoving: itemsMapped.filter((i) => i.classification === 'SLOW_MOVING').length,
      normal: itemsMapped.filter((i) => i.classification === 'NORMAL').length,
    };

    const overallHeatIndex =
      itemsMapped.length > 0
        ? Math.round(itemsMapped.reduce((acc, i) => acc + i.heatScore, 0) / itemsMapped.length)
        : 50;

    return {
      heatScore: overallHeatIndex,
      counts,
      items: filteredItems,
    };
  }
}

export default new InventoryHeatmapService();
