import { useState, useEffect, useMemo } from 'react';
import { Receipt, Plus, TrendingUp, TrendingDown, Wallet, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SubPageLayout from '@/components/SubPageLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Groceries', emoji: '🍽️' },
  { value: 'housing', label: 'Housing & Rent', emoji: '🏠' },
  { value: 'transport', label: 'Transport', emoji: '🚗' },
  { value: 'sadaqah', label: 'Sadaqah', emoji: '🤲' },
  { value: 'zakat', label: 'Zakat', emoji: '💎' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'utilities', label: 'Utilities', emoji: '💡' },
  { value: 'clothing', label: 'Clothing', emoji: '👕' },
  { value: 'other', label: 'Other', emoji: '📦' },
];

const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary', emoji: '💼' },
  { value: 'freelance', label: 'Freelance', emoji: '💻' },
  { value: 'business', label: 'Business', emoji: '🏪' },
  { value: 'investment', label: 'Investment Returns', emoji: '📈' },
  { value: 'gift', label: 'Gift / Hadiah', emoji: '🎁' },
  { value: 'other', label: 'Other', emoji: '📦' },
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
}

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

  const fetchTransactions = async () => {
    if (!user) return;
    const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });
    if (!error && data) setTransactions(data as Transaction[]);
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, [user]);

  const handleAdd = async () => {
    if (!user || !amount || !category) return;
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: txType,
      amount: parseFloat(amount),
      category,
      description: description || null,
      date,
    });
    if (error) { toast.error('Failed to add transaction'); return; }
    toast.success(`${txType === 'income' ? 'Income' : 'Expense'} added`);
    setAmount(''); setCategory(''); setDescription(''); setDialogOpen(false);
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Deleted');
  };

  const { totalIncome, totalExpense, balance, categoryBreakdown } = useMemo(() => {
    const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const breakdown: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + Number(t.amount);
    });
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp, categoryBreakdown: breakdown };
  }, [transactions]);

  const categories = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const getCategoryLabel = (cat: string) => {
    const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    const found = all.find(c => c.value === cat);
    return found ? `${found.emoji} ${found.label}` : cat;
  };

  return (
    <SubPageLayout title="Budget Tracker" backTo="/wealth" siblingRoutes={WEALTH_SIBLINGS} currentPath="/wealth/budget">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
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

      {/* Category breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <Card className="mb-5">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-wrap gap-1.5">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amt]) => (
                <Badge key={cat} variant="secondary" className="text-xs font-normal gap-1">
                  {getCategoryLabel(cat)} · {amt.toLocaleString()}
                </Badge>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Add button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mb-5 gap-2">
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
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
                  ))}
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
            <Button className="w-full" onClick={handleAdd} disabled={!amount || !category}>
              Add {txType === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction list */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {format(new Date(), 'MMMM yyyy')} Transactions
        </h3>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions yet. Add your first one!</p>
        ) : (
          transactions.map(tx => (
            <Card key={tx.id} className="group">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                    {tx.type === 'income' ? <TrendingUp className="h-4 w-4 text-primary" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{getCategoryLabel(tx.category)}</p>
                    {tx.description && <p className="text-[11px] text-muted-foreground truncate">{tx.description}</p>}
                    <p className="text-[10px] text-muted-foreground">{format(parseISO(tx.date), 'd MMM')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                    {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                  </span>
                  <button onClick={() => handleDelete(tx.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </SubPageLayout>
  );
};

export default BudgetTracker;
