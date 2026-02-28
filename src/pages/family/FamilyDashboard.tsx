import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFamilyDashboard } from '@/hooks/useFamilyDashboard';
import { useFamily } from '@/hooks/useFamily';
import { useAuth } from '@/hooks/useAuth';
import { getGroupTerms } from '@/lib/family-helpers';
import {
  ArrowLeft, Settings, Loader2, RefreshCw, Users, Megaphone, Send
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import LeaderboardCard from '@/components/family/LeaderboardCard';
import ActivityFeedItem from '@/components/family/ActivityFeedItem';
import TodaySnapshot from '@/components/family/TodaySnapshot';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const slideRight = { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } };

const FamilyDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { families } = useFamily();
  const { leaderboard, feed, announcement, loading, refresh, toggleReaction, postAnnouncement } = useFamilyDashboard(id ?? null);
  const [announcementText, setAnnouncementText] = useState('');
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  const family = families.find(f => f.id === id);
  const isAdmin = family?.user_role === 'admin';
  const terms = getGroupTerms(family?.group_type);
  const TypeIcon = terms.icon;

  const visibleLeaderboard = leaderboard.filter(e => !e.ghost_mode && e.show_on_leaderboard);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className={`bg-gradient-to-br ${terms.gradient} text-white`}>
        <div className="max-w-lg mx-auto px-4 pt-3 pb-5">
          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate('/family')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate(`/family/${id}/settings`)}>
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <TypeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-xl truncate">{family?.name || 'Group'}</h1>
              {family ? (
                <p className="text-white/80 text-xs">{family.member_count} members · {terms.groupLabel}</p>
              ) : (
                <Skeleton className="h-3 w-20 mt-0.5 bg-white/20" />
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-6 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Announcement banner */}
            {announcement && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="rounded-2xl bg-gradient-to-r from-amber-400/20 to-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2">
                  <Megaphone className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{terms.adminLabel} says:</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{announcement.message}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Admin: post announcement */}
            {isAdmin && (
              <Card className="border-dashed border-border">
                <CardContent className="p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                    <Megaphone className="h-3 w-3" /> Post Announcement
                  </p>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={`Write an announcement for your ${terms.groupLabel.toLowerCase()}…`}
                      value={announcementText}
                      onChange={e => setAnnouncementText(e.target.value)}
                      className="min-h-[60px] text-sm resize-none"
                    />
                    <Button
                      size="icon"
                      disabled={!announcementText.trim() || postingAnnouncement}
                      onClick={async () => {
                        setPostingAnnouncement(true);
                        await postAnnouncement(announcementText.trim());
                        setAnnouncementText('');
                        setPostingAnnouncement(false);
                      }}
                    >
                      {postingAnnouncement ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leaderboard */}
            <motion.section variants={stagger} initial="hidden" animate="visible">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">This Week's Leaderboard</h2>
              </div>
              {visibleLeaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No leaderboard data yet — start tracking your ibadah!</p>
              ) : (
                <div className="space-y-2">
                  {visibleLeaderboard.map((entry, idx) => (
                    <motion.div key={entry.user_id} variants={slideRight}>
                      <LeaderboardCard
                        entry={entry}
                        rank={idx + 1}
                        isCurrentUser={entry.user_id === user?.id}
                        onClick={() => navigate(`/family/${id}/member/${entry.user_id}`)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Today's snapshot */}
            <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Today's Snapshot</h2>
              <Card className="rounded-2xl">
                <CardContent className="p-3 divide-y divide-border">
                  {leaderboard.filter(e => !e.ghost_mode).map(entry => (
                    <TodaySnapshot
                      key={entry.user_id}
                      entry={entry}
                      onClick={() => navigate(`/family/${id}/member/${entry.user_id}`)}
                    />
                  ))}
                </CardContent>
              </Card>
            </motion.section>

            {/* Activity Feed */}
            <motion.section variants={stagger} initial="hidden" animate="visible">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Activity Feed</h2>
              {feed.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity yet. Complete your daily ibadah to start the feed!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {feed.map(item => (
                    <motion.div key={item.id} variants={fadeUp}>
                      <ActivityFeedItem item={item} onReact={toggleReaction} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default FamilyDashboard;
