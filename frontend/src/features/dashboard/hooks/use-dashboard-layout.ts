import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';

export type WidgetSpan = 'col-span-1' | 'col-span-2' | 'col-span-3' | 'col-span-full';

export interface WidgetConfig {
  id: string;
  title: string;
  span: WidgetSpan;
  visible: boolean;
  order: number;
}

export interface PinnedReport {
  id: string;
  name: string;
  format: 'pdf' | 'excel' | 'csv';
  pinnedAt: string;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'stats-summary', title: 'Key Metric Stats', span: 'col-span-full', visible: true, order: 0 },
  { id: 'sales-chart', title: 'Sales Trend Chart', span: 'col-span-2', visible: true, order: 1 },
  { id: 'revenue-chart', title: 'Revenue vs Expense Chart', span: 'col-span-2', visible: true, order: 2 },
  { id: 'category-chart', title: 'Category Distribution', span: 'col-span-1', visible: true, order: 3 },
  { id: 'recent-sales', title: 'Recent Sales', span: 'col-span-1', visible: true, order: 4 },
  { id: 'top-products', title: 'Top Performing Products', span: 'col-span-1', visible: true, order: 5 },
  { id: 'low-stock-alert', title: 'Low Stock Alerts', span: 'col-span-full', visible: true, order: 6 },
  { id: 'pinned-reports', title: 'Pinned Favorite Reports', span: 'col-span-full', visible: true, order: 7 },
];

const DEFAULT_PINNED_REPORTS: PinnedReport[] = [
  { id: 'sales', name: 'Sales Report', format: 'excel', pinnedAt: new Date().toISOString() },
  { id: 'inventory', name: 'Inventory Report', format: 'pdf', pinnedAt: new Date().toISOString() },
];

export function useDashboardLayout() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const LAYOUT_KEY = `dashboard_layout_${userId}`;
  const PINNED_KEY = `dashboard_pinned_reports_${userId}`;

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [pinnedReports, setPinnedReports] = useState<PinnedReport[]>(DEFAULT_PINNED_REPORTS);

  // Load layout from localStorage
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(LAYOUT_KEY);
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with DEFAULT_WIDGETS to ensure newly added widgets appear
          const merged = DEFAULT_WIDGETS.map((def) => {
            const found = parsed.find((p: WidgetConfig) => p.id === def.id);
            return found ? { ...def, ...found } : def;
          });
          merged.sort((a, b) => a.order - b.order);
          setWidgets(merged);
        }
      }

      const savedPinned = localStorage.getItem(PINNED_KEY);
      if (savedPinned) {
        setPinnedReports(JSON.parse(savedPinned));
      }
    } catch (e) {
      console.warn('Failed to load saved dashboard layout:', e);
    }
  }, [LAYOUT_KEY, PINNED_KEY]);

  // Save layout to localStorage
  const saveLayout = useCallback(
    (newWidgets: WidgetConfig[]) => {
      setWidgets(newWidgets);
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(newWidgets));
    },
    [LAYOUT_KEY]
  );

  const savePinnedReports = useCallback(
    (newPinned: PinnedReport[]) => {
      setPinnedReports(newPinned);
      localStorage.setItem(PINNED_KEY, JSON.stringify(newPinned));
    },
    [PINNED_KEY]
  );

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const sorted = [...widgets].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((w) => w.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Swap order
    const tempOrder = sorted[index].order;
    sorted[index].order = sorted[targetIndex].order;
    sorted[targetIndex].order = tempOrder;

    sorted.sort((a, b) => a.order - b.order);
    saveLayout(sorted);
  };

  const resizeWidget = (id: string, span: WidgetSpan) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, span } : w));
    saveLayout(updated);
  };

  const toggleWidgetVisibility = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    saveLayout(updated);
  };

  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem(LAYOUT_KEY);
  };

  const togglePinReport = (report: { id: string; name: string }) => {
    const exists = pinnedReports.some((r) => r.id === report.id);
    let updated: PinnedReport[];
    if (exists) {
      updated = pinnedReports.filter((r) => r.id !== report.id);
    } else {
      updated = [
        ...pinnedReports,
        { id: report.id, name: report.name, format: 'pdf', pinnedAt: new Date().toISOString() },
      ];
    }
    savePinnedReports(updated);
  };

  return {
    isEditMode,
    setIsEditMode,
    widgets: widgets.filter((w) => isEditMode || w.visible),
    allWidgets: widgets,
    pinnedReports,
    moveWidget,
    resizeWidget,
    toggleWidgetVisibility,
    resetLayout,
    togglePinReport,
    isReportPinned: (id: string) => pinnedReports.some((r) => r.id === id),
  };
}
