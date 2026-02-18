import { useState, useEffect } from 'react';
import { PiggyBank, Plus, Trash2, HandCoins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SubPageLayout from '@/components/SubPageLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, parseISO, differenceInDays } from 'date-fns';

const GOAL_PRESETS = [
  { value: 'hajj', label: 'Hajj', emoji: '🕋' },
  { value: 'umrah', label: 'Umrah', emoji: '🕌' },
  { value: 'qurban', label: 'Qurban / Udhiyah', emoji: '🐑' },
  { value: 'emergency', label: 'Emergency Fund', emoji: '🛡️' },
  { value: 'education', label: 'Education', emoji: '🎓' },
  { value: 'wedding', label: 'Wedding', emoji: '💍' },
  { value: 'custom', label: 'Custom Goal', emoji: '🎯' },
];

const WEALTH_SIBLINGS = [
  { path: '/wealth/budget', label: 'Budget' },
  { path: '/wealth/savings', label: 'Savings' },
];

interface SavingsGoal {
  id: string;
  name: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
}

const SavingsGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // New goal form
  const [goalType, setGoalType] = useState('hajj');
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchGoals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setGoals(data as SavingsGoal[]);
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const handleCreate = async () => {
    if (!user || !targetAmount) return;
    const preset = GOAL_PRESETS.find(p => p.value === goalType);
    const name = goalType === 'custom' ? goalName : preset?.label || goalName;
    if (!name) { toast.error('Please enter a goal name'); return; }

    const { error } = await supabase.from('savings_goals').insert({
      user_id: user.id,
      name,
      goal_type: goalType,
      target_amount: parseFloat(targetAmount),
      deadline: deadline || null,
    });
    if (error) { toast.error('Failed to create goal'); return; }
    toast.success('Goal created!');
    setGoalName(''); setTargetAmount(''); setDeadline(''); setCreateOpen(false);
    fetchGoals();
  };

  const handleContribute = async () => {
    if (!user || !contributeGoalId || !contributionAmount) return;
    const amt = parseFloat(contributionAmount);
    const goal = goals.find(g => g.id === contributeGoalId);
    if (!goal) return;

    // Insert contribution record
    await supabase.from('savings_contributions').insert({
      user_id: user.id,
      goal_id: contributeGoalId,
      amount: amt,
    });

    // Update goal current_amount
    const { error } = await supabase
      .from('savings_goals')
      .update({ current_amount: goal.current_amount + amt })
      .eq('id', contributeGoalId);
    if (error) { toast.error('Failed to add contribution'); return; }
    toast.success(`Added ${amt.toLocaleString()} to ${goal.name}`);
    setContributionAmount(''); setContributeGoalId(null);
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('savings_goals').delete().eq('id', id);
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal deleted');
  };

  const getEmoji = (type: string) => GOAL_PRESETS.find(p => p.value === type)?.emoji || '🎯';

  return (
    <SubPageLayout title="Savings Goals" backTo="/wealth" siblingRoutes={WEALTH_SIBLINGS} currentPath="/wealth/savings">
      {/* Total saved */}
      {goals.length > 0 && (
        <Card className="mb-5 border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <PiggyBank className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Total Saved</p>
            <p className="text-lg font-bold text-primary">
              {goals.reduce((s, g) => s + Number(g.current_amount), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create goal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mb-5 gap-2">
            <Plus className="h-4 w-4" /> New Savings Goal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Goal Type</Label>
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOAL_PRESETS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.emoji} {p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {goalType === 'custom' && (
              <div>
                <Label>Goal Name</Label>
                <Input placeholder="e.g. New car fund" value={goalName} onChange={e => setGoalName(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Target Amount</Label>
              <Input type="number" placeholder="0" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
            </div>
            <div>
              <Label>Deadline (optional)</Label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={!targetAmount || (goalType === 'custom' && !goalName)}>
              Create Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contribute dialog */}
      <Dialog open={!!contributeGoalId} onOpenChange={(open) => !open && setContributeGoalId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="0" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleContribute} disabled={!contributionAmount}>
              Save Contribution
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goals list */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
        ) : goals.length === 0 ? (
          <div className="text-center py-10">
            <PiggyBank className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No savings goals yet.</p>
            <p className="text-xs text-muted-foreground">Start saving for Hajj, Umrah, or any goal!</p>
          </div>
        ) : (
          goals.map(goal => {
            const pct = Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100);
            const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null;
            return (
              <Card key={goal.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getEmoji(goal.goal_type)}</span>
                      <div>
                        <p className="text-sm font-semibold">{goal.name}</p>
                        {daysLeft !== null && (
                          <p className={`text-[10px] ${daysLeft > 30 ? 'text-muted-foreground' : daysLeft > 0 ? 'text-accent-foreground' : 'text-destructive'}`}>
                            {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => setContributeGoalId(goal.id)}>
                        <HandCoins className="h-3.5 w-3.5" /> Add
                      </Button>
                      <button onClick={() => handleDelete(goal.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2 mb-1.5" />
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{Number(goal.current_amount).toLocaleString()} saved</span>
                    <span>{Number(goal.target_amount).toLocaleString()} target</span>
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

export default SavingsGoals;
