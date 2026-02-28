import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '@/hooks/useFamily';
import { getGroupTerms } from '@/lib/family-helpers';
import { ArrowLeft, Users, Copy, Check, Share2, Home, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/family/${created.id}/dashboard`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">{createdTerms.groupLabel} Created!</h1>
          </div>
        </div>

        <motion.main
          className="max-w-lg mx-auto px-4 py-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${createdTerms.headerGradient} flex items-center justify-center mx-auto mb-3`}>
              <TypeIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{created.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your {createdTerms.groupLabel.toLowerCase()} is ready! Share the invite to add {created.group_type === 'class' ? 'students' : 'members'}.
            </p>
          </div>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Invite Code</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-xl font-bold tracking-widest text-center">
                    {created.invite_code}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => handleCopy(created.invite_code)}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Invite
              </Button>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/family/${created.id}/dashboard`)}
          >
            Go to {createdTerms.groupLabel} Dashboard
          </Button>
        </motion.main>
      </div>
    );
  }

  // Step 1: Type selector
  if (!groupType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/family')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">Create Group</h1>
          </div>
        </div>

        <motion.main
          className="max-w-lg mx-auto px-4 py-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">What type of group?</h2>
            <p className="text-sm text-muted-foreground">Choose the type that best fits your group.</p>
          </div>

          <div className="space-y-3">
            <button
              className="w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white text-left shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              onClick={() => setGroupType('family')}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Home className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">Family</p>
                  <p className="text-white/80 text-sm">For family members</p>
                </div>
              </div>
            </button>

            <button
              className="w-full rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white text-left shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              onClick={() => setGroupType('class')}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">Class</p>
                  <p className="text-white/80 text-sm">For teachers and students</p>
                </div>
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setGroupType(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Create {terms.groupLabel} Group</h1>
        </div>
      </div>

      <motion.main
        className="max-w-lg mx-auto px-4 py-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${terms.headerGradient} flex items-center justify-center mx-auto mb-3`}>
            <TypeIcon className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Give your {terms.groupLabel.toLowerCase()} a name. You'll get a unique invite code to share.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Group Name</label>
            <Input
              placeholder={groupType === 'class' ? 'e.g. Kelas 4 Arif, Halaqah Group' : 'e.g. Keluarga Ahmad'}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">{name.length}/50</p>
          </div>

          <Button
            className={`w-full h-12 bg-gradient-to-r ${terms.gradient} hover:opacity-90 text-white font-semibold rounded-xl`}
            onClick={handleCreate}
            disabled={!name.trim() || loading}
          >
            {loading ? 'Creating…' : `Create ${terms.groupLabel}`}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            You'll be the {terms.adminLabel.toLowerCase()}. Max 20 {groupType === 'class' ? 'students' : 'members'} per group.
          </p>
        </div>
      </motion.main>
    </div>
  );
};

export default CreateFamily;
