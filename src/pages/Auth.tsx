import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import smlogo from '@/assets/smlogo.webp';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/40 via-background to-background">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: email.split('@')[0] },
            emailRedirectTo: 'https://successmuslim.app/auth/callback',
          },
        });
        if (error) throw error;
        if (data.user?.identities?.length === 0) {
          toast({
            title: 'Email already registered',
            description: 'This email is already registered. Please sign in instead.',
            variant: 'destructive',
          });
          setIsLogin(true);
          return;
        }
        toast({
          title: 'Account created!',
          description: 'Please check your email (including spam/junk) to verify your account. It may take a minute.',
        });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-background to-background flex flex-col relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-20 -right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -left-20 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl" />

      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-lg relative z-10">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            <span className="text-sm">Back</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <motion.img
              src={smlogo}
              alt="Success Muslim"
              className="w-14 h-14 rounded-2xl mx-auto mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-2xl font-bold text-gray-900">
                  {isLogin ? 'Welcome Back' : "Let's get started"}
                </h1>
                <p className="text-sm text-gray-500">
                  {isLogin ? 'Sign in to continue your journey' : 'Free forever. No credit card needed.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-xl p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="rounded-xl h-11 border-gray-200 shadow-inner bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-xl h-11 border-gray-200 shadow-inner bg-gray-50/50 focus:bg-white transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={18} />
                  </button>
                </div>
              </div>

              {isLogin && (
                <Link to="/reset-password" className="text-xs text-emerald-600 hover:underline block text-right">
                  Forgot password?
                </Link>
              )}

              <Button
                type="submit"
                className="w-full rounded-xl h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-[0.98] transition-transform"
                disabled={submitting}
              >
                {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </motion.div>

          {/* Toggle */}
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 bg-gray-100/80 hover:bg-gray-200/80 rounded-full px-5 py-2.5 transition-all active:scale-[0.97]"
            >
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <span className="font-semibold text-emerald-600">{isLogin ? 'Sign Up' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
