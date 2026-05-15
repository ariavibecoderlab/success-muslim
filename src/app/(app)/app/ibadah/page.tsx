import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { IbadahClient } from './IbadahClient';
import { getPrayerTimes } from '@/lib/prayer-times';
import { isRamadan } from '@/lib/hijri';
import { Card, CardTitle } from '@/components/ui/Card';
import { PrayerList } from './PrayerList';
import { QiblaButton } from './QiblaButton';

export default async function IbadahPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('location_lat, location_lng, timezone')
    .eq('id', user.id)
    .single();

  const { data: prefs } = await supabase
    .from('prayer_preferences')
    .select('location_lat, location_lng, suhoor_reminder_enabled, iftar_reminder_enabled')
    .eq('user_id', user.id)
    .single();

  const lat = prefs?.location_lat ?? profile?.location_lat ?? 3.1390;
  const lng = prefs?.location_lng ?? profile?.location_lng ?? 101.6869;
  const timezone = profile?.timezone ?? 'Asia/Kuala_Lumpur';
  const prayers = getPrayerTimes(lat, lng, timezone);
  const ramadanMode = isRamadan();

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Ibadah</h1>

      <IbadahClient prayers={prayers} />

      <Card className="mt-4">
        <CardTitle>Prayer Times</CardTitle>
        <PrayerList prayers={prayers} />
      </Card>

      <div className="mt-4">
        <QiblaButton lat={lat} lng={lng} />
      </div>

      <Card className="mt-4">
        <div className="flex justify-between items-center">
          <CardTitle>Ramadan Mode</CardTitle>
          <span className={`text-sm font-medium ${ramadanMode ? 'text-primary' : 'text-gray-500'}`}>
            {ramadanMode ? 'Active' : 'Off'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {ramadanMode
            ? 'Ramadan detected. Suhoor & Iftar reminders enabled.'
            : 'Ramadan mode activates automatically during Ramadan.'}
        </p>
      </Card>
    </div>
  );
}
