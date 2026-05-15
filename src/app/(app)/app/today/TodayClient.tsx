'use client';

interface TodayClientProps {
  children: React.ReactNode;
}

export function TodayClient({ children }: TodayClientProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
