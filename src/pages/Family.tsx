import { useNavigate } from 'react-router-dom';
import { useFamily } from '@/hooks/useFamily';
import { getGroupTerms, getRoleLabel } from '@/lib/family-helpers';
import { Users, Plus, UserPlus, Loader2, BookOpen, HandHelping, BarChart2, Home, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AppHeader from '@/components/AppHeader';
import { motion } from 'framer-motion';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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
      <div className="min-h-screen bg-background">
        <AppHeader title="My Groups" />
        <motion.main
          className="max-w-lg mx-auto px-4 py-8 space-y-3"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {families.map(f => {
            const terms = getGroupTerms(f.group_type);
            const TypeIcon = terms.icon;
            return (
              <motion.div key={f.id} variants={item}>
                <div
                  className={`cursor-pointer rounded-2xl bg-gradient-to-br ${terms.gradient} p-4 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]`}
                  onClick={() => navigate(`/family/${f.id}/dashboard`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate">{f.name}</p>
                      <p className="text-white/80 text-xs">{f.member_count} members · {terms.groupLabel}</p>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] flex-shrink-0">
                      {getRoleLabel(f.user_role || 'member', f.group_type)}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <motion.div variants={item} className="pt-2 space-y-2">
            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg"
              onClick={() => navigate('/family/create')}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Group
            </Button>
            {families.length < 2 && (
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl"
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
    <div className="min-h-screen bg-background">
      <AppHeader title="Family" />
      <motion.main
        className="max-w-lg mx-auto px-4 py-12 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center mb-6">
          <Users className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-2">Build together, grow together</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-8">
          Create a private family group or class. See each other's progress,
          celebrate milestones, and inspire each other every day.
        </p>

        <div className="w-full space-y-3 max-w-xs">
          <Button
            className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg"
            onClick={() => navigate('/family/create')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create a Group
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base rounded-xl"
            onClick={() => navigate('/family/join')}
          >
            <UserPlus className="h-5 w-5 mr-2" />
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
            { icon: BookOpen, label: 'Quran streaks', color: 'from-blue-500/20 to-blue-600/10' },
            { icon: HandHelping, label: 'Prayer check-ins', color: 'from-emerald-500/20 to-emerald-600/10' },
            { icon: BarChart2, label: 'Leaderboard', color: 'from-amber-500/20 to-amber-600/10' },
          ].map(feat => (
            <motion.div key={feat.label} variants={item} className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center`}>
                <feat.icon className="h-5 w-5 text-primary" />
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
