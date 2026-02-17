import { Heart, Droplets, Moon, Scale, Footprints, BedDouble } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  { icon: Moon, title: 'Sunnah Fasting', desc: 'Monday, Thursday & White Days tracker' },
  { icon: Scale, title: 'BMI Calculator', desc: 'Weight, height & body metrics' },
  { icon: Droplets, title: 'Hydration Tracker', desc: 'Daily water intake log' },
  { icon: BedDouble, title: 'Sleep Tracker', desc: 'Track sleep quality & duration' },
  { icon: Footprints, title: 'Walking Tracker', desc: 'Step counter & 10k challenge' },
  { icon: Heart, title: 'Intermittent Fasting', desc: '16:8, 24h, 48h, 72h modes' },
];

const Health = () => (
  <div className="min-h-screen bg-background">
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
        <span className="text-lg font-bold text-primary flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Health & Fitness
        </span>
      </div>
    </nav>

    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Coming Soon</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Track your physical health the Sunnah way. Body is an amanah — take care of it.
        </p>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Planned Features</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {features.map(f => (
          <Card key={f.title} className="border-dashed opacity-70">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <f.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export default Health;
