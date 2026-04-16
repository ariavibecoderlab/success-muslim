import { useState, useEffect } from 'react';
import {
  PiggyBank, Plus, Trash2, HandCoins, Target, Clock, CheckCircle2,
  Landmark, Moon, CircleDot, Shield, GraduationCap, Gem, ChevronDown, ChevronUp
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SubPageLayout from '@/components/SubPageLayout';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, parseISO, differenceInDays, differenceInMonths } from 'date-fns';

interface GoalPreset {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const GOAL_PRESETS: GoalPreset[] = [
  { value: 'hajj', label: 'Hajj', icon: Landmark, color: 'hsl(45, 80%, 45%)' },
  { value: 'umrah', label: 'Umrah', icon: Moon, color: 'hsl(200, 60%, 50%)' },
  { value: 'qurban', label: 'Qurban / Udhiyah', icon: CircleDot, color: 'hsl(15, 70%, 50%)' },
  { value: 'emergency', label: 'Emergency Fund', icon: Shield, color: 'hsl(0, 70%, 50%)' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: 'hsl(270, 60%, 55%)' },
  { value: 'wedding', label: 'Wedding', icon: Gem, color: 'hsl(330, 60%, 55%)' },
  { value: 'custom', label: 'Custom Goal', icon: Target, color: 'hsl(160, 50%, 45%)' },
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
  created_at: string;
}

interface Contribution {
  id: string;
  amount: number;
  note: string | null;
  date: string;
}

const GoalIcon = ({ goalType, size = 'md' }: { goalType: string; size?: 'sm' | 'md' | 'lg' }) => {
  const preset = GOAL_PRESETS.find(p => p.value === goalType) || GOAL_PRESETS[GOAL_PRESETS.length - 1];
  const Icon = preset.icon;
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  return <Icon className={sizeClass} />;
};

const getGoalColor = (goalType: string) =>
  GOAL_PRESETS.find(p => p.value === goalType)?.color || 'hsl(160, 50%, 45%)';

const SavingsGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionNote, setContributionNote] = useState('');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [contributions, setContributions] = useState<Record<string, Contribution[]>>({});

  // New goal form
  const [goalType, setGoalType] = useState('hajj');
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchGoals = async () => {
    if (!user) return;
    const result = await api<any>('api-wealth', { params: { resource: 'savings-goals' } });
    if (result?.goals) {
      setGoals(result.goals as SavingsGoal[]);
      // Index contributions by goal
      const contribMap: Record<string, Contribution[]> = {};
      (result.contributions || []).forEach((c: any) => {
        if (!contribMap[c.goal_id]) contribMap[c.goal_id] = [];
        contribMap[c.goal_id].push(c);
      });
      setContributions(contribMap);
    } else if (Array.isArray(result)) {
      setGoals([]);
    }
    setLoading(false);
  };

  const fetchContributions = async (_goalId: string) => {
    // Already loaded from fetchGoals
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const handleCreate = async () => {
    if (!user || !targetAmount) return;
    const preset = GOAL_PRESETS.find(p => p.value === goalType);
    const name = goalType === 'custom' ? goalName : preset?.label || goalName;
    if (!name) { toast.error('Please enter a goal name'); return; }
    const { error } = await api<any>('api-wealth', {
      method: 'POST',
      params: { resource: 'savings-goals' },
      body: { action: 'create', name, goal_type: goalType, target_amount: parseFloat(targetAmount), deadline: deadline || null },
    }).catch(() => ({ error: true })) as any;
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
    const newAmount = Number(goal.current_amount) + amt;
    await api('api-wealth', {
      method: 'POST',
      params: { resource: 'savings-goals' },
      body: { action: 'contribute', goal_id: contributeGoalId, amount: amt, new_total: newAmount, note: contributionNote || null, date: new Date().toISOString().split('T')[0] },
    });
    const reached = newAmount >= Number(goal.target_amount);
    toast.success(reached ? `${goal.name} goal reached! 🎉` : `Added ${amt.toLocaleString()} to ${goal.name}`);
    setContributionAmount(''); setContributionNote(''); setContributeGoalId(null);
    fetchGoals();
  };

  const handleDelete = async (id: string) => {
    await api('api-wealth', { method: 'DELETE', params: { resource: 'savings-goals', id } });
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal deleted');
  };

  const toggleExpand = (goalId: string) => {
    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
    } else {
      setExpandedGoalId(goalId);
      if (!contributions[goalId]) fetchContributions(goalId);
    }
  };

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const completedGoals = goals.filter(g => Number(g.current_amount) >= Number(g.target_amount)).length;

  return (
    <SubPageLayout title="Savings Goals" backTo="/wealth" siblingRoutes={WEALTH_SIBLINGS} currentPath="/wealth/savings">
      {/* Overview */}
      {goals.length > 0 && (
        <Card className="mb-4 border-none shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Saved</p>
                <p className="text-xl font-bold text-primary">{totalSaved.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Overall</p>
                <p className="text-xl font-bold text-foreground">{overallPct}%</p>
              </div>
            </div>
            <Progress value={overallPct} className="h-2 mb-2" />
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Target className="h-3 w-3" />{goals.length} goals</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" />{completedGoals} completed</span>
              <span className="flex items-center gap-1"><PiggyBank className="h-3 w-3" />{totalTarget.toLocaleString()} target</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create goal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mb-4 gap-2">
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
                  {GOAL_PRESETS.map(p => {
                    const Icon = p.icon;
                    return (
                      <SelectItem key={p.value} value={p.value}>
                        <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {p.label}</span>
                      </SelectItem>
                    );
                  })}
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
      <Dialog open={!!contributeGoalId} onOpenChange={(open) => { if (!open) setContributeGoalId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label>Amount</Label>
              <Input type="number" placeholder="0" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Input placeholder="e.g. Monthly savings" value={contributionNote} onChange={e => setContributionNote(e.target.value)} />
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
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <PiggyBank className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No savings goals yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start saving for Hajj, Umrah, or any goal!</p>
          </div>
        ) : (
          goals.map(goal => {
            const pct = Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100);
            const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : null;
            const monthsLeft = goal.deadline ? differenceInMonths(parseISO(goal.deadline), new Date()) : null;
            const remaining = Number(goal.target_amount) - Number(goal.current_amount);
            const monthlyNeeded = monthsLeft && monthsLeft > 0 && remaining > 0 ? Math.ceil(remaining / monthsLeft) : null;
            const isComplete = pct >= 100;
            const isExpanded = expandedGoalId === goal.id;
            const color = getGoalColor(goal.goal_type);

            return (
              <Card key={goal.id} className={`group overflow-hidden transition-all ${isComplete ? 'border-primary/30' : ''}`}>
                <CardContent className="p-0">
                  {/* Color accent bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: color }} />

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                          <GoalIcon goalType={goal.goal_type} size="md" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold">{goal.name}</p>
                            {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {daysLeft !== null && (
                              <span className={`flex items-center gap-0.5 ${daysLeft <= 30 && daysLeft > 0 ? 'text-accent-foreground font-medium' : daysLeft <= 0 ? 'text-destructive font-medium' : ''}`}>
                                <Clock className="h-3 w-3" />
                                {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                              </span>
                            )}
                            {monthlyNeeded && (
                              <span>Need {monthlyNeeded.toLocaleString()}/mo</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => setContributeGoalId(goal.id)}>
                          <HandCoins className="h-3.5 w-3.5" /> Add
                        </Button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="relative mb-1.5">
                      <Progress value={pct} className="h-2.5" />
                      <span className="absolute right-0 -top-4 text-[10px] font-bold" style={{ color }}>{Math.round(pct)}%</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{Number(goal.current_amount).toLocaleString()} saved</span>
                      <span>{Number(goal.target_amount).toLocaleString()} target</span>
                    </div>

                    {/* Expand/collapse */}
                    <button
                      onClick={() => toggleExpand(goal.id)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-2 mx-auto"
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {isExpanded ? 'Hide' : 'History'}
                    </button>

                    {/* Contribution history */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                        {(contributions[goal.id] || []).length === 0 ? (
                          <p className="text-[11px] text-muted-foreground text-center py-2">No contributions yet</p>
                        ) : (
                          (contributions[goal.id] || []).map(c => (
                            <div key={c.id} className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span className="text-muted-foreground">{format(parseISO(c.date), 'd MMM yyyy')}</span>
                                {c.note && <span className="truncate text-muted-foreground/70">— {c.note}</span>}
                              </div>
                              <span className="font-medium text-primary flex-shrink-0">+{Number(c.amount).toLocaleString()}</span>
                            </div>
                          ))
                        )}
                        <button onClick={() => handleDelete(goal.id)} className="flex items-center gap-1 text-[10px] text-destructive/60 hover:text-destructive transition-colors mt-2">
                          <Trash2 className="h-3 w-3" /> Delete goal
                        </button>
                      </div>
                    )}
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
