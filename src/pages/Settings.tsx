import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  UserCircle, LogOut, Save, Camera, Mail, MapPin, User, Shield,
  Lock, Trash2, ChevronRight, Database, Clock, CalendarDays
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subDays } from 'date-fns';
import FamilyPrivacySettings from '@/components/family/FamilyPrivacySettings';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className="h-4 w-4 text-primary" />
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
  </div>
);

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings: prayerSettings } = usePrayerSettings();

  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, gender, city, country, avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || '');
          setGender(data.gender || '');
          setCity(data.city || '');
          setCountry(data.country || '');
          setAvatarUrl(data.avatar_url || null);
        }
      });
  }, [user]);

  const getInitials = () => {
    if (displayName) return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 2MB allowed', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    setAvatarUrl(url);
    setUploading(false);
    toast({ title: 'Avatar updated!' });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, gender: gender || null, city, country })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated!' });
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    setResetSending(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reset link sent!', description: 'Check your email for a password reset link.' });
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast({ title: 'Cache cleared', description: 'Refresh the page for changes to take effect.' });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const isEmailAuth = user?.app_metadata?.provider === 'email';

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Profile" />

      <motion.main
        className="max-w-md mx-auto px-6 py-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Avatar & Name Header */}
        <motion.div variants={fadeUp} className="flex flex-col items-center text-center">
          <div className="relative group">
            <div className="rounded-full p-[3px] bg-gradient-to-br from-primary/60 to-primary/20">
              <Avatar className="h-28 w-28 border-2 border-background">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          {uploading && <p className="text-xs text-muted-foreground mt-2">Uploading…</p>}
          <h1 className="text-xl font-black tracking-tight mt-3">{displayName || 'Muslim User'}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {joinedDate && <p className="text-xs text-muted-foreground mt-1">Joined {joinedDate}</p>}
        </motion.div>

        {/* Edit Profile */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-5 space-y-4">
              <SectionHeader icon={User} title="Edit Profile" />
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Display Name</label>
                  <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Gender</label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">City</label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Country</label>
                    <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" />
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-5 space-y-3">
              <SectionHeader icon={Shield} title="Account" />
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm truncate">{user?.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Auth Provider</p>
                  <p className="text-sm capitalize">{user?.app_metadata?.provider || 'email'}</p>
                </div>
              </div>
              {isEmailAuth && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Password</p>
                        <p className="text-sm">••••••••</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handlePasswordReset} disabled={resetSending}>
                      {resetSending ? 'Sending…' : 'Reset'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Prayer Location */}
        <motion.div variants={fadeUp}>
          <Card
            className="cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate('/iman/prayer-times')}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Prayer Location</p>
                    <p className="text-xs text-muted-foreground">
                      {prayerSettings.city}, {prayerSettings.country}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Family Privacy */}
        <motion.div variants={fadeUp}>
          <FamilyPrivacySettings />
        </motion.div>

        {/* Data & Storage */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-5 space-y-3">
              <SectionHeader icon={Database} title="Data & Storage" />

              {/* Log Past Data */}
              <LogPastDataRow navigate={navigate} toast={toast} />

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm">Clear local cache</p>
                    <p className="text-xs text-muted-foreground">Removes saved preferences from this device</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearCache}>Clear</Button>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground text-center">Success Muslim v1.0</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone - Sign Out */}
        <motion.div variants={fadeUp}>
          <Card className="border-destructive/30">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3">Danger Zone</p>
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.main>
      <div className="h-20" />
    </div>
  );
};
const BACKDATE_MODULES = [
  { label: 'Solat', path: '/iman/salah-log' },
  { label: 'Quran', path: '/iman/quran' },
  { label: 'Dhikr', path: '/iman/dhikr' },
  { label: 'Sunnah', path: '/iman/sunnah' },
  { label: 'Water', path: '/health/hydration' },
  { label: 'Sleep', path: '/health/sleep' },
  { label: 'Steps', path: '/health/steps' },
  { label: 'Weight', path: '/health/weight' },
  { label: 'Fasting', path: '/health/fasting' },
  { label: 'Habits', path: '/productivity/habits' },
];

function LogPastDataRow({ navigate, toast }: { navigate: ReturnType<typeof useNavigate>; toast: ReturnType<typeof useToast>['toast'] }) {
  const [showModules, setShowModules] = useState(false);

  const handleOpen = () => {
    // Clear all dismissed backdate prompts
    localStorage.removeItem('backdate_prompt_dismissed');
    setShowModules(true);
    toast({ title: 'Backdate prompts reset', description: 'You will see the prompt again on each module.' });
  };

  const handleModuleClick = (path: string) => {
    setShowModules(false);
    navigate(`${path}?backdate=1`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-sm">Log past entries</p>
            <p className="text-xs text-muted-foreground">Go back and fill in data you may have missed</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpen}>Open</Button>
      </div>
      {showModules && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="grid grid-cols-2 gap-2"
        >
          {BACKDATE_MODULES.map(m => (
            <Button
              key={m.path}
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => handleModuleClick(m.path)}
            >
              {m.label}
            </Button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default Settings;
