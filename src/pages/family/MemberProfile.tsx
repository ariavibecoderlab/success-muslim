import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFamily, type FamilyMember } from '@/hooks/useFamily';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyDashboard, type LeaderboardEntry } from '@/hooks/useFamilyDashboard';
import { getGroupTerms } from '@/lib/family-helpers';
import { ArrowLeft, Flame, Loader2, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <EyeOff className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-muted-foreground text-xs">This profile is private.</p>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/family/${familyId}/dashboard`)}>Go back</Button>
      </div>
    );
  }

  const initials = entry?.display_name
    ? entry.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const stats = [
    { label: 'Prayers', value: entry?.prayers_this_week ?? '—', color: 'text-emerald-500' },
    { label: 'Quran', value: `${entry?.quran_days_this_week ?? '—'}/7`, color: 'text-blue-500' },
    { label: 'Fasting', value: entry?.fasting_days_this_week ?? '—', color: 'text-purple-500' },
    { label: 'Streak', value: entry?.quran_streak ?? '—', color: 'text-amber-500', icon: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/family/${familyId}/dashboard`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{terms.memberLabel} Profile</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-14 w-14 mb-2">
            {entry?.avatar_url && <AvatarImage src={entry.avatar_url} />}
            <AvatarFallback className="text-base font-medium bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-base font-semibold">{entry?.display_name || terms.memberLabel}</h2>
          <p className="text-[11px] text-muted-foreground">{family?.name}</p>
          {isOwnProfile && (
            <span className="text-[9px] text-primary font-medium mt-0.5">you</span>
          )}
        </div>
      </div>

      <motion.main
        className="max-w-md mx-auto px-4 space-y-4 pb-24"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Iman Score */}
        <div className="text-center py-4 bg-card rounded-xl border border-border">
          <p className="text-3xl font-bold text-primary">{entry?.iman_score ?? '—'}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Iman Score</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map(stat => (
            <div key={stat.label} className="text-center py-3 bg-card rounded-lg border border-border">
              <p className={`text-lg font-semibold ${stat.color} flex items-center justify-center gap-0.5`}>
                {stat.icon && <Flame className="h-3.5 w-3.5" />}
                {stat.value}
              </p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {entry?.ghost_mode && !isOwnProfile && (
          <div className="flex items-center gap-2 text-muted-foreground px-1 py-2">
            <EyeOff className="h-3.5 w-3.5 flex-shrink-0" />
            <p className="text-[11px]">Some data is hidden (ghost mode).</p>
          </div>
        )}
      </motion.main>
    </div>
  );
};

export default MemberProfile;
