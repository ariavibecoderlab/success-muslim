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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import LeaderboardCard from '@/components/family/LeaderboardCard';
import ActivityFeedItem from '@/components/family/ActivityFeedItem';
import TodaySnapshot from '@/components/family/TodaySnapshot';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };

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
      {/* Header */}
      <div className="max-w-lg mx-auto px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/family')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {family ? (
                <h1 className="text-sm font-semibold truncate">{family.name}</h1>
              ) : (
                <Skeleton className="h-4 w-24" />
              )}
            </div>
            {family && (
              <p className="text-[11px] text-muted-foreground ml-5">
                {family.member_count} members · {terms.groupLabel}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={refresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => navigate(`/family/${id}/settings`)}>
              <Settings className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-3 space-y-5 pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Announcement */}
            {announcement && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <div className="flex items-start gap-2 px-1 py-2 border-l-2 border-l-amber-400 pl-3">
                  <Megaphone className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-amber-600">{terms.adminLabel}</p>
                    <p className="text-xs text-muted-foreground">{announcement.message}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Post announcement */}
            {isAdmin && (
              <div className="px-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  Post Announcement
                </p>
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Write to your ${terms.groupLabel.toLowerCase()}…`}
                    value={announcementText}
                    onChange={e => setAnnouncementText(e.target.value)}
                    className="min-h-[48px] text-xs resize-none"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0"
                    disabled={!announcementText.trim() || postingAnnouncement}
                    onClick={async () => {
                      setPostingAnnouncement(true);
                      await postAnnouncement(announcementText.trim());
                      setAnnouncementText('');
                      setPostingAnnouncement(false);
                    }}
                  >
                    {postingAnnouncement ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <motion.section variants={stagger} initial="hidden" animate="visible">
              <h2 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-1">Leaderboard</h2>
              {visibleLeaderboard.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No data yet</p>
              ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {visibleLeaderboard.map((entry, idx) => (
                    <motion.div key={entry.user_id} variants={fadeUp} className={idx < visibleLeaderboard.length - 1 ? 'border-b border-border' : ''}>
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
            <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 px-1 mb-1">
                <h2 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Today</h2>
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Prayer</span>
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> Quran</span>
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" /> Fast</span>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border px-2 py-1">
                {leaderboard.filter(e => !e.ghost_mode).map(entry => (
                  <TodaySnapshot
                    key={entry.user_id}
                    entry={entry}
                    onClick={() => navigate(`/family/${id}/member/${entry.user_id}`)}
                  />
                ))}
              </div>
            </motion.section>

            {/* Activity Feed */}
            <motion.section variants={stagger} initial="hidden" animate="visible">
              <h2 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1 mb-1">Activity</h2>
              {feed.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-1">
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
