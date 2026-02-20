import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '@/hooks/useFamily';
import { ArrowLeft, Users, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const CreateFamily = () => {
  const navigate = useNavigate();
  const { createFamily } = useFamily();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; name: string; invite_code: string; invite_link: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const family = await createFamily(name.trim());
    setLoading(false);
    if (family) {
      setCreated({
        id: family.id,
        name: family.name,
        invite_code: family.invite_code,
        invite_link: family.invite_link,
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
    const shareText = `Join my family group "${created.name}" on Success Muslim!\n\nInvite code: ${created.invite_code}\n\nOr join directly: ${created.invite_link}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join my family group', text: shareText }); } catch {}
    } else {
      await handleCopy(shareText);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/family/${created.id}/dashboard`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">Family Created!</h1>
          </div>
        </div>

        <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">{created.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Your family group is ready! Share the invite to add members.</p>
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

              {created.invite_link && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Invite Link</p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 truncate text-muted-foreground font-mono">
                      {created.invite_link}
                    </p>
                    <Button variant="outline" size="icon" onClick={() => handleCopy(created.invite_link!)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Invite (WhatsApp, etc.)
              </Button>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/family/${created.id}/dashboard`)}
          >
            Go to Family Dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/family')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Create Family Group</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Give your family group a name. You'll get a unique invite code to share.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Group Name</label>
            <Input
              placeholder="e.g. Keluarga Ahmad, Kelas 4 Arif"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">{name.length}/50</p>
          </div>

          <Button
            className="w-full h-12"
            onClick={handleCreate}
            disabled={!name.trim() || loading}
          >
            {loading ? 'Creating…' : 'Create Group'}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            You'll be the group admin. Max 20 members per group.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreateFamily;
