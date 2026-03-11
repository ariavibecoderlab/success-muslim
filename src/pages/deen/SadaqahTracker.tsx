import { useState, useEffect, useMemo } from 'react';
import { Heart, Plus, Target, TrendingUp, Calendar, Tag, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import BackdatePrompt from '@/components/BackdatePrompt';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import SubPageLayout from '@/components/SubPageLayout';

const IMAN_SIBLINGS = [
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/sadaqah', label: 'Sadaqah' },
  { path: '/iman/zakat', label: 'Zakat' },
];

const CATEGORIES = [
  { value: 'sadaqah', label: 'Sadaqah' },
  { value: 'infaq', label: 'Infaq' },
  { value: 'wakaf', label: 'Wakaf' },
  { value: 'other', label: 'Other' },
];

const CURRENCIES = ['MYR', 'USD', 'SAR', 'GBP', 'EUR', 'IDR', 'SGD', 'AED'] as const;

interface Donation {
  id: string;
  amount: number;
  currency: string;
  category: string;
  recipient: string | null;
  notes: string | null;
  date: string;
  created_at: string;
}

interface SadaqahGoal {
  id: string;
  monthly_target: number;
  currency: string;
}

const SadaqahTracker = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [goal, setGoal] = useState<SadaqahGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('MYR');
  const [category, setCategory] = useState('sadaqah');
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Goal form
  const [goalAmount, setGoalAmount] = useState('');
  const [goalCurrency, setGoalCurrency] = useState('MYR');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [donRes, goalRes] = await Promise.all([
      supabase.from('sadaqah_donations').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
      supabase.from('sadaqah_goals').select('*').eq('user_id', user.id).limit(1),
    ]);
    if (donRes.data) setDonations(donRes.data as Donation[]);
    if (goalRes.data && goalRes.data.length > 0) setGoal(goalRes.data[0] as SadaqahGoal);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) return;
    const { error } = await supabase.from('sadaqah_donations').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      currency,
      category,
      recipient: recipient || null,
      notes: notes || null,
      date,
    });
    if (error) { toast.error('Failed to save'); return; }
    toast.success('Donation logged!');
    setAmount(''); setRecipient(''); setNotes(''); setAddOpen(false);
    loadData();
  };

  const handleSetGoal = async () => {
    if (!user || !goalAmount || parseFloat(goalAmount) <= 0) return;
    if (goal) {
      await supabase.from('sadaqah_goals').update({ monthly_target: parseFloat(goalAmount), currency: goalCurrency }).eq('id', goal.id);
    } else {
      await supabase.from('sadaqah_goals').insert({ user_id: user.id, monthly_target: parseFloat(goalAmount), currency: goalCurrency });
    }
    toast.success('Goal updated!');
    setGoalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('sadaqah_donations').delete().eq('id', id);
    toast.success('Deleted');
    loadData();
  };

  // Stats
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisYear = `${now.getFullYear()}`;

  const monthlyTotal = useMemo(() =>
    donations.filter(d => d.date.startsWith(thisMonth)).reduce((s, d) => s + d.amount, 0),
    [donations, thisMonth]
  );

  const yearlyTotal = useMemo(() =>
    donations.filter(d => d.date.startsWith(thisYear)).reduce((s, d) => s + d.amount, 0),
    [donations, thisYear]
  );

  const goalProgress = goal ? Math.min(100, (monthlyTotal / goal.monthly_target) * 100) : 0;
  const displayCurrency = goal?.currency || currency;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    donations.filter(d => d.date.startsWith(thisMonth)).forEach(d => {
      map[d.category] = (map[d.category] || 0) + d.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [donations, thisMonth]);

  return (
    <SubPageLayout title="Sadaqah Tracker" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/sadaqah">
      <div className="space-y-5">
        <BackdatePrompt moduleKey="sadaqah" onLogPastData={() => {
          const y = new Date(); y.setDate(y.getDate() - 1);
          setDate(y.toISOString().split('T')[0]);
          setAddOpen(true);
        }} />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
           <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 rounded-xl shadow-md">
            <CardContent className="p-4 text-center">
              <Calendar className="h-4 w-4 text-white/70 mx-auto mb-1" />
              <p className="text-lg font-bold">{displayCurrency} {monthlyTotal.toLocaleString()}</p>
              <p className="text-[10px] text-white/60">This Month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 rounded-xl shadow-md">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-4 w-4 text-white/70 mx-auto mb-1" />
              <p className="text-lg font-bold">{displayCurrency} {yearlyTotal.toLocaleString()}</p>
              <p className="text-[10px] text-white/60">This Year</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Goal Progress */}
        <Card className={`rounded-xl border-0 shadow-sm ${goal ? 'bg-primary/5' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Monthly Goal</span>
              </div>
              <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    {goal ? 'Edit' : 'Set Goal'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Set Monthly Goal</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-2">
                      <Select value={goalCurrency} onValueChange={setGoalCurrency}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" placeholder="Amount" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} />
                    </div>
                    <Button onClick={handleSetGoal} className="w-full">Save Goal</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {goal ? (
              <>
                <Progress value={goalProgress} className="h-2 mb-1.5" />
                <p className="text-xs text-muted-foreground">
                  {displayCurrency} {monthlyTotal.toLocaleString()} / {goal.monthly_target.toLocaleString()} ({Math.round(goalProgress)}%)
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Set a monthly giving target to track progress</p>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Month by Category</h3>
            {categoryBreakdown.map(([cat, total]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="capitalize">{cat.replace('_', ' ')}</span>
                </div>
                <span className="font-medium">{displayCurrency} {total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add Donation Button */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" /> Log Donation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Donation</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" inputMode="decimal" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Recipient / Cause (optional)</Label>
                <Input placeholder="e.g. Masjid Al-Aqsa" value={recipient} onChange={e => setRecipient(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Notes (optional)</Label>
                <Textarea placeholder="Any notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
              </div>
              <Button onClick={handleAdd} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Recent Donations */}
        {donations.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Donations</h3>
            {donations.slice(0, 10).map(d => (
              <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{d.currency} {d.amount.toLocaleString()}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                            {d.category.replace('_', ' ')}
                          </span>
                        </div>
                        {d.recipient && <p className="text-xs text-muted-foreground mt-0.5">{d.recipient}</p>}
                        <p className="text-[10px] text-muted-foreground mt-0.5">{d.date}</p>
                      </div>
                      <button onClick={() => handleDelete(d.id)} className="text-muted-foreground hover:text-destructive p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && donations.length === 0 && (
          <div className="text-center py-8">
            <Heart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No donations logged yet</p>
            <p className="text-xs text-muted-foreground">Start tracking your charity giving</p>
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default SadaqahTracker;
