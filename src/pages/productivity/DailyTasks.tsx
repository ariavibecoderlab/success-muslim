import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Trash2, Star, CheckCircle2, Circle, Play, Pause, Square, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SubPageLayout from '@/components/SubPageLayout';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { format } from 'date-fns';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import { useDailyTasks, useAddTask, useToggleTask, useDeleteTask, useUpdateTaskNotes, useTaskStreak } from '@/hooks/useTasksQuery';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

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

  // Pomodoro state
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(5 * 60);
        setIsRunning(true);
      } else {
        setFocusTaskId(null);
        setIsBreak(false);
        setTimeLeft(25 * 60);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, isBreak]);

  const startFocus = (taskId: string) => {
    setFocusTaskId(taskId);
    setTimeLeft(25 * 60);
    setIsBreak(false);
    setIsRunning(true);
  };

  const stopFocus = () => {
    setIsRunning(false);
    setFocusTaskId(null);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const handleDateChange = useCallback((d: Date) => setSelectedDate(d), []);

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

  const mits = tasks.filter(t => t.isMIT);
  const others = tasks.filter(t => !t.isMIT);

  const focusTask = tasks.find(t => t.id === focusTaskId);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <SubPageLayout title="Daily Tasks" backTo="/productivity" siblingRoutes={SIBLING_ROUTES} currentPath="/productivity/tasks">
      <div className="space-y-4">
        {/* Pomodoro Banner */}
        <AnimatePresence>
          {focusTaskId && focusTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-primary/10 border border-primary/20 rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
                  {isBreak ? '☕ Break Time' : '🍅 Focus Mode'}
                </p>
                <button onClick={stopFocus} className="text-muted-foreground hover:text-destructive">
                  <Square className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground truncate mb-2">{focusTask.text}</p>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2" strokeLinecap="round"
                      strokeDasharray={`${(timeLeft / (isBreak ? 300 : 1500)) * 100} ${100 - (timeLeft / (isBreak ? 300 : 1500)) * 100}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </span>
                </div>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                >
                  {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                </button>
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
            <input type="checkbox" checked={isMIT} onChange={e => setIsMIT(e.target.checked)} disabled={mitCount >= 3 && !isMIT} className="rounded" />
            <Star className="h-3 w-3 text-amber-500" /> MIT ({mitCount}/3)
          </label>
        </div>

        {/* MITs */}
        {mits.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Most Important Tasks</p>
            <div className="space-y-1">
              <AnimatePresence>
                {mits.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    dateKey={dateKey}
                    onToggle={(id) => toggleTask.mutate({ taskId: id, date: dateKey })}
                    onDelete={(id) => deleteTask.mutate({ taskId: id, date: dateKey })}
                    onFocus={startFocus}
                    isFocused={focusTaskId === task.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Others */}
        {others.length > 0 && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Other Tasks</p>
            <div className="space-y-1">
              <AnimatePresence>
                {others.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    dateKey={dateKey}
                    onToggle={(id) => toggleTask.mutate({ taskId: id, date: dateKey })}
                    onDelete={(id) => deleteTask.mutate({ taskId: id, date: dateKey })}
                    onFocus={startFocus}
                    isFocused={focusTaskId === task.id}
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
  dateKey,
  onToggle,
  onDelete,
  onFocus,
  isFocused,
}: {
  task: { id: string; text: string; completed: boolean; isMIT: boolean; notes?: string };
  dateKey: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  isFocused: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const updateNotes = useUpdateTaskNotes();
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-100, 0, 100], [0.8, 0, 0.3]);
  const bgColor = useTransform(x, (val) => val > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))');

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80) onToggle(task.id);
    else if (info.offset.x < -80) onDelete(task.id);
  };

  const handleNotesBlur = () => {
    if (notes !== (task.notes || '')) {
      updateNotes.mutate({ taskId: task.id, notes, date: dateKey });
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="relative overflow-hidden rounded-lg">
      {/* Swipe background */}
      <motion.div className="absolute inset-0 flex items-center justify-between px-4 rounded-lg" style={{ opacity: bgOpacity, backgroundColor: bgColor }}>
        <span className="text-xs text-primary-foreground font-medium">✓ Done</span>
        <span className="text-xs text-primary-foreground font-medium">Delete</span>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="flex flex-col bg-card border border-border rounded-lg relative z-10"
      >
        <div className="flex items-center gap-2 px-2.5 py-2">
          <button onClick={() => onToggle(task.id)} className="flex-shrink-0">
            {task.completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground/40" />}
          </button>
          <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.text}</span>
          {!task.completed && (
            <button onClick={() => onFocus(task.id)} className={`flex-shrink-0 p-1 rounded transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground/40 hover:text-primary'}`}>
              <Play className="h-3 w-3" />
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 text-muted-foreground/40 hover:text-foreground transition-colors">
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {task.isMIT && <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />}
          <button onClick={() => onDelete(task.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-2.5 pb-2.5">
                <Textarea
                  placeholder="Add notes or subtasks..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="text-xs min-h-[60px] resize-none bg-muted/30 border-0"
                  rows={2}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default DailyTasksPage;
