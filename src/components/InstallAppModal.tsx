import React, { useEffect, useState } from 'react';
import { Smartphone, Download, Check, X, Share2, PlusSquare, Monitor, Laptop } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        onClose();
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">
              Install PhishGuard App
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Use as a standalone native app on your phone or computer
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-center space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-emerald-300 font-mono">
              App is already installed!
            </p>
            <p className="text-[11px] text-slate-400">
              You can launch it directly from your device home screen or application launcher.
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install 1-Click PWA</span>
              </button>
            ) : null}

            {/* Platform Instructions */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                {platform === 'ios' ? 'iPhone / iPad (Safari) Instructions' : platform === 'android' ? 'Android (Chrome) Instructions' : 'Desktop (Chrome / Edge / Safari)'}
              </span>

              {platform === 'ios' ? (
                <ol className="space-y-2 text-slate-300 text-[11px] list-decimal list-inside">
                  <li className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Tap the <strong>Share</strong> button in Safari toolbar.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <PlusSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
                  </li>
                  <li>Tap <strong>Add</strong> in the top-right corner to finish.</li>
                </ol>
              ) : platform === 'android' ? (
                <ol className="space-y-2 text-slate-300 text-[11px] list-decimal list-inside">
                  <li>Tap the <strong>three dots (⋮)</strong> menu in the Chrome header.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Confirm by tapping <strong>Install</strong>.</li>
                </ol>
              ) : (
                <ol className="space-y-2 text-slate-300 text-[11px] list-decimal list-inside">
                  <li className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Look for the <strong>Install icon</strong> in your browser address bar (top right).</span>
                  </li>
                  <li>Click <strong>Install</strong> to add Sentinel PhishGuard to your desktop dock/taskbar.</li>
                </ol>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Works 100% offline for heuristic scanning with zero app store downloads required.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
