import { Users, Calendar, BookOpen, Home, Target, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import EditableText from '@/components/cms/EditableText';
import AppHeader from '@/components/AppHeader';

const features = [
  { icon: Calendar, title: 'Shared Calendar', desc: 'Family events & appointments together' },
  { icon: Target, title: 'Family Goals', desc: 'Shared OKRs for the whole family' },
  { icon: BookOpen, title: 'Kids Education', desc: 'Quran memorization & Islamic studies' },
  { icon: Home, title: 'Household Tasks', desc: 'Chore delegation & tracking' },
  { icon: Users, title: 'Family Budget', desc: 'Shared financial overview' },
  { icon: PiggyBank, title: 'Savings Funds', desc: 'Hajj, Umrah, holiday & waqaf funds' },
];

const Family = () => (
  <div className="min-h-screen bg-background">
    <AppHeader title="Family" icon={Users} />

    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <EditableText elementKey="family.title" defaultText="Coming Soon" tag="h1" className="text-2xl font-bold mb-2" />
        <EditableText elementKey="family.desc" defaultText="Build a strong Muslim family together. Shared goals, shared growth, shared barakah." tag="p" className="text-muted-foreground text-sm max-w-sm" />
      </div>

      <EditableText elementKey="family.features.title" defaultText="Planned Features" tag="h2" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4" />
      <div className="grid sm:grid-cols-2 gap-3">
        {features.map((f, i) => (
          <Card key={f.title} className="border-dashed opacity-70">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <f.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <EditableText elementKey={`family.feature.${i}.title`} defaultText={f.title} tag="p" className="text-sm font-medium" />
                <EditableText elementKey={`family.feature.${i}.desc`} defaultText={f.desc} tag="p" className="text-xs text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export default Family;
