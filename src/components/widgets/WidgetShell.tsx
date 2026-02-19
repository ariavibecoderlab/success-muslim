import { Suspense, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { WidgetSize } from '@/lib/widget-registry';

interface WidgetShellProps {
  size: WidgetSize;
  index: number;
  children: ReactNode;
  className?: string;
}

const sizeClasses: Record<WidgetSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-2',
  large: 'col-span-2',
};

function WidgetSkeleton({ size }: { size: WidgetSize }) {
  return (
    <Card className={cn(sizeClasses[size])}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );
}

function WidgetErrorFallback() {
  return (
    <Card className="col-span-2 opacity-50">
      <CardContent className="p-4 text-center text-xs text-muted-foreground">
        Widget unavailable
      </CardContent>
    </Card>
  );
}

class WidgetErrorBoundary extends React.Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.fallback : this.props.children;
  }
  get fallback() { return this.props.fallback; }
}

import React from 'react';

export default function WidgetShell({ size, index, children, className }: WidgetShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className={cn(sizeClasses[size], className)}
    >
      <WidgetErrorBoundary fallback={<WidgetErrorFallback />}>
        <Suspense fallback={<WidgetSkeleton size={size} />}>
          {children}
        </Suspense>
      </WidgetErrorBoundary>
    </motion.div>
  );
}
