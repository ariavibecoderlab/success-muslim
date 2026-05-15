import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Database, Shield, HardDrive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceStatus {
  name: string;
  icon: React.ElementType;
  status: 'ok' | 'error' | 'loading';
  detail: string;
}

const AdminSystem = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Database', icon: Database, status: 'loading', detail: 'Checking...' },
    { name: 'Auth Service', icon: Shield, status: 'loading', detail: 'Checking...' },
    { name: 'Storage', icon: HardDrive, status: 'loading', detail: 'Checking...' },
  ]);
  const [recentErrors, setRecentErrors] = useState<{ action: string; module: string; created_at: string }[]>([]);
  const [tableSizes, setTableSizes] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const newServices = [...services];

      // DB check
      const dbStart = Date.now();
      try {
        await api('api-admin', { params: { resource: 'overview-stats' } });
        const dbTime = Date.now() - dbStart;
        newServices[0] = { ...newServices[0], status: 'ok', detail: `${dbTime}ms response` };
      } catch (e: any) {
        newServices[0] = { ...newServices[0], status: 'error', detail: e.message };
      }

      // Auth check
      const { data: session } = await supabase.auth.getSession();
      newServices[1] = {
        ...newServices[1],
        status: session ? 'ok' : 'error',
        detail: session ? 'Authenticated' : 'No session',
      };

      // Storage check
      const { error: storageErr } = await supabase.storage.listBuckets();
      newServices[2] = {
        ...newServices[2],
        status: storageErr ? 'error' : 'ok',
        detail: storageErr ? storageErr.message : 'Online',
      };

      setServices(newServices);

      // Recent errors
      const errors = await api<any[]>('api-admin', { params: { resource: 'user-activity', filter: 'error', limit: '20' } });
      if (errors) setRecentErrors(errors);

      // Table sizes
      const sizes = await api<Record<string, number>>('api-admin', { params: { resource: 'table-sizes' } });
      if (sizes) setTableSizes(sizes);
    };

    checkHealth();
    const i = setInterval(checkHealth, 60000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Health</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        {services.map(s => (
          <Card key={s.name}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2 rounded-lg ${s.status === 'ok' ? 'bg-emerald-500/10' : s.status === 'error' ? 'bg-red-500/10' : 'bg-muted'}`}>
                <s.icon className={`h-5 w-5 ${s.status === 'ok' ? 'text-emerald-500' : s.status === 'error' ? 'text-red-500' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{s.name}</p>
                  {s.status === 'ok' ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : s.status === 'error' ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : null}
                </div>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3">Recent Errors (Last 24h)</h2>
          {recentErrors.length > 0 ? (
            <div className="space-y-2">
              {recentErrors.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px]">Error</Badge>
                    <span>{e.action}</span>
                    <span className="text-muted-foreground">({e.module})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No errors reported. ✅</p>
          )}
        </CardContent>
      </Card>

      {/* Table Row Counts */}
      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold mb-3">Table Row Counts</h2>
          {tableSizes ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(tableSizes)
                .sort(([, a], [, b]) => b - a)
                .map(([table, count]) => (
                  <div key={table} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-xs font-medium truncate mr-2">{table}</span>
                    <span className="text-xs text-muted-foreground font-mono">{Number(count).toLocaleString()}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystem;
