import React from 'react';
import { Bookmark, FileSpreadsheet, FileText, ArrowUpRight, Pin, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router';
import { PinnedReport } from '../hooks/use-dashboard-layout';

interface PinnedReportsWidgetProps {
  reports: PinnedReport[];
  onUnpin: (id: string) => void;
}

export const PinnedReportsWidget: React.FC<PinnedReportsWidgetProps> = ({ reports, onUnpin }) => {
  const navigate = useNavigate();

  return (
    <Card className="h-full border bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Pinned Favorite Reports
                <Badge variant="secondary" className="text-xs px-2">
                  {reports.length} Pinned
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Quick access & 1-click export for your saved reports
              </CardDescription>
            </div>
          </div>
          <Button asChild size="sm" variant="ghost" className="gap-1 text-xs">
            <Link to="/reports">
              All Reports <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
            <Pin className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No pinned reports yet</p>
            <p className="text-xs max-w-xs">
              Go to the Reports page and click "Pin to Dashboard" to keep your most-used reports right here.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
              <Link to="/reports">Explore Reports</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="group relative flex flex-col justify-between rounded-xl border bg-background/50 p-3.5 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-sm leading-tight text-foreground">
                      {report.name}
                    </p>
                    <button
                      onClick={() => onUnpin(report.id)}
                      title="Unpin report"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Pinned {new Date(report.pinnedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/reports')}
                    className="flex-1 h-7 text-xs gap-1"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
                    Open Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
