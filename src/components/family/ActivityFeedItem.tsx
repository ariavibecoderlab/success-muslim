import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { FeedItem } from '@/hooks/useFamilyDashboard';
import { formatDistanceToNow } from 'date-fns';
import { HandHelping, Heart, Flame } from 'lucide-react';

const REACTION_ICONS: Record<string, React.ReactNode> = {
  dua: <HandHelping className="h-3 w-3" />,
  love: <Heart className="h-3 w-3" />,
  fire: <Flame className="h-3 w-3" />,
};

interface ActivityFeedItemProps {
  item: FeedItem;
  onReact: (feedId: string, type: string) => void;
}

const ActivityFeedItem = ({ item, onReact }: ActivityFeedItemProps) => {
  const initials = item.display_name
    ? item.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5 border border-border">
            {item.avatar_url && <AvatarImage src={item.avatar_url} />}
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug">{item.message}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>

            {/* Reactions */}
            <div className="flex gap-2 mt-2">
              {item.reactions?.map(r => (
                <button
                  key={r.type}
                  onClick={() => onReact(item.id, r.type)}
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
                    r.reacted
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <span>{REACTION_ICONS[r.type]}</span>
                  {r.count > 0 && <span className="font-medium">{r.count}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeedItem;
