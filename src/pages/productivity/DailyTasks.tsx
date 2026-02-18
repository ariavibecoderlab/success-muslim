import { useState, useCallback } from 'react';
import { Plus, Trash2, Star, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SubPageLayout from '@/components/SubPageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDailyTasks,
  addTask,
  toggleTask,
  deleteTask,
  getTaskStreak,
  DailyTasks as DailyTasksType,
} from '@/lib/productivity-storage';

const SIBLING_ROUTES = [
  { path: '/productivity/tasks', label: 'Daily Tasks' },
  { path: '/productivity/habits', label: 'Habit Streaks' },
  { path: '/productivity/life-areas', label: 'Life Areas' },
];

const DailyTasksPage = () => {
  const [daily, setDaily] = useState<DailyTasksType>(() => getDailyTasks());
  const [newText, setNewText] = useState('');
  const [isMIT, setIsMIT] = useState(false);
  const streak = getTaskStreak();

  const mitCount = daily.tasks.filter(t => t.isMIT).length;
  const mitsCompleted = daily.tasks.filter(t => t.isMIT && t.completed).length;
  const totalCompleted = daily.tasks.filter(t => t.completed).length;

  const handleAdd = useCallback(() => {
    if (!newText.trim()) return;
    const updated = addTask(newText.trim(), isMIT);
    setDaily({ ...updated });
    setNewText('');
    setIsMIT(false);
  }, [newText, isMIT]);

  const handleToggle = useCallback((id: string) => {
    const updated = toggleTask(id);
    setDaily({ ...updated });
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updated = deleteTask(id);
    setDaily({ ...updated });
  }, []);

  const mits = daily.tasks.filter(t => t.isMIT);
  const others = daily.tasks.filter(t => !t.isMIT);

  return (
    <SubPageLayout
      title="Daily Tasks"
      backTo="/productivity"
      siblingRoutes={SIBLING_ROUTES}
      currentPath="/productivity/tasks"
    >
      <div className="space-y-6">
        {/* Stats bar */}
        <div className="flex items-center gap-3">
          <Card className="flex-1">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{mitsCompleted}/{mitCount}</p>
              <p className="text-xs text-muted-foreground">MITs Done</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{totalCompleted}/{daily.tasks.length}</p>
              <p className="text-xs text-muted-foreground">Total Done</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-accent">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Add task */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a task..."
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <Button onClick={handleAdd} size="icon" disabled={!newText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isMIT}
              onChange={e => setIsMIT(e.target.checked)}
              disabled={mitCount >= 3 && !isMIT}
              className="rounded"
            />
            <Star className="h-3.5 w-3.5 text-accent" />
            Mark as MIT ({mitCount}/3)
          </label>
        </div>

        {/* MITs section */}
        {mits.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Most Important Tasks
              </h3>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {mits.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Other tasks */}
        {others.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Other Tasks
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {others.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {daily.tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No tasks yet. Add up to 3 MITs to focus your day.</p>
          </div>
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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        task.completed ? 'bg-muted/50 border-border' : task.isMIT ? 'bg-accent/5 border-accent/20' : 'bg-card border-border'
      }`}
    >
      <button onClick={() => onToggle(task.id)} className="flex-shrink-0">
        {task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
        {task.text}
      </span>
      {task.isMIT && <Badge variant="outline" className="text-accent border-accent/30 text-xs">MIT</Badge>}
      <button onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export default DailyTasksPage;
