import { useState, useEffect, useMemo } from 'react';
import { Scale, Flame, Activity, TrendingDown, TrendingUp, User, Ruler, Calendar, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SubPageLayout from '@/components/SubPageLayout';
import { getBMI, saveBMI, calculateBMI, calculateTDEE, bmiCategory, todayKey, type BMIData } from '@/lib/health-storage';
import { motion, AnimatePresence } from 'framer-motion';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

function estimateBodyFat(bmi: number, age: number, gender: 'male' | 'female'): number {
  // Deurenberg formula
  const sexFactor = gender === 'male' ? 1 : 0;
  const bf = 1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4;
  return Math.max(3, Math.min(55, +bf.toFixed(1)));
}

function idealWeightRange(heightCm: number): { min: number; max: number } {
  const hm = heightCm / 100;
  return { min: +(18.5 * hm * hm).toFixed(1), max: +(24.9 * hm * hm).toFixed(1) };
}

// SVG arc gauge
const BMIGauge = ({ bmi }: { bmi: number }) => {
  const clampedBmi = Math.min(Math.max(bmi, 10), 45);
  const percent = ((clampedBmi - 10) / 35) * 100;
  const angle = -135 + (percent / 100) * 270; // -135 to 135 degrees
  const radius = 90;
  const cx = 120, cy = 120;

  const polarToCartesian = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(endAngle);
    const end = polarToCartesian(startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  const needleEnd = polarToCartesian(angle);
  const cat = bmiCategory(bmi);

  // Color stops for the arc segments
  const segments = [
    { start: -135, end: -67.5, color: 'hsl(210, 80%, 55%)' }, // Underweight - blue
    { start: -67.5, end: 22.5, color: 'hsl(142, 70%, 40%)' }, // Normal - green
    { start: 22.5, end: 67.5, color: 'hsl(45, 90%, 50%)' },   // Overweight - yellow
    { start: 67.5, end: 135, color: 'hsl(0, 80%, 55%)' },     // Obese - red
  ];

  return (
    <div className="relative flex flex-col items-center">
      <svg width="240" height="160" viewBox="0 0 240 180">
        {/* Background arc */}
        <path d={describeArc(-135, 135)} fill="none" stroke="hsl(var(--border))" strokeWidth="16" strokeLinecap="round" />
        {/* Color segments */}
        {segments.map((seg, i) => (
          <path key={i} d={describeArc(seg.start, seg.end)} fill="none" stroke={seg.color} strokeWidth="16" strokeLinecap="round" opacity={0.25} />
        ))}
        {/* Active arc up to needle */}
        <motion.path
          d={describeArc(-135, angle)}
          fill="none"
          stroke={cat.color === 'text-blue-500' ? 'hsl(210, 80%, 55%)' : cat.color === 'text-primary' ? 'hsl(142, 70%, 40%)' : cat.color === 'text-amber-500' ? 'hsl(45, 90%, 50%)' : 'hsl(0, 80%, 55%)'}
          strokeWidth="16"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        {/* Needle */}
        <motion.line
          x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y}
          stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        />
        <circle cx={cx} cy={cy} r="6" fill="hsl(var(--foreground))" />
        {/* Labels */}
        <text x="30" y="170" fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">10</text>
        <text x="210" y="170" fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle">45</text>
      </svg>
      <motion.div
        className="text-center -mt-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <p className="text-5xl font-bold tracking-tight">{bmi}</p>
        <p className={`text-sm font-semibold mt-1 ${cat.color}`}>{cat.label}</p>
      </motion.div>
    </div>
  );
};

const HealthBMI = () => {
  const saved = getBMI();
  const [weight, setWeight] = useState(saved?.weight?.toString() || '');
  const [height, setHeight] = useState(saved?.height?.toString() || '');
  const [age, setAge] = useState(saved?.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female'>(saved?.gender || 'male');
  const [activity, setActivity] = useState<string>(saved?.activityLevel || 'sedentary');
  const [result, setResult] = useState<BMIData | null>(saved);
  const [showForm, setShowForm] = useState(!saved);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !h || !a) return;
    const bmi = calculateBMI(w, h);
    const tdee = calculateTDEE(w, h, a, gender, activity);
    const data: BMIData = { weight: w, height: h, age: a, gender, activityLevel: activity as any, bmi, tdee, date: todayKey() };
    saveBMI(data);
    setResult(data);
    setShowForm(false);
  };

  const cat = result ? bmiCategory(result.bmi) : null;
  const bodyFat = result ? estimateBodyFat(result.bmi, result.age, result.gender) : null;
  const ideal = result ? idealWeightRange(result.height) : null;

  const tdeeBreakdown = result ? {
    maintain: result.tdee,
    lose: result.tdee - 500,
    gain: result.tdee + 300,
  } : null;

  return (
    <SubPageLayout title="BMI Calculator" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/bmi">
      <div className="space-y-5">
        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && cat && !showForm && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Gauge Card */}
              <Card className="overflow-hidden">
                <CardContent className="p-6 pb-4">
                  <BMIGauge bmi={result.bmi} />
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Body Fat */}
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Body Fat</p>
                      <p className="text-xl font-bold">{bodyFat}%</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Ideal Weight */}
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ideal Weight</p>
                      <p className="text-lg font-bold">{ideal?.min}–{ideal?.max}</p>
                      <p className="text-[10px] text-muted-foreground">kg</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* TDEE Card */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-accent" />
                    <p className="text-sm font-semibold">Daily Calorie Needs</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <TrendingDown className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
                      <p className="text-xs text-muted-foreground">Lose</p>
                      <p className="text-lg font-bold">{tdeeBreakdown?.lose}</p>
                      <p className="text-[10px] text-muted-foreground">kcal/day</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20">
                      <Heart className="h-3.5 w-3.5 mx-auto text-primary mb-1" />
                      <p className="text-xs text-muted-foreground">Maintain</p>
                      <p className="text-lg font-bold text-primary">{tdeeBreakdown?.maintain}</p>
                      <p className="text-[10px] text-muted-foreground">kcal/day</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <TrendingUp className="h-3.5 w-3.5 mx-auto text-accent mb-1" />
                      <p className="text-xs text-muted-foreground">Gain</p>
                      <p className="text-lg font-bold">{tdeeBreakdown?.gain}</p>
                      <p className="text-[10px] text-muted-foreground">kcal/day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Your Info Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold">Your Profile</p>
                    <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="text-xs text-primary h-7">
                      Edit
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Scale className="h-3 w-3" /> <span>{result.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ruler className="h-3 w-3" /> <span>{result.height} cm</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" /> <span>{result.age} years</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" /> <span className="capitalize">{result.gender}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Input Form */}
          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="text-center mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Scale className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold">Enter Your Details</p>
                    <p className="text-xs text-muted-foreground mt-1">Saved automatically — you only enter once.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Weight (kg)</Label>
                      <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Height (cm)</Label>
                      <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Age</Label>
                      <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Gender</Label>
                      <Select value={gender} onValueChange={v => setGender(v as any)}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Activity Level</Label>
                    <Select value={activity} onValueChange={setActivity}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (office job)</SelectItem>
                        <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                        <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCalculate} className="w-full h-11 text-sm font-semibold">
                    Calculate BMI
                  </Button>
                  {result && (
                    <Button variant="ghost" onClick={() => setShowForm(false)} className="w-full text-xs text-muted-foreground">
                      Cancel
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SubPageLayout>
  );
};

export default HealthBMI;
