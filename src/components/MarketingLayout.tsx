import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import smlogo from '@/assets/smlogo.webp';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon, Menu02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

const navLinks = [
  { label: 'Features', to: '/features' },
  { label: 'About', to: '/about' },
];

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Sticky Nav ── */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <Link to="/home" className="group flex items-center gap-2.5 shrink-0">
            <img src={smlogo} alt="Success Muslim" className="w-8 h-8 rounded-lg shadow-sm transition-transform group-hover:scale-105" />
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Success Muslim
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  'text-sm font-medium px-3 py-1.5 rounded-lg transition-all',
                  pathname === l.to
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
            >
              Get Started
              <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-foreground rounded-lg hover:bg-emerald-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <HugeiconsIcon icon={mobileOpen ? Cancel01Icon : Menu02Icon} size={22} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-white/90 backdrop-blur-xl border-t border-white/20"
            >
              <div className="px-6 pb-4 pt-2 space-y-1">
                {navLinks.map(l => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block text-sm font-medium px-3 py-2.5 rounded-lg transition-all',
                      pathname === l.to
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-muted-foreground hover:bg-emerald-50'
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="flex gap-3 pt-3">
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  </Button>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-sm active:scale-[0.98] transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page Content ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/20 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/home" className="flex items-center gap-2">
            <img src={smlogo} alt="Success Muslim" className="w-6 h-6 rounded-lg shadow-sm" />
            <span className="text-sm font-semibold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              Success Muslim
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted-foreground hover:text-emerald-700 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-muted-foreground">Built for the Ummah 🌙 · © 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
