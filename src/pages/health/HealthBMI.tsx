import { useState } from 'react';
import { Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SubPageLayout from '@/components/SubPageLayout';
import { getBMI, saveBMI, calculateBMI, calculateTDEE, bmiCategory, todayKey, type BMIData } from '@/lib/health-storage';
import EditableText from '@/components/cms/EditableText';

const HEALTH_SIBLINGS = [
  { path: '/health/bmi', label: 'BMI' },
  { path: '/health/weight', label: 'Weight' },
  { path: '/health/hydration', label: 'Hydration' },
  { path: '/health/sleep', label: 'Sleep' },
  { path: '/health/fasting', label: 'Fasting' },
  { path: '/health/if-timer', label: 'IF Timer' },
];

const HealthBMI = () => {
  const saved = getBMI();
  const [weight, setWeight] = useState(saved?.weight?.toString() || '');
  const [height, setHeight] = useState(saved?.height?.toString() || '');
  const [age, setAge] = useState(saved?.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female'>(saved?.gender || 'male');
  const [activity, setActivity] = useState<string>(saved?.activityLevel || 'sedentary');
  const [result, setResult] = useState<BMIData | null>(saved);

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
  };

  const cat = result ? bmiCategory(result.bmi) : null;

  return (
    <SubPageLayout title="BMI Calculator" backTo="/health" siblingRoutes={HEALTH_SIBLINGS} currentPath="/health/bmi">
      <div className="space-y-5">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Weight (kg)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
              </div>
              <div>
                <Label className="text-xs">Height (cm)</Label>
                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" />
              </div>
              <div>
                <Label className="text-xs">Age</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30" />
              </div>
              <div>
                <Label className="text-xs">Gender</Label>
                <Select value={gender} onValueChange={v => setGender(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Activity Level</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Exercise</SelectItem>
                  <SelectItem value="moderate">Moderate Exercise</SelectItem>
                  <SelectItem value="active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCalculate} className="w-full">Calculate</Button>
          </CardContent>
        </Card>

        {result && cat && (
          <Card>
            <CardContent className="p-4 text-center space-y-3">
              <Scale className="h-8 w-8 mx-auto text-primary" />
              <div>
                <p className="text-4xl font-bold">{result.bmi}</p>
                <p className={`text-sm font-medium ${cat.color}`}>{cat.label}</p>
              </div>
              <div className="border-t border-border pt-3">
                <EditableText elementKey="bmi.tdee.label" defaultText="Daily Calorie Need (TDEE)" tag="p" className="text-xs text-muted-foreground" />
                <p className="text-2xl font-bold">{result.tdee} <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SubPageLayout>
  );
};

export default HealthBMI;
