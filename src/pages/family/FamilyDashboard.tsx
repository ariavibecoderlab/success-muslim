import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFamilyDashboard } from '@/hooks/useFamilyDashboard';
import { useFamily } from '@/hooks/useFamily';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, Settings, Loader2, RefreshCw, Users, Megaphone, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import LeaderboardCard from '@/components/family/LeaderboardCard';
import ActivityFeedItem from '@/components/family/ActivityFeedItem';
import TodaySnapshot from '@/components/family/TodaySnapshot';

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

  const visibleLeaderboard = leaderboard.filter(e => !e.ghost_mode && e.show_on_leaderboard);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/family')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{family?.name || 'Family'}</h1>
            {family ? (
              <p className="text-xs text-muted-foreground">{family.member_count} members</p>
            ) : (
              <Skeleton className="h-3 w-20 mt-0.5" />
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="icon" onClick={() => navigate(`/family/${id}/settings`)}>
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Announcement banner */}
            {announcement && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-3 flex items-start gap-2">
                  <Megaphone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Admin announcement</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{announcement.message}</p>
                  </div>
                </CardContent>
              </Card>
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
                      placeholder="Write an announcement for your group…"
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
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">This Week's Leaderboard</h2>
              </div>
              {visibleLeaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No leaderboard data yet — start tracking your ibadah!</p>
              ) : (
                <div className="space-y-2">
                  {visibleLeaderboard.map((entry, idx) => (
                    <LeaderboardCard
                      key={entry.user_id}
                      entry={entry}
                      rank={idx + 1}
                      isCurrentUser={entry.user_id === user?.id}
                      onClick={() => navigate(`/family/${id}/member/${entry.user_id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Today's snapshot */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Today's Snapshot</h2>
              <Card>
                <CardContent className="p-4 divide-y divide-border">
                  {leaderboard.filter(e => !e.ghost_mode).map((entry, i, arr) => (
                    <div key={entry.user_id}>
                      <TodaySnapshot
                        entry={entry}
                        onClick={() => navigate(`/family/${id}/member/${entry.user_id}`)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* Activity Feed */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Activity Feed</h2>
              {feed.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity yet. Complete your daily ibadah to start the feed!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {feed.map(item => (
                    <ActivityFeedItem key={item.id} item={item} onReact={toggleReaction} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default FamilyDashboard;
