import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Download, Smartphone, Monitor, Share, MoreVertical, PlusSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <Link to="/home" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Moon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Install Success Muslim</h1>
          <p className="text-muted-foreground text-sm">
            Add to your home screen for the best experience — works offline, loads instantly.
          </p>
        </div>

        {/* Native install button */}
        {isInstalled ? (
          <Card className="mb-8 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold text-primary">App Already Installed!</p>
              <p className="text-sm text-muted-foreground mt-1">You're using the installed version.</p>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full mb-8 py-6 text-base rounded-xl shadow-lg">
            <Download className="mr-2 h-5 w-5" /> Install App
          </Button>
        ) : (
          <Card className="mb-8 border-border">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Your browser doesn't support one-tap install. Follow the manual steps below.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Manual instructions */}
        <h2 className="text-lg font-semibold mb-4">Installation Guide</h2>

        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem value="iphone" className="border rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">iPhone / iPad (Safari)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ol className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span>Open <strong className="text-foreground">www.successmuslim.app</strong> in Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span>Tap the <Share className="inline h-4 w-4 text-foreground" /> <strong className="text-foreground">Share</strong> button at the bottom</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span>Scroll down and tap <PlusSquare className="inline h-4 w-4 text-foreground" /> <strong className="text-foreground">Add to Home Screen</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
                  <span>Tap <strong className="text-foreground">Add</strong> — the app icon will appear on your home screen</span>
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="android" className="border rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">Android (Chrome)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ol className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span>Open <strong className="text-foreground">www.successmuslim.app</strong> in Chrome</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span>Tap the <MoreVertical className="inline h-4 w-4 text-foreground" /> <strong className="text-foreground">three-dot menu</strong> at the top right</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span>Tap <strong className="text-foreground">Add to Home screen</strong> or <strong className="text-foreground">Install app</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
                  <span>Tap <strong className="text-foreground">Install</strong> — done!</span>
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="desktop" className="border rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Monitor className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">Desktop (Chrome / Edge)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ol className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                  <span>Visit <strong className="text-foreground">www.successmuslim.app</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                  <span>Click the <Download className="inline h-4 w-4 text-foreground" /> <strong className="text-foreground">install icon</strong> in the address bar (right side)</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                  <span>Click <strong className="text-foreground">Install</strong> in the popup</span>
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Footer link */}
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/auth">Sign In & Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
