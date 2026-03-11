import { useNavigate } from 'react-router-dom';
import { useFamily } from '@/hooks/useFamily';
import { getGroupTerms, getRoleLabel } from '@/lib/family-helpers';
import { Users, Plus, UserPlus, Loader2, BookOpen, HandHelping, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/AppHeader';
import { motion } from 'framer-motion';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const Family = () => {
  const navigate = useNavigate();
  const { families, loading } = useFamily();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (families.length >= 1) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-base font-semibold">My Groups</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-primary font-medium h-8 px-2.5"
            onClick={() => navigate('/family/create')}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New
          </Button>
        </div>

        <motion.main
          className="max-w-md mx-auto px-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {families.map((f, idx) => {
              const terms = getGroupTerms(f.group_type);
              const TypeIcon = terms.icon;
              return (
                <motion.div key={f.id} variants={item}>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/40 transition-colors active:bg-muted/60 ${
                      idx < families.length - 1 ? 'border-b border-border' : ''
                    }`}
                    onClick={() => navigate(`/family/${f.id}/dashboard`)}
                  >
                    <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {f.member_count} member{f.member_count !== 1 ? 's' : ''} · {terms.groupLabel}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">
                      {getRoleLabel(f.user_role || 'member', f.group_type)}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {families.length < 2 && (
            <motion.div variants={item}>
              <button
                className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground py-2.5 hover:text-foreground transition-colors"
                onClick={() => navigate('/family/join')}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Join with invite code
              </button>
            </motion.div>
          )}
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
        className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>

        <h1 className="text-lg font-semibold tracking-tight mb-1">Build together, grow together</h1>
        <p className="text-muted-foreground text-xs max-w-[260px] mb-8">
          Create a private group to track ibadah progress and inspire each other.
        </p>

        <div className="w-full space-y-2 max-w-[260px]">
          <Button
            className="w-full h-10 text-sm rounded-lg"
            onClick={() => navigate('/family/create')}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create a Group
          </Button>
          <Button
            variant="ghost"
            className="w-full h-9 text-xs text-muted-foreground"
            onClick={() => navigate('/family/join')}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Join with Invite Code
          </Button>
        </div>
      </motion.main>
      <div className="h-20" />
    </div>
  );
};

export default Family;
