import { useState, useCallback } from 'react';
import { Plus, Trash2, Star, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SubPageLayout from '@/components/SubPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import { useDailyTasks, useAddTask, useToggleTask, useDeleteTask, useTaskStreak } from '@/hooks/useTasksQuery';

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

  const mits = tasks.filter(t => t.isMIT);
  const others = tasks.filter(t => !t.isMIT);

  return (
    <SubPageLayout
      title="Daily Tasks"
      backTo="/productivity"
      siblingRoutes={SIBLING_ROUTES}
      currentPath="/productivity/tasks"
    >
      <div className="space-y-4">
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
                  <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
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
                  <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
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
}: {
  task: { id: string; text: string; completed: boolean; isMIT: boolean };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border bg-card"
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
      <button onClick={() => onDelete(task.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors flex-shrink-0">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export default DailyTasksPage;
