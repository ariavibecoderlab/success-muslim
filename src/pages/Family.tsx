import { useNavigate } from 'react-router-dom';
import { useFamily } from '@/hooks/useFamily';
import { getGroupTerms, getRoleLabel } from '@/lib/family-helpers';
import { Users, Plus, UserPlus, Loader2, BookOpen, HandHelping, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '@/components/AppHeader';
import { motion } from 'framer-motion';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

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

  if (families.length >= 1) {
    return (
      <div className="min-h-screen bg-muted/30">
        <AppHeader title="My Groups" />
        <motion.main
          className="max-w-lg mx-auto px-4 py-6 space-y-3"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {families.map(f => {
            const terms = getGroupTerms(f.group_type);
            const TypeIcon = terms.icon;
            return (
              <motion.div key={f.id} variants={item}>
                <Card
                  className={`cursor-pointer rounded-xl border-l-[3px] shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${
                    f.group_type === 'class' ? 'border-l-blue-400' : 'border-l-emerald-400'
                  }`}
                  onClick={() => navigate(`/family/${f.id}/dashboard`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${terms.headerGradient} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon className={`h-5 w-5 ${f.group_type === 'class' ? 'text-blue-500' : 'text-emerald-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{f.name}</p>
                        <p className="text-muted-foreground text-xs">{f.member_count} members</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4">{terms.groupLabel}</Badge>
                        <Badge className={`text-[9px] py-0 px-1.5 h-4 ${
                          f.group_type === 'class'
                            ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}>
                          {getRoleLabel(f.user_role || 'member', f.group_type)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          <motion.div variants={item} className="pt-2 space-y-2">
            <Button
              className="w-full h-11 font-semibold rounded-xl"
              onClick={() => navigate('/family/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
            {families.length < 2 && (
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl"
                onClick={() => navigate('/family/join')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join with Invite Code
              </Button>
            )}
          </motion.div>
        </motion.main>
        <div className="h-20" />
      </div>
    );
  }

  // Empty state
  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader title="Family" />
      <motion.main
        className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
          <Users className="h-8 w-8 text-emerald-500" />
        </div>

        <h1 className="text-xl font-bold tracking-tight mb-2">Build together, grow together</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-8">
          Create a private family group or class. See each other's progress,
          celebrate milestones, and inspire each other every day.
        </p>

        <div className="w-full space-y-3 max-w-xs">
          <Button
            className="w-full h-11 text-sm font-semibold rounded-xl"
            onClick={() => navigate('/family/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create a Group
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 text-sm rounded-xl"
            onClick={() => navigate('/family/join')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join with Invite Code
          </Button>
        </div>

        <motion.div
          className="mt-10 grid grid-cols-3 gap-4 w-full max-w-xs"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: BookOpen, label: 'Quran streaks', color: 'bg-blue-50', iconColor: 'text-blue-500' },
            { icon: HandHelping, label: 'Prayer check-ins', color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
            { icon: BarChart2, label: 'Leaderboard', color: 'bg-amber-50', iconColor: 'text-amber-500' },
          ].map(feat => (
            <motion.div key={feat.label} variants={item} className="flex flex-col items-center gap-1.5">
              <div className={`w-11 h-11 rounded-xl ${feat.color} flex items-center justify-center`}>
                <feat.icon className={`h-5 w-5 ${feat.iconColor}`} />
              </div>
              <p className="text-[10px] text-muted-foreground text-center">{feat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.main>
      <div className="h-20" />
    </div>
  );
};

export default Family;
