import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

interface PrivacySettings {
  show_prayer: boolean;
  show_quran: boolean;
  show_fasting: boolean;
  show_health: boolean;
  show_streaks: boolean;
  show_on_leaderboard: boolean;
  ghost_mode: boolean;
}

const defaults: PrivacySettings = {
  show_prayer: true,
  show_quran: true,
  show_fasting: true,
  show_health: false,
  show_streaks: true,
  show_on_leaderboard: true,
  ghost_mode: false,
};

const FamilyPrivacySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('family_privacy_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => { if (data) setSettings(data as PrivacySettings); });
  }, [user]);

  const update = async (key: keyof PrivacySettings, value: boolean) => {
    if (!user) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    setSaving(true);

    const { error } = await supabase
      .from('family_privacy_settings')
      .upsert({ user_id: user.id, ...next }, { onConflict: 'user_id' });

    setSaving(false);
    if (error) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
      setSettings(settings); // revert
    }
  };

  const Row = ({ label, desc, field }: { label: string; desc?: string; field: keyof PrivacySettings }) => (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <Switch
        checked={settings[field]}
        onCheckedChange={v => update(field, v)}
        disabled={saving || (settings.ghost_mode && field !== 'ghost_mode')}
      />
    </div>
  );

  return (
    <Card>
      <CardContent className="p-5 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Family Privacy</h2>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          Your spiritual journey is personal. Share only what you're comfortable with.
        </p>

        <Row label="Show my prayers" desc="Prayer consistency visible on family dashboard" field="show_prayer" />
        <Separator />
        <Row label="Show my Quran progress" desc="Quran target and streak visible to family" field="show_quran" />
        <Separator />
        <Row label="Show my fasting" desc="Fasting days visible on family dashboard" field="show_fasting" />
        <Separator />
        <Row label="Show my health metrics" desc="Weight, sleep, and hydration data" field="show_health" />
        <Separator />
        <Row label="Show my streaks" desc="Streak counts visible to family members" field="show_streaks" />
        <Separator />
        <Row label="Show me on leaderboard" desc="Appear on the weekly Iman leaderboard" field="show_on_leaderboard" />
        <Separator />
        <div className="pt-1">
          <Row
            label="Ghost mode"
            desc="Hidden from family entirely — you can still see others"
            field="ghost_mode"
          />
          {settings.ghost_mode && (
            <p className="text-[10px] text-muted-foreground bg-muted/50 rounded p-2 mt-1">
              Ghost mode is on. Your progress is hidden from all family groups. You are still a member and can see everyone else.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyPrivacySettings;
