import { useNavigate } from 'react-router-dom';
import { useFamily } from '@/hooks/useFamily';
import { Users, Plus, UserPlus, Loader2, BookOpen, HandHelping, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AppHeader from '@/components/AppHeader';

const Family = () => {
  const navigate = useNavigate();
  const { families, loading } = useFamily();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // If user is in 1 or more families, show selection list
  if (families.length >= 1) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Family" icon={Users} />
        <main className="max-w-lg mx-auto px-4 py-8 space-y-3">
          <p className="text-sm text-muted-foreground mb-4">Your family groups:</p>
          {families.map(f => (
            <Card
              key={f.id}
              className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
              onClick={() => navigate(`/family/${f.id}/dashboard`)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="text-primary font-bold">
                    {f.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.member_count} members</p>
                </div>
                {f.user_role === 'admin' && (
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">Admin</Badge>
                )}
              </CardContent>
            </Card>
          ))}
          {families.length < 2 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/family/join')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join Another Group
            </Button>
          )}
        </main>
        <div className="h-20" />
      </div>
    );
  }

  // Empty state — no family yet
  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Family" icon={Users} />

      <main className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
          <Users className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Build together, grow together</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-8">
          Create a private family group or join one. See each other's progress,
          celebrate milestones, and inspire each other every day.
        </p>

        <div className="w-full space-y-3 max-w-xs">
          <Button
            className="w-full h-12 text-base"
            onClick={() => navigate('/family/create')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create a Family Group
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => navigate('/family/join')}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Join with Invite Code
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-xs">
          {[
            { icon: BookOpen, label: 'Quran streaks' },
            { icon: HandHelping, label: 'Prayer check-ins' },
            { icon: BarChart2, label: 'Leaderboard' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground text-center">{item.label}</p>
            </div>
          ))}
        </div>
      </main>

      <div className="h-20" />
    </div>
  );
};

export default Family;
