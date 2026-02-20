import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFamily } from '@/hooks/useFamily';
import { ArrowLeft, UserPlus, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const JoinFamily = () => {
  const navigate = useNavigate();
  const { code: urlCode } = useParams<{ code?: string }>();
  const { joinFamily, previewFamily } = useFamily();
  const [code, setCode] = useState(urlCode?.toUpperCase() || '');
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [preview, setPreview] = useState<{ family: { id: string; name: string }; memberCount: number } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (urlCode) handlePreview(urlCode.toUpperCase());
  }, [urlCode]);

  const handlePreview = async (c: string) => {
    if (c.length !== 6) return;
    setLoading(true);
    setNotFound(false);
    const result = await previewFamily(c);
    setLoading(false);
    if (result) setPreview(result);
    else setNotFound(true);
  };

  const handleJoin = async () => {
    if (!preview) return;
    setJoining(true);
    const family = await joinFamily(code);
    setJoining(false);
    if (family) navigate(`/family/${family.id}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/family')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Join Family Group</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Enter the 6-character invite code shared by the group admin.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Invite Code</label>
            <div className="flex gap-2">
              <Input
                placeholder="E.g. ABC123"
                value={code}
                onChange={e => {
                  const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                  setCode(v);
                  setPreview(null);
                  setNotFound(false);
                }}
                className="font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
              <Button
                variant="outline"
                onClick={() => handlePreview(code)}
                disabled={code.length !== 6 || loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Look up'}
              </Button>
            </div>
          </div>

          {notFound && (
            <p className="text-sm text-destructive text-center">
              No group found with that code. Check the code and try again.
            </p>
          )}
        </div>

        {preview && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{preview.family.name}</p>
                  <p className="text-xs text-muted-foreground">{preview.memberCount} members</p>
                </div>
              </div>
              <Button className="w-full" onClick={handleJoin} disabled={joining}>
                {joining ? 'Joining…' : `Join ${preview.family.name}`}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            You can be in a maximum of 2 family groups.
          </p>
        </div>
      </main>
    </div>
  );
};

export default JoinFamily;
