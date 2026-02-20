import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFamily, type FamilyMember } from '@/hooks/useFamily';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyDashboard, type LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { ArrowLeft, Flame, Loader2, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface PrivacySettings {
  show_prayer: boolean;
  show_quran: boolean;
  show_fasting: boolean;
  show_health: boolean;
  show_streaks: boolean;
  ghost_mode: boolean;
}

const MemberProfile = () => {
  const { id: familyId, uid } = useParams<{ id: string; uid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaderboard } = useFamilyDashboard(familyId ?? null);
  const { families } = useFamily();
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [memberInfo, setMemberInfo] = useState<FamilyMember | null>(null);
  const [loadingPrivacy, setLoadingPrivacy] = useState(true);

  const entry: LeaderboardEntry | undefined = leaderboard.find(e => e.user_id === uid);
  const family = families.find(f => f.id === familyId);
  const isOwnProfile = uid === user?.id;

  useEffect(() => {
    if (!uid) return;
    // Load privacy settings (only accessible if user shares them or it's own profile)
    if (isOwnProfile) {
      supabase
        .from('family_privacy_settings')
        .select('show_prayer,show_quran,show_fasting,show_health,show_streaks,ghost_mode')
        .eq('user_id', uid)
        .single()
        .then(({ data }) => {
          setPrivacy(data as PrivacySettings | null);
          setLoadingPrivacy(false);
        });
    } else {
      setLoadingPrivacy(false);
    }
  }, [uid, isOwnProfile]);

  if (!entry && !loadingPrivacy) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <EyeOff className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">This member's profile is private.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const initials = entry?.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const pct = (val: number, max: number) => Math.round((val / max) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Member Profile</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-5 pb-24">
        {/* Profile header */}
        <div className="flex flex-col items-center text-center pb-2">
          <Avatar className="h-20 w-20 border-2 border-primary/20 mb-3">
            {entry?.avatar_url && <AvatarImage src={entry.avatar_url} />}
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{entry?.display_name || 'Member'}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{family?.name}</p>
          {isOwnProfile && (
            <Badge variant="outline" className="mt-1.5 text-[10px]">You</Badge>
          )}
        </div>

        {/* Iman Score */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 text-center">
            <p className="text-4xl font-bold text-primary">{entry?.iman_score ?? '—'}</p>
            <p className="text-sm text-muted-foreground mt-1">Iman Score this week</p>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{entry?.prayers_this_week ?? '—'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Prayers this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{entry?.quran_days_this_week ?? '—'}<span className="text-sm text-muted-foreground">/7</span></p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Quran days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{entry?.fasting_days_this_week ?? '—'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Fasting days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center flex flex-col items-center">
              <p className="text-2xl font-bold flex items-center gap-1">
                <Flame className="h-5 w-5 text-orange-500" />
                {entry?.quran_streak ?? '—'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Day streak</p>
            </CardContent>
          </Card>
        </div>

        {entry?.ghost_mode && !isOwnProfile && (
          <Card className="border-dashed">
            <CardContent className="p-4 flex items-center gap-2 text-muted-foreground">
              <EyeOff className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs">This member has enabled ghost mode — some data is hidden.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MemberProfile;
