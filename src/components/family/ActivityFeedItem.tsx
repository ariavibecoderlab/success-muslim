import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { FeedItem } from '@/hooks/useFamilyDashboard';
import { formatDistanceToNow } from 'date-fns';
import { HandHelping, Heart, Flame } from 'lucide-react';

const REACTION_ICONS: Record<string, React.ReactNode> = {
  dua: <HandHelping className="h-2.5 w-2.5" />,
  love: <Heart className="h-2.5 w-2.5" />,
  fire: <Flame className="h-2.5 w-2.5" />,
};

const BORDER_COLORS: Record<string, string> = {
  achievement: 'border-l-emerald-400',
  streak: 'border-l-amber-400',
  milestone: 'border-l-purple-400',
  prayer: 'border-l-emerald-400',
  quran: 'border-l-blue-400',
  fasting: 'border-l-purple-400',
};

interface ActivityFeedItemProps {
  item: FeedItem;
  onReact: (feedId: string, type: string) => void;
}

const ActivityFeedItem = ({ item, onReact }: ActivityFeedItemProps) => {
  const initials = item.display_name
    ? item.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const borderColor = BORDER_COLORS[item.activity_type] || 'border-l-border';

  return (
    <div className={`border-l-2 ${borderColor} pl-3 py-2`}>
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6 flex-shrink-0 mt-0.5">
          {item.avatar_url && <AvatarImage src={item.avatar_url} />}
          <AvatarFallback className="text-[8px] font-medium bg-muted text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-xs leading-relaxed">{item.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
            {item.reactions?.map(r => (
              <button
                key={r.type}
                onClick={() => onReact(item.id, r.type)}
                className={`flex items-center gap-0.5 text-[10px] transition-colors ${
                  r.reacted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {REACTION_ICONS[r.type]}
                {r.count > 0 && <span>{r.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeedItem;
