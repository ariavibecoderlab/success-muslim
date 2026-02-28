import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFamily, type FamilyMember } from '@/hooks/useFamily';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyDashboard, type LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { getGroupTerms } from '@/lib/family-helpers';
import { ArrowLeft, Flame, Loader2, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

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
  const terms = getGroupTerms(family?.group_type);

  useEffect(() => {
    if (!uid) return;
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
        <p className="text-muted-foreground text-sm">This {terms.memberLabel.toLowerCase()}'s profile is private.</p>
        <Button variant="outline" onClick={() => navigate(`/family/${familyId}/dashboard`)}>Go back</Button>
      </div>
    );
  }

  const initials = entry?.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const STAT_CARDS = [
    { label: 'Prayers this week', value: entry?.prayers_this_week ?? '—', color: 'from-emerald-500/15 to-emerald-600/5', textColor: 'text-emerald-600' },
    { label: 'Quran days', value: `${entry?.quran_days_this_week ?? '—'}/7`, color: 'from-blue-500/15 to-blue-600/5', textColor: 'text-blue-600' },
    { label: 'Fasting days', value: entry?.fasting_days_this_week ?? '—', color: 'from-purple-500/15 to-purple-600/5', textColor: 'text-purple-600' },
    { label: 'Day streak', value: entry?.quran_streak ?? '—', color: 'from-amber-500/15 to-amber-600/5', textColor: 'text-amber-600', icon: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`bg-gradient-to-br ${terms.gradient} text-white`}>
        <div className="max-w-lg mx-auto px-4 pt-3 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate(`/family/${familyId}/dashboard`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-white">{terms.memberLabel} Profile</h1>
          </div>
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 border-2 border-white/30 mb-3">
              {entry?.avatar_url && <AvatarImage src={entry.avatar_url} />}
              <AvatarFallback className="text-xl font-bold bg-white/20 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-white">{entry?.display_name || terms.memberLabel}</h2>
            <p className="text-white/80 text-xs mt-0.5">{family?.name}</p>
            {isOwnProfile && (
              <Badge className="mt-1.5 text-[10px] bg-white/20 text-white border-white/30">You</Badge>
            )}
          </div>
        </div>
      </div>

      <motion.main
        className="max-w-lg mx-auto px-4 -mt-4 space-y-4 pb-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Iman Score */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardContent className="p-5 text-center">
            <p className="text-4xl font-bold text-primary">{entry?.iman_score ?? '—'}</p>
            <p className="text-sm text-muted-foreground mt-1">Iman Score this week</p>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {STAT_CARDS.map(stat => (
            <Card key={stat.label} className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <CardContent className={`p-4 text-center bg-gradient-to-br ${stat.color}`}>
                <p className={`text-2xl font-bold ${stat.textColor} flex items-center justify-center gap-1`}>
                  {stat.icon && <Flame className="h-5 w-5" />}
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {entry?.ghost_mode && !isOwnProfile && (
          <Card className="border-dashed rounded-2xl">
            <CardContent className="p-4 flex items-center gap-2 text-muted-foreground">
              <EyeOff className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs">This {terms.memberLabel.toLowerCase()} has enabled ghost mode — some data is hidden.</p>
            </CardContent>
          </Card>
        )}
      </motion.main>
    </div>
  );
};

export default MemberProfile;
