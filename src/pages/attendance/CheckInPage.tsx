import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { submitCheckIn } from '../../api/attendance.api';
import { Camera, MapPin, AlertCircle, CheckCircle, Loader, ScanLine } from 'lucide-react';
import { useFaceApi } from '../../hooks/useFaceApi';

export const CheckInPage: React.FC = () => {
  const { isLoaded: faceApiLoaded, detectFaceAndGetDescriptor, detectBlink } = useFaceApi();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<{ message: string; type: 'general' | 'geo' | 'face' } | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [livenessStatus, setLivenessStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  const isCheckingLiveness = useRef(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const init = async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        setError({ message: 'Camera permission denied or unavailable.', type: 'general' });
      }

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (_err) => {
            console.warn('[CheckIn] Location permission denied or unavailable. Using default office coordinates.');
            setLocation({ lat: 18.573444, lng: 73.756762 });
          }
        );
      } else {
        setLocation({ lat: 18.573444, lng: 73.756762 });
      }
    };

    init();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !location) {
      if (!location) setError({ message: 'Waiting for location coordinates...', type: 'geo' });
      return;
    }

    setLivenessStatus('checking');
    setError(null);
    setSuccess(false);
    isCheckingLiveness.current = true;

    // Set 15s timeout for liveness check
    const timeoutId = setTimeout(() => {
      if (isCheckingLiveness.current) {
        isCheckingLiveness.current = false;
        setLivenessStatus('failed');
        setError({ message: 'Liveness check timed out. Please try again and blink clearly when prompted.', type: 'face' });
      }
    }, 15000);

    const loop = async (): Promise<number[] | null> => {
      if (!isCheckingLiveness.current || !videoRef.current) return null;
      
      const { isBlinking, descriptor } = await detectBlink(videoRef.current);
      if (isBlinking && descriptor) {
        return descriptor;
      }
      
      // Delay to avoid maxing out CPU
      await new Promise(r => setTimeout(r, 100));
      return loop();
    };

    const descriptor = await loop();
    clearTimeout(timeoutId);

    if (descriptor) {
      isCheckingLiveness.current = false;
      setLivenessStatus('verified');
      setLoading(true);

      try {
        await submitCheckIn({ 
          currentDescriptor: descriptor, 
          lat: location.lat, 
          lng: location.lng
        });
        setSuccess(true);
      } catch (err: any) {
        const type = err.response?.data?.type === 'GEO_REJECT' ? 'geo' : 
                     err.response?.data?.type === 'FACE_REJECT' ? 'face' : 'general';
        setError({ message: err.response?.data?.error?.message || err.message || 'Check-in failed.', type });
        setLivenessStatus('idle');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      isCheckingLiveness.current = false;
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daily Check-In</h1>
        <p className="text-slate-500 mt-1">Please ensure your face is clearly visible and location is enabled.</p>
      </div>

      <Card hover={false}>
        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-red-700 text-sm">Check-In Failed</h4>
                <p className="text-sm text-red-600 mt-0.5">{error.message}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-emerald-700 text-sm">Success</h4>
                <p className="text-sm text-emerald-600 mt-0.5">Your attendance has been logged.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-slate-200 scale-x-[-1]">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {(!stream || !faceApiLoaded) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-black/80 scale-x-[-1]">
                    {!stream ? <Camera size={32} className="mb-2" /> : <Loader size={32} className="mb-2 animate-spin" />}
                    <span className="text-sm font-medium">{!stream ? 'Starting Camera...' : 'Loading ML Models...'}</span>
                  </div>
                )}
                {stream && faceApiLoaded && !loading && (
                  <div className="absolute top-3 left-3 scale-x-[-1]">
                    <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium flex items-center gap-1.5">
                      <ScanLine size={14} />
                      Face Detection Active
                    </div>
                  </div>
                )}
                {livenessStatus === 'checking' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 bg-indigo-900/60 backdrop-blur-sm scale-x-[-1] animate-fade-in z-10">
                    <ScanLine size={48} className="mb-3 animate-pulse text-indigo-400" />
                    <span className="text-xl font-bold">Liveness Challenge</span>
                    <span className="text-sm font-medium mt-1">Please blink your eyes to verify...</span>
                  </div>
                )}
                {livenessStatus === 'verified' && !success && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 bg-emerald-500/80 backdrop-blur-sm scale-x-[-1] animate-fade-in z-10">
                    <CheckCircle size={48} className="mb-3 animate-bounce" />
                    <span className="text-xl font-bold">Liveness Verified</span>
                    <span className="text-sm font-medium mt-1">Authenticating with server...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 justify-center">
                <MapPin size={16} className={location ? 'text-indigo-500' : 'text-slate-400'} />
                {location ? `GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Acquiring location...'}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Instructions</h3>
                <ul className="text-sm text-slate-500 space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    Ensure you are within 100m of the registered office location (or approved WFH address).
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    Remove masks or sunglasses.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    Ensure good lighting on your face.
                  </li>
                </ul>
              </div>

              <Button 
                variant="accent" 
                fullWidth 
                size="lg"
                onClick={handleCapture}
                disabled={loading || !stream || !location || success || !faceApiLoaded || livenessStatus === 'checking'}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    Processing ML Pipeline...
                  </span>
                ) : livenessStatus === 'checking' ? (
                  <span className="flex items-center gap-2">
                    <ScanLine size={18} className="animate-pulse" />
                    Waiting for blink...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Camera size={18} />
                    Start Check-In
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
