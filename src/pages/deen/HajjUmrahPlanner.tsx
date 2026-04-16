import { useState, useEffect } from 'react';
import { MapPin, Check, ChevronDown, ChevronUp, Package, BookOpen, Plus } from 'lucide-react';
import SubPageLayout from '@/components/SubPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const IMAN_SIBLINGS = [
  { path: '/iman/prayer-times', label: 'Prayer Times' },
  { path: '/iman/quran', label: 'Quran' },
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/fasting', label: 'Fasting' },
  { path: '/iman/qiyam', label: 'Qiyam' },
  { path: '/iman/ramadan', label: 'Ramadan' },
  { path: '/iman/hajj', label: 'Hajj/Umrah' },
];

const UMRAH_STEPS = [
  {
    id: 'ihram',
    title: 'Ihram',
    description: 'Enter the state of Ihram at the Miqat. Make niyyah for Umrah.',
    duas: [
      { arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً', transliteration: 'Labbayka Allahumma Umratan', meaning: 'Here I am, O Allah, for Umrah.' },
      { arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ', transliteration: 'Labbayka Allahumma labbayk, labbayka la sharika laka labbayk', meaning: 'Here I am O Allah, here I am. Here I am, You have no partner, here I am.' },
    ],
  },
  {
    id: 'tawaf',
    title: 'Tawaf',
    description: 'Circumambulate the Kaaba 7 times counter-clockwise. Start from Hajar al-Aswad.',
    duas: [
      { arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhab an-nar', meaning: 'Our Lord, give us good in this world and good in the Hereafter, and save us from the punishment of the Fire.' },
    ],
  },
  {
    id: 'sai',
    title: "Sa'i",
    description: "Walk between Safa and Marwah 7 times, starting from Safa.",
    duas: [
      { arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ', transliteration: "Innas-Safa wal-Marwata min sha'a'irillah", meaning: 'Indeed, Safa and Marwah are among the symbols of Allah.' },
    ],
  },
  {
    id: 'tahallul',
    title: 'Tahallul',
    description: 'Shave or trim the hair to exit the state of Ihram. Umrah is complete.',
    duas: [],
  },
];

const HAJJ_STEPS = [
  { id: 'ihram_hajj', title: '1. Ihram (8 Dhul Hijjah)', description: 'Enter Ihram from Miqat with niyyah for Hajj.' },
  { id: 'mina_8', title: '2. Mina — Day of Tarwiyah', description: 'Travel to Mina. Pray Dhuhr, Asr, Maghrib, Isha and Fajr (shortened).' },
  { id: 'arafah', title: '3. Arafah — Day of Arafah (9th)', description: "Stand at Arafah from after Dhuhr until Maghrib. The pillar of Hajj. Make du'a abundantly." },
  { id: 'muzdalifah', title: '4. Muzdalifah', description: 'After sunset, proceed to Muzdalifah. Pray Maghrib and Isha combined. Collect pebbles for Jamarat.' },
  { id: 'jamarat_10', title: '5. Jamarat — Day of Nahr (10th)', description: 'Stone Jamarat al-Aqabah with 7 pebbles. Sacrifice animal. Shave/trim hair. Tawaf al-Ifadhah.' },
  { id: 'mina_11', title: '6. Mina (11th)', description: 'Stone all three Jamarat after Dhuhr (7 pebbles each).' },
  { id: 'mina_12', title: '7. Mina (12th)', description: 'Stone all three Jamarat again. May leave Mina after Dhuhr if departing early.' },
  { id: 'tawaf_wida', title: '8. Tawaf al-Wida', description: 'Farewell Tawaf before leaving Makkah. Hajj is complete.' },
];

const PACKING_ITEMS = [
  { cat: 'Documents', items: ['Passport', 'Visa', 'Flight tickets', 'Hotel bookings', 'Vaccination card', 'ID copies'] },
  { cat: 'Ihram', items: ['Ihram cloth (2 white sheets)', 'Belt/waist pouch', 'Unscented soap', 'Sandals/slippers'] },
  { cat: 'Essentials', items: ['Prayer mat', 'Quran/Dua book', 'Tasbih', 'Umbrella', 'Sunscreen (unscented)', 'Water bottle', 'Medications'] },
  { cat: 'Clothing', items: ['Comfortable walking shoes', 'Light clothing', 'Towels', 'Undergarments'] },
];

type JourneyType = 'umrah' | 'hajj';

const HajjUmrahPlanner = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<JourneyType>('umrah');
  const [progress, setProgress] = useState<any>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadProgress();
  }, [user, tab]);

  const loadProgress = async () => {
    if (!user) return;
    const data = await api<any>('api-misc', { params: { resource: 'hajj-umrah', journey_type: tab } });
    setProgress(data);
  };

  const startJourney = async () => {
    if (!user) return;
    const steps = (tab === 'umrah' ? UMRAH_STEPS : HAJJ_STEPS).map(s => ({ id: s.id, completed: false }));
    const packing = PACKING_ITEMS.flatMap(cat => cat.items.map(item => ({ category: cat.cat, item, checked: false })));
    const data = await api<any>('api-misc', {
      method: 'POST',
      params: { resource: 'hajj-umrah' },
      body: { journey_type: tab, started_at: new Date().toISOString(), steps, packing_checklist: packing },
    });
    if (data) setProgress(data);
    toast.success(`${tab === 'umrah' ? 'Umrah' : 'Hajj'} journey started! May Allah accept it.`);
  };

  const toggleStep = async (stepId: string) => {
    if (!progress) return;
    const steps = (progress.steps as any[]).map((s: any) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    await api('api-misc', { method: 'POST', params: { resource: 'hajj-umrah' }, body: { id: progress.id, updates: { steps } } });
    setProgress({ ...progress, steps });
  };

  const togglePacking = async (item: string) => {
    if (!progress) return;
    const checklist = (progress.packing_checklist as any[]).map((p: any) =>
      p.item === item ? { ...p, checked: !p.checked } : p
    );
    await api('api-misc', { method: 'POST', params: { resource: 'hajj-umrah' }, body: { id: progress.id, updates: { packing_checklist: checklist } } });
    setProgress({ ...progress, packing_checklist: checklist });
  };

  const stepsData = tab === 'umrah' ? UMRAH_STEPS : HAJJ_STEPS;
  const completedSteps = progress ? (progress.steps as any[]).filter((s: any) => s.completed).length : 0;
  const totalSteps = stepsData.length;
  const progressPct = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const packingChecked = progress ? (progress.packing_checklist as any[]).filter((p: any) => p.checked).length : 0;
  const packingTotal = progress ? (progress.packing_checklist as any[]).length : 0;

  // Group packing by category
  const packingByCategory = progress
    ? PACKING_ITEMS.map(cat => ({
        cat: cat.cat,
        items: (progress.packing_checklist as any[]).filter((p: any) => p.category === cat.cat),
      }))
    : [];

  return (
    <SubPageLayout title="Hajj & Umrah" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/hajj">
      <div className="space-y-5">
        {/* Tab Selector */}
        <Tabs value={tab} onValueChange={v => setTab(v as JourneyType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="umrah">Umrah</TabsTrigger>
            <TabsTrigger value="hajj">Hajj</TabsTrigger>
          </TabsList>
        </Tabs>

        {!progress ? (
          /* Start Journey CTA */
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 rounded-xl shadow-md">
              <CardContent className="p-6 text-center">
                 <MapPin className="h-10 w-10 text-white/80 mx-auto mb-3" />
                <h2 className="text-lg font-bold">
                  {tab === 'umrah' ? 'Umrah Guide' : 'Hajj Manasik Guide'}
                </h2>
                <p className="text-sm text-white/60 mt-1 mb-4">
                  {tab === 'umrah'
                    ? 'Step-by-step guide: Ihram → Tawaf → Sa\'i → Tahallul'
                    : 'Complete guide through all Hajj manasik with duas'}
                </p>
                <Button onClick={startJourney} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Start {tab === 'umrah' ? 'Umrah' : 'Hajj'} Journey
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Progress Overview */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 rounded-xl shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Manasik Progress</p>
                    <span className="text-xs font-bold text-primary">{completedSteps}/{totalSteps}</span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                  {completedSteps === totalSteps && (
                    <p className="text-xs text-primary font-semibold mt-2 text-center">
                      ✅ {tab === 'umrah' ? 'Umrah' : 'Hajj'} Complete — Taqabbalallah!
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Steps */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className="space-y-2">
                {stepsData.map((step, i) => {
                  const stepProgress = (progress.steps as any[]).find((s: any) => s.id === step.id);
                  const isCompleted = stepProgress?.completed;
                  const isExpanded = expandedStep === step.id;

                  return (
                    <Card key={step.id} className={`rounded-xl border-0 shadow-sm transition-all duration-200 ${isCompleted ? 'bg-primary/5' : ''}`}>
                      <CardContent className="p-0">
                        <Collapsible open={isExpanded} onOpenChange={() => setExpandedStep(isExpanded ? null : step.id)}>
                          <div className="flex items-center gap-3 p-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleStep(step.id); }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                                isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
                              }`}>
                              {isCompleted && <Check className="h-4 w-4" />}
                            </button>
                            <CollapsibleTrigger className="flex-1 text-left">
                              <p className={`text-sm font-semibold ${isCompleted ? 'text-primary' : ''}`}>{step.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                            </CollapsibleTrigger>
                            <CollapsibleTrigger>
                              {'duas' in step && (step as any).duas?.length > 0 && (
                                isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </CollapsibleTrigger>
                          </div>
                          {'duas' in step && (step as any).duas?.length > 0 && (
                            <CollapsibleContent>
                              <div className="px-4 pb-4 space-y-2 border-t border-border pt-3 ml-10">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" /> Duas for this step
                                </p>
                                {(step as any).duas.map((dua: any, j: number) => (
                                  <div key={j} className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-right text-lg font-arabic leading-loose">{dua.arabic}</p>
                                    <p className="text-xs text-primary mt-1 italic">{dua.transliteration}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{dua.meaning}</p>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>

            {/* Packing Checklist */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="rounded-xl border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <Package className="h-4 w-4 text-primary" /> Packing Checklist
                    </p>
                    <span className="text-xs text-muted-foreground">{packingChecked}/{packingTotal}</span>
                  </div>
                  <Progress value={packingTotal > 0 ? (packingChecked / packingTotal) * 100 : 0} className="h-1.5 mb-3" />
                  <div className="space-y-3">
                    {packingByCategory.map(cat => (
                      <div key={cat.cat}>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{cat.cat}</p>
                        <div className="space-y-1">
                          {cat.items.map((item: any) => (
                            <label key={item.item} className="flex items-center gap-2 py-1 cursor-pointer">
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => togglePacking(item.item)}
                              />
                              <span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                {item.item}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* New Journey */}
            <Button variant="outline" className="w-full" onClick={startJourney}>
              Start New {tab === 'umrah' ? 'Umrah' : 'Hajj'} Journey
            </Button>
          </>
        )}
      </div>
    </SubPageLayout>
  );
};

export default HajjUmrahPlanner;
