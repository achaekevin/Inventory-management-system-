import React from 'react';
import {
  SlidersHorizontal, Check, RotateCcw, ArrowUp, ArrowDown,
  Eye, EyeOff, Maximize2, MoveHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WidgetConfig, WidgetSpan } from '../hooks/use-dashboard-layout';

interface DashboardCustomizerProps {
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  allWidgets: WidgetConfig[];
  resetLayout: () => void;
  toggleWidgetVisibility: (id: string) => void;
}

interface WidgetCardControlsProps {
  widget: WidgetConfig;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onResize: (span: WidgetSpan) => void;
  onToggleVisibility: () => void;
}

export const WidgetCardControls: React.FC<WidgetCardControlsProps> = ({
  widget,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onResize,
  onToggleVisibility,
}) => {
  return (
    <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-background/95 backdrop-blur border rounded-lg p-1 shadow-md animate-in fade-in duration-200">
      <Button
        size="icon"
        variant="ghost"
        disabled={isFirst}
        onClick={onMoveUp}
        className="h-6 w-6 text-xs"
        title="Move Up"
      >
        <ArrowUp className="h-3 w-3" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        disabled={isLast}
        onClick={onMoveDown}
        className="h-6 w-6 text-xs"
        title="Move Down"
      >
        <ArrowDown className="h-3 w-3" />
      </Button>

      {/* Resize Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-xs" title="Resize Card Width">
            <MoveHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 text-xs">
          <DropdownMenuLabel>Card Width</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onResize('col-span-1')}>
            1 Column (33%) {widget.span === 'col-span-1' && '✓'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onResize('col-span-2')}>
            2 Columns (66%) {widget.span === 'col-span-2' && '✓'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onResize('col-span-3')}>
            3 Columns (75%) {widget.span === 'col-span-3' && '✓'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onResize('col-span-full')}>
            Full Width (100%) {widget.span === 'col-span-full' && '✓'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="icon"
        variant="ghost"
        onClick={onToggleVisibility}
        className={`h-6 w-6 text-xs ${!widget.visible ? 'text-destructive' : ''}`}
        title={widget.visible ? 'Hide Widget' : 'Show Widget'}
      >
        {widget.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      </Button>
    </div>
  );
};

export const DashboardCustomizerToolbar: React.FC<DashboardCustomizerProps> = ({
  isEditMode,
  setIsEditMode,
  allWidgets,
  resetLayout,
  toggleWidgetVisibility,
}) => {
  return (
    <div className="flex items-center gap-2">
      {isEditMode ? (
        <>
          {/* Widget Visibility Drawer */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5" /> Widgets ({allWidgets.filter((w) => w.visible).length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Show / Hide Widgets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allWidgets.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => toggleWidgetVisibility(w.id)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <span>{w.title}</span>
                  {w.visible ? (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-300">
                      Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
                      Hidden
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="ghost"
            onClick={resetLayout}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Default
          </Button>

          <Button
            size="sm"
            onClick={() => setIsEditMode(false)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="h-3.5 w-3.5" /> Done Editing
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditMode(true)}
          className="gap-1.5 text-xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Customize Layout
        </Button>
      )}
    </div>
  );
};
