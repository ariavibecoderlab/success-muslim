import { ListChecks, Target, Flame, BookOpen, Eye, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import EditableText from '@/components/cms/EditableText';

const features = [
  { icon: ListChecks, title: 'Daily Tasks', desc: 'Simple, focused to-do list' },
  { icon: Flame, title: 'Habit Streaks', desc: 'Build consistency with gamification' },
  { icon: Target, title: 'Life Areas', desc: 'Iman, Health, Wealth, Family, Knowledge' },
  { icon: BookOpen, title: 'Islamic Habits', desc: 'On-time Salah, daily tilawah goals' },
  { icon: Eye, title: 'Vision Board', desc: 'Visualize your 5-10 year goals' },
  { icon: LayoutGrid, title: 'Weekly Dashboard', desc: 'Summary of all life areas' },
];

const Productivity = () => (
  <div className="min-h-screen bg-background">
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
        <span className="text-lg font-bold text-primary flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          <EditableText elementKey="productivity.nav" defaultText="Productivity" tag="span" />
        </span>
      </div>
    </nav>

    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <ListChecks className="h-8 w-8 text-primary" />
        </div>
        <EditableText elementKey="productivity.title" defaultText="Coming Soon" tag="h1" className="text-2xl font-bold mb-2" />
        <EditableText elementKey="productivity.desc" defaultText="Plan with purpose, execute with tawakkul. Your Islamic productivity hub." tag="p" className="text-muted-foreground text-sm max-w-sm" />
      </div>

      <EditableText elementKey="productivity.features.title" defaultText="Planned Features" tag="h2" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4" />
      <div className="grid sm:grid-cols-2 gap-3">
        {features.map((f, i) => (
          <Card key={f.title} className="border-dashed opacity-70">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <f.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <EditableText elementKey={`productivity.feature.${i}.title`} defaultText={f.title} tag="p" className="text-sm font-medium" />
                <EditableText elementKey={`productivity.feature.${i}.desc`} defaultText={f.desc} tag="p" className="text-xs text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export default Productivity;
