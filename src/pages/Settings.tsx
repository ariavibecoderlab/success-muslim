import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerSettings } from '@/hooks/usePrayerSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  LogOut, Save, Camera, Mail, MapPin, Shield,
  Lock, Trash2, ChevronRight, Database, Clock, CalendarDays,
  BookOpen, Sparkles, Heart, Droplets, Moon, Footprints, Weight, Flame, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FamilyPrivacySettings from '@/components/family/FamilyPrivacySettings';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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
      toast({ title: 'Reset link sent!', description: 'Check your email.' });
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast({ title: 'Cache cleared', description: 'Refresh for changes.' });
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
      <div className="max-w-md mx-auto px-4 pt-4 pb-2">
        <h1 className="text-base font-semibold">Profile</h1>
      </div>

      <motion.main
        className="max-w-md mx-auto px-4 py-3 space-y-5 pb-24"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Avatar & Name */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-14 w-14">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
              <AvatarFallback className="text-base font-medium bg-muted text-muted-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{displayName || 'Muslim User'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            {joinedDate && <p className="text-[10px] text-muted-foreground">Joined {joinedDate}</p>}
          </div>
          {uploading && <p className="text-[10px] text-muted-foreground">Uploading…</p>}
        </motion.div>

        {/* Edit Profile */}
        <motion.div variants={fadeUp}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Edit Profile</p>
          <div className="bg-card rounded-xl border border-border p-3 space-y-2.5">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Display Name</label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Gender</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">City</label>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Country</label>
                <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" className="h-9 text-sm" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full h-9 text-sm">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </motion.div>

        {/* Account */}
        <motion.div variants={fadeUp}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Account</p>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Email</p>
                <p className="text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Shield className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Provider</p>
                <p className="text-xs capitalize">{user?.app_metadata?.provider || 'email'}</p>
              </div>
            </div>
            {isEmailAuth && (
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Password</p>
                    <p className="text-xs">••••••••</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[11px] h-7 px-2" onClick={handlePasswordReset} disabled={resetSending}>
                  {resetSending ? 'Sending…' : 'Reset'}
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Prayer Location */}
        <motion.div variants={fadeUp}>
          <button
            className="w-full flex items-center gap-3 bg-card rounded-xl border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors"
            onClick={() => navigate('/iman/prayer-times')}
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-xs font-medium">Prayer Location</p>
              <p className="text-[10px] text-muted-foreground">{prayerSettings.city}, {prayerSettings.country}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Family Privacy */}
        <motion.div variants={fadeUp}>
          <FamilyPrivacySettings />
        </motion.div>

        {/* Data & Storage */}
        <motion.div variants={fadeUp}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Data & Storage</p>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            <LogPastDataRow navigate={navigate} toast={toast} />
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-3">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs">Clear local cache</p>
                  <p className="text-[10px] text-muted-foreground">Removes saved preferences</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-[11px] h-7 px-2" onClick={handleClearCache}>Clear</Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Success Muslim v1.0</p>
        </motion.div>

        {/* Sign Out */}
        <motion.div variants={fadeUp}>
          <Button variant="ghost" onClick={handleLogout} className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 text-xs h-9">
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Sign Out
          </Button>
        </motion.div>
      </motion.main>
      <div className="h-20" />
    </div>
  );
};

const BACKDATE_MODULES = [
  { label: 'Solat', path: '/iman/salah-log', icon: Sparkles, color: 'from-emerald-400/80 to-emerald-500/80' },
  { label: 'Quran', path: '/iman/quran', icon: BookOpen, color: 'from-amber-400/80 to-amber-500/80' },
  { label: 'Dhikr', path: '/iman/dhikr', icon: Heart, color: 'from-violet-400/80 to-violet-500/80' },
  { label: 'Sunnah', path: '/iman/sunnah', icon: Sparkles, color: 'from-pink-400/80 to-pink-500/80' },
  { label: 'Water', path: '/health/hydration', icon: Droplets, color: 'from-blue-400/80 to-blue-500/80' },
  { label: 'Sleep', path: '/health/sleep', icon: Moon, color: 'from-indigo-400/80 to-indigo-500/80' },
  { label: 'Steps', path: '/health/steps', icon: Footprints, color: 'from-teal-400/80 to-teal-500/80' },
  { label: 'Weight', path: '/health/weight', icon: Weight, color: 'from-orange-400/80 to-orange-500/80' },
  { label: 'Fasting', path: '/health/fasting', icon: Flame, color: 'from-orange-400/80 to-amber-500/80' },
  { label: 'Habits', path: '/productivity/habits', icon: Target, color: 'from-teal-400/80 to-cyan-500/80' },
];

const staggerGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function LogPastDataRow({ navigate, toast }: { navigate: ReturnType<typeof useNavigate>; toast: ReturnType<typeof useToast>['toast'] }) {
  const [showModules, setShowModules] = useState(false);

  const handleOpen = () => {
    localStorage.removeItem('backdate_prompt_dismissed');
    setShowModules(true);
    toast({ title: 'Backdate prompts reset' });
  };

  const handleModuleClick = (path: string) => {
    setShowModules(false);
    navigate(`${path}?backdate=1`);
  };

  return (
    <div className="px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs">Log past entries</p>
            <p className="text-[10px] text-muted-foreground">Fill in data you missed</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-[11px] h-7 px-2" onClick={handleOpen}>Open</Button>
      </div>
      {showModules && (
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-1.5"
        >
          {BACKDATE_MODULES.map(m => {
            const Icon = m.icon;
            return (
              <motion.div key={m.path} variants={staggerItem}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-[10px] h-8 gap-1.5 justify-start hover:shadow-sm active:scale-[0.98] transition-all"
                  onClick={() => handleModuleClick(m.path)}
                >
                  <div className={`h-4 w-4 rounded bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0`}>
                    <Icon className="h-2.5 w-2.5 text-white" />
                  </div>
                  {m.label}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default Settings;
