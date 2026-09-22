import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import {
  QrCode,
  Camera,
  X,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  SwitchCamera,
  Layers,
  FileText
} from 'lucide-react';

interface QRCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string, isUrl: boolean) => void;
}

interface DemoQR {
  id: string;
  name: string;
  category: 'SCAM' | 'LEGIT';
  payload: string;
  description: string;
}

const DEMO_QRS: DemoQR[] = [
  {
    id: 'demo-meta-scam',
    name: 'Meta Phishing Portal QR',
    category: 'SCAM',
    payload: 'https://careers-meta-workforce.top/auth/verify?candidate_ref=HR-9821&track=remote-desk',
    description: 'Points to disposable lookalike domain using .top TLD to harvest banking details.'
  },
  {
    id: 'demo-telegram-scam',
    name: 'Telegram Recruiter Bot QR',
    category: 'SCAM',
    payload: 'https://t.me/Meta_HR_Remote_Recruitment_Officer_Bot?start=offer_accept_9921',
    description: 'Forces candidate into encrypted messenger to bypass HR audits and company email records.'
  },
  {
    id: 'demo-rental-scam',
    name: 'Fake Escrow Deposit QR',
    category: 'SCAM',
    payload: 'https://zillow-escrow-deposit-wire.co/deposit?property=94102-sf&amount=2400',
    description: 'Fraudulent landlord escrow link demanding upfront security deposit wire before inspection.'
  },
  {
    id: 'demo-google-legit',
    name: 'Google Verified Careers QR',
    category: 'LEGIT',
    payload: 'https://careers.google.com/jobs/results/149818274/?company=Google',
    description: 'Genuine career portal link hosted on authoritative corporate domain.'
  }
];

export const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'demo'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [demoQrImages, setDemoQrImages] = useState<Record<string, string>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Pre-generate SVG / Data URLs for the demo QR codes
  useEffect(() => {
    const generateDemoCodes = async () => {
      const generated: Record<string, string> = {};
      for (const item of DEMO_QRS) {
        try {
          const url = await QRCode.toDataURL(item.payload, {
            width: 240,
            margin: 1,
            color: {
              dark: item.category === 'SCAM' ? '#ef4444' : '#10b981',
              light: '#030712'
            }
          });
          generated[item.id] = url;
        } catch (e) {
          console.error('Error generating QR code preview:', e);
        }
      }
      setDemoQrImages(generated);
    };

    generateDemoCodes();
  }, []);

  // Play audio beep confirmation
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext might be muted or not allowed without user gesture
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        startScanLoop();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to access device camera';
      console.warn('Camera error:', message);
      setCameraError(
        message.includes('Permission') || message.includes('denied')
          ? 'Camera permission denied. Please allow camera access in browser settings or use Image Upload / Demo QR tabs below.'
          : 'Unable to start camera. You can drag and drop a screenshot or choose from our built-in QR test vectors.'
      );
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Continuous frame scanner loop
  const startScanLoop = () => {
    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data && code.data.trim()) {
            playBeep();
            setScannedResult(code.data.trim());
            stopCamera();
            return;
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  };

  // Switch between front/back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle active camera start/stop on modal open/close
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  // Handle File Upload for QR image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            playBeep();
            setScannedResult(code.data.trim());
          } else {
            alert('No valid QR code was detected in this image. Please ensure the QR code is clear, well-lit, and uncropped.');
          }
        }
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Screen / Display Capture
  const handleScreenCapture = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen capture API is not available on this device.');
        return;
      }
      const captureStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = captureStream;
      video.play();

      video.onloadedmetadata = () => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && code.data) {
              playBeep();
              setScannedResult(code.data.trim());
            } else {
              alert('No QR code detected in the captured screen frame. Please keep the QR code centered on screen.');
            }
          }
          captureStream.getTracks().forEach((track) => track.stop());
        }, 800);
      };
    } catch {
      // User dismissed screen picker
    }
  };

  // Trigger analysis in the main app
  const handleConfirmAndAnalyze = () => {
    if (!scannedResult) return;
    const isUrl = /^https?:\/\//i.test(scannedResult.trim());
    onScanSuccess(scannedResult.trim(), isUrl);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    stopCamera();
    setScannedResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span>QR Code Forensic Scanner Overlay</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-sans">
                  Live OCR / Barcode
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Scan QR codes from printed offer letters, badges, or computer screens.
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('camera');
              setScannedResult(null);
            }}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'camera'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera Scanner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image / Screenshot</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('demo');
              stopCamera();
            }}
            className={`px-3 py-2 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'demo'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Hackathon Vectors</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && !scannedResult && (
            <div className="space-y-3">
              <div className="relative aspect-video w-full max-w-lg mx-auto bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center space-y-3 max-w-sm">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-mono">{cameraError}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={startCamera}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-mono font-bold hover:bg-cyan-500 transition-colors"
                      >
                        Retry Camera
                      </button>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono hover:bg-slate-700 transition-colors"
                      >
                        Upload Photo Instead
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanning Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-cyan-400/60 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400 rounded-tl-md" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400 rounded-tr-md" />
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400 rounded-bl-md" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400 rounded-br-md" />

                        {/* Animated Laser Beam */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser" />
                      </div>
                    </div>

                    {/* Top Status Badge */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Aim camera at QR Code</span>
                    </div>

                    {/* Camera Switch Toggle */}
                    <button
                      onClick={toggleFacingMode}
                      className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Switch Camera (Front/Rear)"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
                <span>Hold your physical offer letter or device screen in front of the lens.</span>
                <button
                  onClick={handleScreenCapture}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Scan Screen / Window</span>
                </button>
              </div>
            </div>
          )}

          {/* UPLOAD / SCREEN CAPTURE TAB */}
          {activeTab === 'upload' && !scannedResult && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/50 hover:bg-slate-950">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white font-mono mb-1">
                  Upload Photo of QR Code or Document
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Drag and drop a screenshot, phone snapshot, or PDF export containing a QR code to extract its target URL.
                </p>
                <span className="px-4 py-2 rounded-xl bg-slate-800 text-cyan-300 text-xs font-mono font-bold hover:bg-slate-700 transition-colors">
                  {isProcessing ? 'Decoding QR Data...' : 'Browse Image File'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Want to scan a QR code from another window or browser tab?</span>
                </span>
                <button
                  onClick={handleScreenCapture}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
                >
                  Capture Window
                </button>
              </div>
            </div>
          )}

          {/* DEMO TEST VECTORS TAB */}
          {activeTab === 'demo' && !scannedResult && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Click any test vector below to simulate a real-world QR scan or scan it with your phone!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_QRS.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      item.category === 'SCAM'
                        ? 'bg-slate-950/80 border-red-900/40 hover:border-red-500/60'
                        : 'bg-slate-950/80 border-emerald-900/40 hover:border-emerald-500/60'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {demoQrImages[item.id] ? (
                        <img
                          src={demoQrImages[item.id]}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg bg-black p-1 border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-black animate-pulse shrink-0" />
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            item.category === 'SCAM' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {item.category}
                          </span>
                          <h5 className="text-xs font-bold text-white font-mono leading-tight">
                            {item.name}
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                        {item.payload}
                      </span>
                      <button
                        onClick={() => {
                          playBeep();
                          setScannedResult(item.payload);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-xs font-mono font-bold text-slate-300 border border-slate-700 transition-colors shrink-0"
                      >
                        Test QR Payload
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCANNED RESULT PREVIEW BANNER */}
          {scannedResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-xl space-y-4 font-mono animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>QR Code Successfully Decoded</span>
                </div>
                <button
                  onClick={() => setScannedResult(null)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another</span>
                </button>
              </div>

              {/* Decoded Content Display */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Extracted Payload Content:
                </span>
                <div className="text-xs font-mono text-cyan-300 break-all select-all p-2 rounded bg-black/50 border border-slate-800">
                  {scannedResult}
                </div>
              </div>

              {/* Initial Threat Preview */}
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                /top|xyz|work|telegram|t\.me|escrow|deposit|wire/i.test(scannedResult)
                  ? 'bg-red-950/60 border-red-800 text-red-300'
                  : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              }`}>
                {/top|xyz|work|telegram|t\.me|escrow|deposit|wire/i.test(scannedResult) ? (
                  <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                )}
                <div>
                  <strong className="block font-bold">
                    {/top|xyz|work|telegram|t\.me|escrow|deposit|wire/i.test(scannedResult)
                      ? 'High-Risk QR Signature Detected'
                      : 'Standard Enterprise Link Signature'}
                  </strong>
                  <span className="text-[11px] opacity-90">
                    {/top|xyz|work|telegram|t\.me|escrow|deposit|wire/i.test(scannedResult)
                      ? 'Target URL features suspicious TLD or evasive messaging vector.'
                      : 'Target URL conforms to recognizable domain formatting.'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setScannedResult(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  Cancel / Re-scan
                </button>
                <button
                  onClick={handleConfirmAndAnalyze}
                  className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Inject &amp; Run Deep Forensic Scan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-[10px] font-mono text-slate-500">
          Physical document QR authentication verifies against authentic enterprise registration and imposter registries.
        </div>
      </div>
    </div>
  );
};
