import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFamily, type FamilyMember } from '@/hooks/useFamily';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Crown, Loader2, Trash2, UserMinus, RefreshCw, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const FamilySettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { families, getFamilyMembers, renameFamily, removeMember, transferAdmin, leaveFamily } = useFamily();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);

  const family = families.find(f => f.id === id);
  const isAdmin = family?.user_role === 'admin';

  useEffect(() => {
    if (!id) return;
    setNewName(family?.name || '');
    getFamilyMembers(id).then(m => { setMembers(m); setLoading(false); });
  }, [id, family?.name]);

  const handleRename = async () => {
    if (!id || !newName.trim()) return;
    setRenaming(true);
    await renameFamily(id, newName);
    setRenaming(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!id) return;
    await removeMember(id, memberId);
    setMembers(prev => prev.filter(m => m.user_id !== memberId));
  };

  const handleTransfer = async (newAdminId: string) => {
    if (!id) return;
    await transferAdmin(id, newAdminId);
    setMembers(prev => prev.map(m => ({
      ...m,
      role: m.user_id === newAdminId ? 'admin' : m.user_id === user?.id ? 'member' : m.role,
    })));
  };

  const handleLeave = async () => {
    if (!id) return;
    const ok = await leaveFamily(id);
    if (ok) navigate('/family');
  };

  const handleCopyCode = async () => {
    if (!family) return;
    await navigator.clipboard.writeText(family.invite_code);
    toast({ title: 'Code copied!' });
  };

  const handleShare = async () => {
    if (!family) return;
    const text = `Join "${family.name}" on Success Muslim!\nCode: ${family.invite_code}\nLink: ${family.invite_link}`;
    if (navigator.share) { try { await navigator.share({ text }); } catch {} }
    else await navigator.clipboard.writeText(text).then(() => toast({ title: 'Copied!' }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/family/${id}/dashboard`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Family Settings</h1>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
        {/* Invite section */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h2 className="text-sm font-semibold">Invite Members</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-2.5 font-mono font-bold tracking-widest text-center text-lg">
                {family?.invite_code}
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Invite
            </Button>
          </CardContent>
        </Card>

        {/* Rename (admin only) */}
        {isAdmin && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold">Group Name</h2>
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Family name"
                  maxLength={50}
                />
                <Button
                  onClick={handleRename}
                  disabled={renaming || !newName.trim() || newName === family?.name}
                >
                  {renaming ? 'Saving…' : 'Rename'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members */}
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold mb-3">Members ({members.length}/20)</h2>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((m, i) => {
                  const initials = m.display_name
                    ? m.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : '?';
                  const isMe = m.user_id === user?.id;
                  return (
                    <div key={m.user_id}>
                      {i > 0 && <Separator className="mb-3" />}
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9 border border-border">
                          {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.display_name || 'Member'} {isMe && '(you)'}</p>
                          {m.role === 'admin' && (
                            <span className="text-[10px] text-primary flex items-center gap-0.5">
                              <Crown className="h-2.5 w-2.5" /> Admin
                            </span>
                          )}
                        </div>
                        {isAdmin && !isMe && (
                          <div className="flex gap-1">
                            {m.role !== 'admin' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Transfer admin">
                                    <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Transfer Admin</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Make {m.display_name || 'this member'} the new admin? You will become a regular member.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleTransfer(m.user_id)}>Transfer</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Remove member">
                                  <UserMinus className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Remove {m.display_name || 'this member'} from the group?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemove(m.user_id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave group */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Leave Group
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave group?</AlertDialogTitle>
              <AlertDialogDescription>
                You will no longer see this family's progress. You can rejoin with the invite code later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave} className="bg-destructive text-destructive-foreground">
                Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default FamilySettings;
