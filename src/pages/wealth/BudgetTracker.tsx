import { useState, useEffect, useMemo } from 'react';
import {
  Plus, TrendingUp, TrendingDown, Wallet, Trash2, RefreshCw,
  ChevronLeft, ChevronRight, Search, Filter, ArrowUpDown,
  Package,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import SubPageLayout from '@/components/SubPageLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, parseISO, addMonths, subMonths } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ALL_CATEGORIES,
} from '@/lib/wealth-categories';

const RECURRENCE_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const WEALTH_SIBLINGS = [
  { path: '/wealth/budget', label: 'Budget' },
  { path: '/wealth/savings', label: 'Savings' },
];

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  date: string;
  is_recurring: boolean;
  recurrence_interval: string | null;
}

const CategoryIcon = ({ category, size = 'sm' }: { category: string; size?: 'sm' | 'md' }) => {
  const cat = ALL_CATEGORIES.find(c => c.value === category);
  if (!cat) return <Package className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />;
  const Icon = cat.icon;
  return <Icon className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />;
};

const BudgetTracker = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('monthly');
  const [viewMonth, setViewMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showSearch, setShowSearch] = useState(false);

  const fetchTransactions = async () => {
    if (!user) return;
    const start = format(startOfMonth(viewMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(viewMonth), 'yyyy-MM-dd');
    const data = await api<Transaction[]>('api-wealth', { params: { resource: 'transactions', start, end } });
    if (data) setTransactions(data);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, [user, viewMonth]);

  const handleAdd = async () => {
    if (!user || !amount || !category) return;
    try {
      await api('api-wealth', {
        method: 'POST',
        params: { resource: 'transactions' },
        body: { type: txType, amount: parseFloat(amount), category, description: description || null, date, is_recurring: isRecurring, recurrence_interval: isRecurring ? recurrenceInterval : null },
      });
      toast.success(`${txType === 'income' ? 'Income' : 'Expense'} added${isRecurring ? ' (recurring)' : ''}`);
      setAmount(''); setCategory(''); setDescription(''); setIsRecurring(false); setDialogOpen(false);
      fetchTransactions();
    } catch { toast.error('Failed to add transaction'); }
  };

  const handleDelete = async (id: string) => {
    await api('api-wealth', { method: 'DELETE', params: { resource: 'transactions', id } });
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Deleted');
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        (t.description?.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q) ||
        ALL_CATEGORIES.find(c => c.value === t.category)?.label.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [transactions, filterType, searchQuery]);

  const { totalIncome, totalExpense, balance, pieData, topCategories, savingsRate } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const breakdown: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + Number(t.amount);
    });
    const sorted = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
    const pie = sorted.map(([cat, value]) => {
      const catInfo = EXPENSE_CATEGORIES.find(c => c.value === cat);
      return { name: catInfo?.label || cat, value, color: catInfo?.color || 'hsl(0,0%,55%)', category: cat };
    });
    const rate = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;
    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp,
      pieData: pie,
      topCategories: sorted.slice(0, 5),
      savingsRate: rate,
    };
  }, [transactions]);

  const categories = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const getCategoryInfo = (cat: string) => ALL_CATEGORIES.find(c => c.value === cat);
  const isCurrentMonth = format(viewMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <SubPageLayout title="Budget Tracker" backTo="/wealth" siblingRoutes={WEALTH_SIBLINGS} currentPath="/wealth/budget">
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewMonth(prev => subMonths(prev, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button onClick={() => setViewMonth(new Date())} className="text-sm font-semibold hover:text-primary transition-colors">
          {format(viewMonth, 'MMMM yyyy')}
        </button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewMonth(prev => addMonths(prev, 1))} disabled={isCurrentMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Income</p>
            <p className="text-sm font-bold text-primary">{totalIncome.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-3 text-center">
            <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Expenses</p>
            <p className="text-sm font-bold text-destructive">{totalExpense.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-3 text-center">
            <Wallet className="h-4 w-4 text-foreground mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Balance</p>
            <p className={`text-sm font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>{balance.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights bar */}
      {totalIncome > 0 && (
        <Card className="mb-4 border-none shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Savings Rate</span>
              <span className={`text-xs font-bold ${savingsRate >= 20 ? 'text-primary' : savingsRate >= 0 ? 'text-accent-foreground' : 'text-destructive'}`}>
                {savingsRate}%
              </span>
            </div>
            <Progress value={Math.max(0, savingsRate)} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {savingsRate >= 20 ? 'Great! You\'re saving well.' : savingsRate >= 0 ? 'Try to save at least 20% of income.' : 'Spending exceeds income this month.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Spending pie chart + top categories */}
      {pieData.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={58} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                {topCategories.map(([cat, amt]) => {
                  const info = getCategoryInfo(cat);
                  const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${info?.color || 'hsl(0,0%,55%)'}20` }}>
                        <CategoryIcon category={cat} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-medium truncate">{info?.label || cat}</span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: info?.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add + Search bar */}
      <div className="flex gap-2 mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 gap-2">
              <Plus className="h-4 w-4" /> Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
            </DialogHeader>
            <Tabs value={txType} onValueChange={(v) => { setTxType(v as 'income' | 'expense'); setCategory(''); }}>
              <TabsList className="w-full">
                <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
                <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-3 mt-2">
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => {
                      const Icon = c.icon;
                      return (
                        <SelectItem key={c.value} value={c.value}>
                          <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {c.label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input placeholder="e.g. Lunch at cafe" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <Label className="cursor-pointer">Recurring</Label>
                </div>
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
              </div>
              {isRecurring && (
                <div>
                  <Label>Frequency</Label>
                  <Select value={recurrenceInterval} onValueChange={setRecurrenceInterval}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button className="w-full" onClick={handleAdd} disabled={!amount || !category}>
                Add {txType === 'income' ? 'Income' : 'Expense'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setShowSearch(!showSearch)}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Search + filter */}
      {showSearch && (
        <div className="flex gap-2 mb-4">
          <Input placeholder="Search transactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 h-9 text-sm" />
          <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'income' | 'expense')}>
            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Transaction list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Transactions
          </h3>
          <Badge variant="outline" className="text-[10px]">{filteredTransactions.length} items</Badge>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-10">
            <CircleDollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{searchQuery ? 'No matching transactions.' : 'No transactions yet.'}</p>
            <p className="text-xs text-muted-foreground mt-1">Tap "Add Transaction" to get started.</p>
          </div>
        ) : (
          filteredTransactions.map(tx => {
            const info = getCategoryInfo(tx.category);
            return (
              <Card key={tx.id} className="group hover:shadow-sm transition-shadow">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tx.type === 'income' ? 'hsl(var(--primary) / 0.1)' : `${info?.color || 'hsl(0,70%,55%)'}15` }}
                    >
                      {tx.type === 'income'
                        ? <CategoryIcon category={tx.category} />
                        : <CategoryIcon category={tx.category} />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{info?.label || tx.category}</p>
                        {tx.is_recurring && (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 gap-0.5 flex-shrink-0">
                            <RefreshCw className="h-2.5 w-2.5" />
                            {tx.recurrence_interval?.slice(0, 3)}
                          </Badge>
                        )}
                      </div>
                      {tx.description && <p className="text-[11px] text-muted-foreground truncate">{tx.description}</p>}
                      <p className="text-[10px] text-muted-foreground">{format(parseISO(tx.date), 'EEE, d MMM')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold tabular-nums ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                      {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                    </span>
                    <button onClick={() => handleDelete(tx.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </SubPageLayout>
  );
};

export default BudgetTracker;
