import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import smlogo from '@/assets/smlogo.webp';
import { cn } from '@/lib/utils';

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
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={smlogo} alt="Success Muslim" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-foreground text-lg tracking-tight">Success Muslim</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === l.to ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="rounded-lg">
              <Link to="/auth">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 bg-background px-6 pb-4 pt-2 space-y-3">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block text-sm font-medium py-2 transition-colors',
                  pathname === l.to ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/auth" onClick={() => setMobileOpen(false)}>Sign In</Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link to="/auth" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={smlogo} alt="Success Muslim" className="w-6 h-6 rounded-lg" />
            <span className="text-sm font-semibold text-foreground">Success Muslim</span>
          </Link>

          <nav className="flex items-center gap-6">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
