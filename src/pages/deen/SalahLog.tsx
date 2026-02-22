import { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSalahLog, logSalah, SALAH_NAMES, SalahName, SalahStatus } from '@/lib/salah-storage';
import SubPageLayout from '@/components/SubPageLayout';
import BackdateDatePicker from '@/components/BackdateDatePicker';
import BackdatePrompt from '@/components/BackdatePrompt';
import { motion } from 'framer-motion';

const IMAN_SIBLINGS = [
  { path: '/iman/prayer-times', label: 'Prayer Times' },
  { path: '/iman/salah-log', label: 'Salah Log' },
  { path: '/iman/quran', label: 'Quran' },
  { path: '/iman/dhikr', label: 'Dhikr' },
  { path: '/iman/sunnah', label: 'Sunnah' },
  { path: '/iman/fasting', label: 'Fasting' },
];

const STATUS_CONFIG: { status: SalahStatus; label: string; icon: typeof CheckCircle2; color: string }[] = [
  { status: 'ontime', label: 'On Time', icon: CheckCircle2, color: 'text-green-500' },
  { status: 'late', label: 'Late', icon: Clock, color: 'text-amber-500' },
  { status: 'missed', label: 'Missed', icon: XCircle, color: 'text-red-500' },
];

const SalahLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const [log, setLog] = useState(getSalahLog(dateKey));

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const key = format(date, 'yyyy-MM-dd');
    setLog(getSalahLog(key));
  };

  const handleStatus = (prayer: SalahName, status: SalahStatus) => {
    const current = log.prayers[prayer].status;
    const newStatus = current === status ? null : status;
    const updated = logSalah(prayer, newStatus, dateKey);
    setLog(updated);
  };

  const logged = SALAH_NAMES.filter(n => log.prayers[n].status !== null).length;

  return (
    <SubPageLayout title="Salah Log" backTo="/iman" siblingRoutes={IMAN_SIBLINGS} currentPath="/iman/salah-log">
      <BackdatePrompt moduleKey="salah-log" onLogPastData={() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        handleDateChange(yesterday);
      }} />

      <div className="space-y-4">
        <BackdateDatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />

        <p className="text-center text-xs text-muted-foreground">
          {logged}/5 prayers logged
        </p>

        <div className="space-y-2">
          {SALAH_NAMES.map((prayer, i) => {
            const current = log.prayers[prayer].status;
            return (
              <motion.div
                key={prayer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={current ? 'border-primary/20' : ''}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {current ? (
                          <CheckCircle2 className={`h-5 w-5 ${
                            current === 'ontime' ? 'text-green-500' :
                            current === 'late' ? 'text-amber-500' : 'text-red-500'
                          }`} />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">{prayer}</span>
                      </div>
                      <div className="flex gap-1">
                        {STATUS_CONFIG.map(({ status, label, color }) => (
                          <Button
                            key={status}
                            size="sm"
                            variant={current === status ? 'default' : 'outline'}
                            className="h-7 text-[10px] px-2"
                            onClick={() => handleStatus(prayer, status)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SubPageLayout>
  );
};

export default SalahLog;
