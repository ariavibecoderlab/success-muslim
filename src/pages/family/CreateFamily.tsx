import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '@/hooks/useFamily';
import { getGroupTerms } from '@/lib/family-helpers';
import { ArrowLeft, Copy, Check, Share2, Home, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

type GroupType = 'family' | 'class';

const CreateFamily = () => {
  const navigate = useNavigate();
  const { createFamily } = useFamily();
  const { toast } = useToast();
  const [groupType, setGroupType] = useState<GroupType | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; name: string; invite_code: string; group_type: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const terms = getGroupTerms(groupType || 'family');

  const handleCreate = async () => {
    if (!name.trim() || !groupType) return;
    setLoading(true);
    const family = await createFamily(name.trim(), groupType);
    setLoading(false);
    if (family) {
      setCreated({
        id: family.id,
        name: family.name,
        invite_code: family.invite_code,
        group_type: family.group_type || groupType,
      });
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!created) return;
    const createdTerms = getGroupTerms(created.group_type);
    const shareText = createdTerms.inviteMessage(created.name, created.invite_code);
    if (navigator.share) {
      try { await navigator.share({ title: createdTerms.inviteTitle(created.name), text: shareText }); } catch {}
    } else {
      await handleCopy(shareText);
    }
  };

  // Success screen
  if (created) {
    const createdTerms = getGroupTerms(created.group_type);
    const TypeIcon = createdTerms.icon;
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 pt-3">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/family/${created.id}/dashboard`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">{createdTerms.groupLabel} Created</span>
          </div>
        </div>

        <motion.main
          className="max-w-md mx-auto px-4 space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
              <TypeIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-base font-semibold">{created.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share the invite to add {created.group_type === 'class' ? 'students' : 'members'}.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Invite Code</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-lg px-3 py-2.5 font-mono text-lg font-bold tracking-widest text-center">
                  {created.invite_code}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(created.invite_code)}>
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <Button className="w-full h-9 text-sm" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Share Invite
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={() => navigate(`/family/${created.id}/dashboard`)}
          >
            Go to Dashboard →
          </Button>
        </motion.main>
      </div>
    );
  }

  // Step 1: Type selector
  if (!groupType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 pt-3">
          <div className="flex items-center gap-2 mb-8">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/family')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Create Group</span>
          </div>
        </div>

        <motion.main
          className="max-w-md mx-auto px-4 space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-2">
            <h2 className="text-base font-semibold mb-0.5">What type of group?</h2>
            <p className="text-xs text-muted-foreground">Choose the type that fits.</p>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors active:bg-muted/60 border-b border-border"
              onClick={() => setGroupType('family')}
            >
              <Home className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Family</p>
                <p className="text-[11px] text-muted-foreground">For family members</p>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors active:bg-muted/60"
              onClick={() => setGroupType('class')}
            >
              <GraduationCap className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Class</p>
                <p className="text-[11px] text-muted-foreground">For teachers and students</p>
              </div>
            </button>
          </div>
        </motion.main>
      </div>
    );
  }

  // Step 2: Name input
  const TypeIcon = terms.icon;
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 pt-3">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setGroupType(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">Create {terms.groupLabel}</span>
        </div>
      </div>

      <motion.main
        className="max-w-lg mx-auto px-4 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Group Name</label>
          <Input
            placeholder={groupType === 'class' ? 'e.g. Kelas 4 Arif' : 'e.g. Keluarga Ahmad'}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            maxLength={50}
            autoFocus
            className="h-10"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{name.length}/50</p>
        </div>

        <Button
          className="w-full h-10 text-sm"
          onClick={handleCreate}
          disabled={!name.trim() || loading}
        >
          {loading ? 'Creating…' : `Create ${terms.groupLabel}`}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          You'll be the {terms.adminLabel.toLowerCase()}. Max 20 {groupType === 'class' ? 'students' : 'members'}.
        </p>
      </motion.main>
    </div>
  );
};

export default CreateFamily;
