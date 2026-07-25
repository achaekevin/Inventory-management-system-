import prisma from '../../config/database';

export type EntityType = 'all' | 'products' | 'customers' | 'suppliers' | 'orders' | 'invoices' | 'users';

export interface SearchOptions {
  q?: string;
  type?: EntityType;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  type: 'product' | 'customer' | 'supplier' | 'order' | 'invoice' | 'user';
  subType?: string;
  title: string;
  subtitle: string;
  url: string;
  status: string;
  createdAt: Date;
  details?: Record<string, any>;
}

export interface GlobalSearchResponse {
  results: SearchResultItem[];
  counts: {
    all: number;
    products: number;
    customers: number;
    suppliers: number;
    orders: number;
    invoices: number;
    users: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export class SearchService {
  /**
   * Perform global search with filters and entity counts
   */
  async globalSearch(options: SearchOptions): Promise<GlobalSearchResponse> {
    const q = options.q ? options.q.trim() : '';
    const selectedType = (options.type || 'all').toLowerCase() as EntityType;
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 20));
    const status = options.status ? options.status.trim() : undefined;

    const dateFilter: any = {};
    if (options.startDate) {
      dateFilter.gte = new Date(options.startDate);
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    let productsList: SearchResultItem[] = [];
    let customersList: SearchResultItem[] = [];
    let suppliersList: SearchResultItem[] = [];
    let ordersList: SearchResultItem[] = [];
    let invoicesList: SearchResultItem[] = [];
    let usersList: SearchResultItem[] = [];

    // 1. PRODUCTS
    if (selectedType === 'all' || selectedType === 'products') {
      const where: any = { deletedAt: null };
      if (q) {
        where.OR = [
          { name: { contains: q } },
          { sku: { contains: q } },
          { barcode: { contains: q } },
          { description: { contains: q } },
        ];
      }
      if (status) {
        if (status.toLowerCase() === 'active') where.isActive = true;
        if (status.toLowerCase() === 'inactive') where.isActive = false;
      }
      if (hasDateFilter) where.createdAt = dateFilter;

      const products = await prisma.product.findMany({
        where,
        take: selectedType === 'products' ? 100 : 20,
        include: { category: true, brand: true },
        orderBy: { createdAt: 'desc' },
      });

      productsList = products.map((p) => ({
        id: p.id,
        type: 'product',
        title: p.name,
        subtitle: `SKU: ${p.sku} | Price: $${Number(p.price).toFixed(2)}${p.category ? ` | ${p.category.name}` : ''}`,
        url: `/products`,
        status: p.isActive ? 'active' : 'inactive',
        createdAt: p.createdAt,
        details: {
          sku: p.sku,
          price: Number(p.price),
          category: p.category?.name,
          brand: p.brand?.name,
        },
      }));
    }

    // 2. CUSTOMERS
    if (selectedType === 'all' || selectedType === 'customers') {
      const where: any = { deletedAt: null };
      if (q) {
        where.OR = [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { companyName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ];
      }
      if (status) {
        if (status.toLowerCase() === 'active') where.isActive = true;
        if (status.toLowerCase() === 'inactive') where.isActive = false;
      }
      if (hasDateFilter) where.createdAt = dateFilter;

      const customers = await prisma.customer.findMany({
        where,
        take: selectedType === 'customers' ? 100 : 20,
        orderBy: { createdAt: 'desc' },
      });

      customersList = customers.map((c) => {
        const name = c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email;
        return {
          id: c.id,
          type: 'customer',
          title: name,
          subtitle: `${c.email} | ${c.phone}`,
          url: `/customers`,
          status: c.isActive ? 'active' : 'inactive',
          createdAt: c.createdAt,
          details: { email: c.email, phone: c.phone, type: c.type },
        };
      });
    }

    // 3. SUPPLIERS
    if (selectedType === 'all' || selectedType === 'suppliers') {
      const where: any = { deletedAt: null };
      if (q) {
        where.OR = [
          { name: { contains: q } },
          { companyName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ];
      }
      if (status) {
        if (status.toLowerCase() === 'active') where.isActive = true;
        if (status.toLowerCase() === 'inactive') where.isActive = false;
      }
      if (hasDateFilter) where.createdAt = dateFilter;

      const suppliers = await prisma.supplier.findMany({
        where,
        take: selectedType === 'suppliers' ? 100 : 20,
        orderBy: { createdAt: 'desc' },
      });

      suppliersList = suppliers.map((s) => ({
        id: s.id,
        type: 'supplier',
        title: s.name || s.companyName || s.email,
        subtitle: `${s.email} | ${s.phone}`,
        url: `/suppliers`,
        status: s.isActive ? 'active' : 'inactive',
        createdAt: s.createdAt,
        details: { companyName: s.companyName, email: s.email, phone: s.phone },
      }));
    }

    // 4. ORDERS (Purchases & Sales)
    if (selectedType === 'all' || selectedType === 'orders') {
      // Purchases
      const pWhere: any = { deletedAt: null };
      if (q) {
        pWhere.OR = [
          { purchaseNumber: { contains: q } },
          { supplier: { name: { contains: q } } },
        ];
      }
      if (status) pWhere.status = { equals: status };
      if (hasDateFilter) pWhere.orderDate = dateFilter;

      const purchases = await prisma.purchase.findMany({
        where: pWhere,
        take: selectedType === 'orders' ? 50 : 10,
        include: { supplier: true },
        orderBy: { createdAt: 'desc' },
      });

      const purchasesMapped: SearchResultItem[] = purchases.map((p) => ({
        id: p.id,
        type: 'order',
        subType: 'Purchase Order',
        title: `PO #${p.purchaseNumber}`,
        subtitle: `Supplier: ${p.supplier?.name || 'N/A'} | Total: $${Number(p.total).toFixed(2)}`,
        url: `/purchases`,
        status: p.status,
        createdAt: p.createdAt,
        details: { number: p.purchaseNumber, total: Number(p.total), supplier: p.supplier?.name },
      }));

      // Sales
      const sWhere: any = { deletedAt: null };
      if (q) {
        sWhere.OR = [
          { saleNumber: { contains: q } },
          { customer: { firstName: { contains: q } } },
          { customer: { lastName: { contains: q } } },
          { customer: { companyName: { contains: q } } },
        ];
      }
      if (status) sWhere.status = { equals: status };
      if (hasDateFilter) sWhere.saleDate = dateFilter;

      const sales = await prisma.sale.findMany({
        where: sWhere,
        take: selectedType === 'orders' ? 50 : 10,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      });

      const salesMapped: SearchResultItem[] = sales.map((s) => ({
        id: s.id,
        type: 'order',
        subType: 'Sales Order',
        title: `Sale #${s.saleNumber}`,
        subtitle: `Customer: ${s.customer ? (s.customer.companyName || `${s.customer.firstName || ''} ${s.customer.lastName || ''}`.trim()) : 'Walk-in Customer'} | Total: $${Number(s.total).toFixed(2)}`,
        url: `/sales`,
        status: s.status,
        createdAt: s.createdAt,
        details: { number: s.saleNumber, total: Number(s.total) },
      }));

      ordersList = [...purchasesMapped, ...salesMapped].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // 5. INVOICES (Sales with invoice numbers or completed sales)
    if (selectedType === 'all' || selectedType === 'invoices') {
      const invWhere: any = { deletedAt: null };
      if (q) {
        invWhere.OR = [
          { invoiceNumber: { contains: q } },
          { saleNumber: { contains: q } },
        ];
      }
      if (status) invWhere.paymentStatus = { equals: status };
      if (hasDateFilter) invWhere.saleDate = dateFilter;

      const invoices = await prisma.sale.findMany({
        where: invWhere,
        take: selectedType === 'invoices' ? 100 : 20,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      });

      invoicesList = invoices.map((inv) => ({
        id: inv.id,
        type: 'invoice',
        title: `Invoice #${inv.invoiceNumber || inv.saleNumber}`,
        subtitle: `Amount: $${Number(inv.total).toFixed(2)} | Payment Status: ${inv.paymentStatus}`,
        url: `/sales`,
        status: inv.paymentStatus,
        createdAt: inv.createdAt,
        details: {
          invoiceNumber: inv.invoiceNumber || inv.saleNumber,
          total: Number(inv.total),
          paymentStatus: inv.paymentStatus,
          paymentMethod: inv.paymentMethod,
        },
      }));
    }

    // 6. USERS
    if (selectedType === 'all' || selectedType === 'users') {
      const where: any = { deletedAt: null };
      if (q) {
        where.OR = [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ];
      }
      if (status) {
        if (status.toLowerCase() === 'active') where.isActive = true;
        if (status.toLowerCase() === 'inactive') where.isActive = false;
      }
      if (hasDateFilter) where.createdAt = dateFilter;

      const users = await prisma.user.findMany({
        where,
        take: selectedType === 'users' ? 100 : 20,
        orderBy: { createdAt: 'desc' },
      });

      usersList = users.map((u) => ({
        id: u.id,
        type: 'user',
        title: `${u.firstName} ${u.lastName}`.trim() || u.email,
        subtitle: `${u.email}${u.phone ? ` | ${u.phone}` : ''}`,
        url: `/users`,
        status: u.isActive ? 'active' : 'inactive',
        createdAt: u.createdAt,
        details: { email: u.email, phone: u.phone },
      }));
    }

    // Calculate total counts
    const counts = {
      all:
        productsList.length +
        customersList.length +
        suppliersList.length +
        ordersList.length +
        invoicesList.length +
        usersList.length,
      products: productsList.length,
      customers: customersList.length,
      suppliers: suppliersList.length,
      orders: ordersList.length,
      invoices: invoicesList.length,
      users: usersList.length,
    };

    // Combine all results if 'all' or pick specific list
    let combinedResults: SearchResultItem[] = [];
    if (selectedType === 'products') combinedResults = productsList;
    else if (selectedType === 'customers') combinedResults = customersList;
    else if (selectedType === 'suppliers') combinedResults = suppliersList;
    else if (selectedType === 'orders') combinedResults = ordersList;
    else if (selectedType === 'invoices') combinedResults = invoicesList;
    else if (selectedType === 'users') combinedResults = usersList;
    else {
      combinedResults = [
        ...productsList,
        ...customersList,
        ...suppliersList,
        ...ordersList,
        ...invoicesList,
        ...usersList,
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const totalResults = combinedResults.length;
    const totalPages = Math.ceil(totalResults / limit) || 1;
    const paginatedResults = combinedResults.slice((page - 1) * limit, page * limit);

    return {
      results: paginatedResults,
      counts,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
    };
  }

  /**
   * Fast autocomplete suggestions for live search & command palette
   */
  async autocomplete(q: string): Promise<SearchResultItem[]> {
    if (!q || q.trim().length < 1) return [];

    const query = q.trim();

    const [products, customers, suppliers, purchases, sales, users] = await Promise.all([
      prisma.product.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: query } },
            { sku: { contains: query } },
          ],
        },
        take: 3,
        select: { id: true, name: true, sku: true, price: true },
      }),
      prisma.customer.findMany({
        where: {
          deletedAt: null,
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { companyName: { contains: query } },
            { email: { contains: query } },
          ],
        },
        take: 3,
        select: { id: true, firstName: true, lastName: true, companyName: true, email: true },
      }),
      prisma.supplier.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: query } },
            { companyName: { contains: query } },
          ],
        },
        take: 3,
        select: { id: true, name: true, companyName: true },
      }),
      prisma.purchase.findMany({
        where: {
          deletedAt: null,
          purchaseNumber: { contains: query },
        },
        take: 2,
        select: { id: true, purchaseNumber: true, total: true, status: true },
      }),
      prisma.sale.findMany({
        where: {
          deletedAt: null,
          OR: [
            { saleNumber: { contains: query } },
            { invoiceNumber: { contains: query } },
          ],
        },
        take: 3,
        select: { id: true, saleNumber: true, invoiceNumber: true, total: true, paymentStatus: true },
      }),
      prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { email: { contains: query } },
          ],
        },
        take: 2,
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
    ]);

    const suggestions: SearchResultItem[] = [];

    products.forEach((p) => {
      suggestions.push({
        id: p.id,
        type: 'product',
        title: p.name,
        subtitle: `Product | SKU: ${p.sku} | $${Number(p.price).toFixed(2)}`,
        url: `/products`,
        status: 'active',
        createdAt: new Date(),
      });
    });

    customers.forEach((c) => {
      suggestions.push({
        id: c.id,
        type: 'customer',
        title: c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        subtitle: `Customer | ${c.email}`,
        url: `/customers`,
        status: 'active',
        createdAt: new Date(),
      });
    });

    suppliers.forEach((s) => {
      suggestions.push({
        id: s.id,
        type: 'supplier',
        title: s.name || s.companyName,
        subtitle: `Supplier`,
        url: `/suppliers`,
        status: 'active',
        createdAt: new Date(),
      });
    });

    purchases.forEach((p) => {
      suggestions.push({
        id: p.id,
        type: 'order',
        subType: 'Purchase Order',
        title: `PO #${p.purchaseNumber}`,
        subtitle: `Purchase Order | Total: $${Number(p.total).toFixed(2)}`,
        url: `/purchases`,
        status: p.status,
        createdAt: new Date(),
      });
    });

    sales.forEach((s) => {
      if (s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          id: s.id,
          type: 'invoice',
          title: `Invoice #${s.invoiceNumber}`,
          subtitle: `Invoice | Total: $${Number(s.total).toFixed(2)}`,
          url: `/sales`,
          status: s.paymentStatus,
          createdAt: new Date(),
        });
      } else {
        suggestions.push({
          id: s.id,
          type: 'order',
          subType: 'Sales Order',
          title: `Sale #${s.saleNumber}`,
          subtitle: `Sales Order | Total: $${Number(s.total).toFixed(2)}`,
          url: `/sales`,
          status: s.paymentStatus,
          createdAt: new Date(),
        });
      }
    });

    users.forEach((u) => {
      suggestions.push({
        id: u.id,
        type: 'user',
        title: `${u.firstName} ${u.lastName}`.trim() || u.email,
        subtitle: `User | ${u.email}`,
        url: `/users`,
        status: 'active',
        createdAt: new Date(),
      });
    });

    return suggestions;
  }
}

export default new SearchService();
