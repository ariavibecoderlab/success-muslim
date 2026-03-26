import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Trash2, Star, CheckCircle2, Circle, Play, Pause, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SubPageLayout from '@/components/SubPageLayout';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { format } from 'date-fns';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import { useDailyTasks, useAddTask, useToggleTask, useDeleteTask, useTaskStreak } from '@/hooks/useTasksQuery';
import { getDailyTasks, saveDailyTasks } from '@/lib/productivity-storage';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60;  // 5 minutes

const DailyTasksPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [highlightPicker, setHighlightPicker] = useState(false);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const { data: daily } = useDailyTasks(dateKey);
  const addTask = useAddTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const { data: streak = 0 } = useTaskStreak();
  const [newText, setNewText] = useState('');
  const [isMIT, setIsMIT] = useState(false);

  // Focus timer state
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [focusSeconds, setFocusSeconds] = useState(FOCUS_DURATION);
  const [focusRunning, setFocusRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (focusRunning && focusSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setFocusSeconds(prev => {
          if (prev <= 1) {
            setFocusRunning(false);
            if (!isBreak) {
              setIsBreak(true);
              return BREAK_DURATION;
            } else {
              setFocusTaskId(null);
              setIsBreak(false);
              return FOCUS_DURATION;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [focusRunning, isBreak, focusSeconds]);

  const startFocus = (taskId: string) => {
    setFocusTaskId(taskId);
    setFocusSeconds(FOCUS_DURATION);
    setIsBreak(false);
    setFocusRunning(true);
  };

  const stopFocus = () => {
    setFocusRunning(false);
    setFocusTaskId(null);
    setFocusSeconds(FOCUS_DURATION);
    setIsBreak(false);
  };

  const handleDateChange = useCallback((d: Date) => {
    setSelectedDate(d);
  }, []);

  const tasks = daily?.tasks ?? [];
  const mitCount = tasks.filter(t => t.isMIT).length;
  const mitsCompleted = tasks.filter(t => t.isMIT && t.completed).length;
  const totalCompleted = tasks.filter(t => t.completed).length;

  const handleAdd = useCallback(() => {
    if (!newText.trim()) return;
    addTask.mutate({ text: newText.trim(), isMIT: isMIT && mitCount < 3, date: dateKey });
    setNewText('');
    setIsMIT(false);
  }, [newText, isMIT, dateKey, mitCount, addTask]);

  const handleToggle = useCallback((id: string) => {
    toggleTask.mutate({ taskId: id, date: dateKey });
  }, [dateKey, toggleTask]);

  const handleDelete = useCallback((id: string) => {
    deleteTask.mutate({ taskId: id, date: dateKey });
  }, [dateKey, deleteTask]);

  const handleUpdateNotes = useCallback((taskId: string, notes: string) => {
    const d = getDailyTasks(dateKey);
    const task = d.tasks.find(t => t.id === taskId);
    if (task) {
      task.notes = notes;
      saveDailyTasks(d);
    }
  }, [dateKey]);

  const mits = tasks.filter(t => t.isMIT);
  const others = tasks.filter(t => !t.isMIT);
  const focusTaskName = tasks.find(t => t.id === focusTaskId)?.text;
  const focusMinutes = Math.floor(focusSeconds / 60);
  const focusSecs = focusSeconds % 60;
  const focusPct = isBreak
    ? ((BREAK_DURATION - focusSeconds) / BREAK_DURATION) * 100
    : ((FOCUS_DURATION - focusSeconds) / FOCUS_DURATION) * 100;

  return (
    <SubPageLayout
      title="Daily Tasks"
      backTo="/productivity"
      siblingRoutes={SIBLING_ROUTES}
      currentPath="/productivity/tasks"
    >
      <div className="space-y-4">
        {/* Focus Timer Banner */}
        <AnimatePresence>
          {focusTaskId && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-primary font-medium">
                      {isBreak ? '☕ Break' : '🎯 Focus'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{focusTaskName}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-mono font-bold text-primary tabular-nums">
                      {String(focusMinutes).padStart(2, '0')}:{String(focusSecs).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${focusPct}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={focusRunning ? 'secondary' : 'default'}
                    className="h-7 text-xs flex-1"
                    onClick={() => setFocusRunning(!focusRunning)}
                  >
                    {focusRunning ? <><Pause className="h-3 w-3 mr-1" /> Pause</> : <><Play className="h-3 w-3 mr-1" /> Resume</>}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={stopFocus}>
                    <Square className="h-3 w-3 mr-1" /> Stop
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <BackdatePrompt moduleKey="daily-tasks" onLogPastData={() => {
          const y = new Date(); y.setDate(y.getDate() - 1);
          handleDateChange(y); setHighlightPicker(true);
        }} />
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={handleDateChange} compact highlight={highlightPicker} />

        {/* Stats */}
        <div className="flex gap-2">
          {[
            { label: 'MITs', value: `${mitsCompleted}/${mitCount}` },
            { label: 'Total', value: `${totalCompleted}/${tasks.length}` },
            { label: 'Streak', value: `${streak}d` },
          ].map(s => (
            <div key={s.label} className="flex-1 bg-card rounded-lg border border-border py-2 text-center">
              <p className="text-base font-semibold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add task */}
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              placeholder="Add a task..."
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 h-9 text-sm"
            />
            <Button onClick={handleAdd} size="icon" className="h-9 w-9" disabled={!newText.trim()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={isMIT}
              onChange={e => setIsMIT(e.target.checked)}
              disabled={mitCount >= 3 && !isMIT}
              className="rounded"
            />
            <Star className="h-3 w-3 text-amber-500" />
            MIT ({mitCount}/3)
          </label>
        </div>

        {/* MITs */}
        {mits.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              Most Important Tasks
            </p>
            <div className="space-y-1">
              <AnimatePresence>
                {mits.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onFocus={startFocus}
                    isFocused={focusTaskId === task.id}
                    onUpdateNotes={handleUpdateNotes}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Others */}
        {others.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
              Other Tasks
            </p>
            <div className="space-y-1">
              <AnimatePresence>
                {others.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onFocus={startFocus}
                    isFocused={focusTaskId === task.id}
                    onUpdateNotes={handleUpdateNotes}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No tasks yet. Add up to 3 MITs to focus your day.
          </p>
        )}
      </div>
    </SubPageLayout>
  );
};

function TaskItem({
  task,
  onToggle,
  onDelete,
  onFocus,
  isFocused,
  onUpdateNotes,
}: {
  task: { id: string; text: string; completed: boolean; isMIT: boolean; notes?: string };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  isFocused: boolean;
  onUpdateNotes: (id: string, notes: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const bg = useTransform(x, [-100, 0, 100], [
    'hsl(var(--destructive) / 0.15)',
    'transparent',
    'hsl(var(--primary) / 0.15)',
  ]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80) {
      onToggle(task.id);
    } else if (info.offset.x < -80) {
      onDelete(task.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      style={{ background: bg as any }}
      className="rounded-lg border border-border overflow-hidden"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="flex items-center gap-2 px-2.5 py-2 bg-card cursor-grab active:cursor-grabbing"
      >
        <button onClick={() => onToggle(task.id)} className="flex-shrink-0">
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground/40" />
          )}
        </button>
        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.text}
        </span>
        {task.isMIT && <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />}
        {!task.completed && (
          <button
            onClick={() => onFocus(task.id)}
            className={`flex-shrink-0 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground/40 hover:text-primary'}`}
          >
            <Play className="h-3.5 w-3.5" />
          </button>
        )}
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground/40 hover:text-muted-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button onClick={() => onDelete(task.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </motion.div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-2 pt-1 bg-card border-t border-border">
              <Textarea
                placeholder="Add notes or subtasks..."
                defaultValue={task.notes || ''}
                onBlur={e => onUpdateNotes(task.id, e.target.value)}
                className="min-h-[48px] text-xs resize-none border-none bg-muted/30 focus-visible:ring-1"
                rows={2}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DailyTasksPage;
