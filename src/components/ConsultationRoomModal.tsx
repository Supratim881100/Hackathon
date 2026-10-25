import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Clock,
  Maximize2,
  Minimize2,
  Camera,
  RotateCw,
  FileText,
  AlertCircle,
  Building2,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { DoctorUser, ConsultationMode, ConsultationSession, ConsultationMessage } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ConsultationRoomModalProps {
  doctor: DoctorUser;
  mode: ConsultationMode;
  initialSessionId?: string;
  currentUserRole?: string;
  currentUserId?: string;
  currentUserName?: string;
  onClose: () => void;
  onComplete?: () => void;
}

export const ConsultationRoomModal: React.FC<ConsultationRoomModalProps> = ({
  doctor,
  mode,
  initialSessionId,
  currentUserRole = 'patient',
  currentUserId = 'patient_supratim_paul',
  currentUserName = 'Supratim Paul',
  onClose,
  onComplete
}) => {
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [activeMode, setActiveMode] = useState<ConsultationMode>(mode);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [callStatus, setCallStatus] = useState<'initiating' | 'waiting' | 'connected' | 'completed'>('initiating');

  // Media streams & WebRTC
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Call Controls State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Chat messaging inside consultation
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSideChatOpen, setIsSideChatOpen] = useState(false);

  // Post-Consultation Notes (for doctor or summary)
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Timer Ref
  const timerIntervalRef = useRef<any>(null);
  const pollingIntervalRef = useRef<any>(null);

  // 1. Initialize or load consultation session
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        setIsLoadingSession(true);
        if (initialSessionId) {
          const existing = await api.getConsultation(initialSessionId);
          if (isMounted) {
            setSession(existing);
            setActiveMode(existing.mode);
          }
        } else {
          const created = await api.createConsultation({
            doctorId: doctor.id,
            mode: activeMode,
            reason: `${activeMode.toUpperCase()} Consultation with Dr. ${doctor.name}`
          });
          if (isMounted) {
            setSession(created);
          }
        }
      } catch (err: any) {
        console.error('Session init error:', err);
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
      cleanupMedia();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [initialSessionId, doctor.id, activeMode]);

  // 2. Start Media depending on mode
  useEffect(() => {
    if (!session) return;

    if (activeMode === 'video' || activeMode === 'voice') {
      startMediaStream(activeMode === 'video');
      startCallTimer();
    } else if (activeMode === 'chat') {
      setCallStatus('connected');
    }

    // Start Chat & Signaling Poller
    startPolling(session.id);

    return () => {
      cleanupMedia();
    };
  }, [session?.id, activeMode]);

  // Setup real camera/mic stream
  const startMediaStream = async (withVideo: boolean) => {
    try {
      setCameraError(null);
      cleanupMedia();

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: withVideo ? { facingMode: cameraFacing } : false
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;

        if (localVideoRef.current && withVideo) {
          localVideoRef.current.srcObject = stream;
        }

        setCallStatus('waiting');

        // Setup real RTCPeerConnection
        setupWebRtcPeer(stream);
      } else {
        setCameraError('Media devices API is not supported in this browser environment.');
      }
    } catch (err: any) {
      console.warn('Media capture warning / permission denied:', err);
      setCameraError(err.message || 'Camera / Microphone permission denied. Please allow device access in browser.');
      // Keep room accessible in fallback mode
      setCallStatus('waiting');
    }
  };

  const setupWebRtcPeer = async (localStream: MediaStream) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = pc;

      // Add local tracks to peer connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus('connected');
        }
      };

      // Handle local ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && session?.id) {
          api.sendConsultationSignal(session.id, 'ice', event.candidate).catch(() => {});
        }
      };

      // Create offer if patient
      if (currentUserRole !== 'doctor' && session?.id) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await api.sendConsultationSignal(session.id, 'offer', offer);
      }
    } catch (err) {
      console.error('WebRTC setup error:', err);
    }
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const startCallTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setCallDuration(0);
    timerIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const startPolling = (sessionId: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    // Initial fetch of messages
    api.getConsultationMessages(sessionId).then((msgs) => setMessages(msgs)).catch(() => {});

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const msgs = await api.getConsultationMessages(sessionId);
        setMessages(msgs);

        // Poll signaling
        const signals = await api.getConsultationSignals(sessionId);
        if (signals.sessionStatus === 'completed') {
          setCallStatus('completed');
        }

        // If peer connection exists, handle incoming answers/candidates
        if (peerConnectionRef.current) {
          if (signals.answers && signals.answers.length > 0 && peerConnectionRef.current.signalingState === 'have-local-offer') {
            const latestAnswer = signals.answers[signals.answers.length - 1];
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(latestAnswer.sdp));
            setCallStatus('connected');
          }
        }
      } catch {
        // silent polling catch
      }
    }, 2500);
  };

  // Toggle Controls
  const toggleMuteAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    } else {
      setIsAudioMuted((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoDisabled(!videoTrack.enabled);
      }
    } else {
      setIsVideoDisabled((prev) => !prev);
    }
  };

  const switchCameraFacing = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    if (activeMode === 'video') {
      startMediaStream(true);
    }
  };

  // Send Chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !session?.id) return;

    try {
      setIsSendingMessage(true);
      const text = chatInput.trim();
      setChatInput('');
      const newMsg = await api.sendConsultationMessage(session.id, text);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // End Call / Complete Consultation
  const handleEndConsultation = async () => {
    if (!session?.id) {
      onClose();
      return;
    }

    try {
      setIsEnding(true);
      await api.endConsultation(session.id, doctorNotes, prescriptionNotes);
      setCallStatus('completed');
      cleanupMedia();
      if (onComplete) onComplete();
    } catch (err: any) {
      console.error(err);
      onClose();
    } finally {
      setIsEnding(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className={`bg-slate-900 rounded-3xl w-full max-h-[96vh] shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden transition-all duration-200 ${isFullscreen ? 'fixed inset-0 max-h-screen rounded-none' : 'max-w-4xl'}`}>
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 font-bold">
              {activeMode === 'video' ? (
                <Video className="w-5 h-5" />
              ) : activeMode === 'voice' ? (
                <PhoneCall className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  {doctor.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {doctor.specialty} · {doctor.registrationCouncil || 'Delhi Medical Council'} ({doctor.registrationNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {callStatus === 'connected' && (
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{formatTimer(callDuration)}</span>
              </div>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleEndConsultation}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Consultation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Consultation Viewport */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-slate-950">
          
          {/* Main Visual / Call Canvas */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {callStatus === 'completed' ? (
              /* Post Consultation Summary View */
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex items-center justify-center">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-extrabold text-white">Consultation Concluded</h4>
                    <p className="text-xs text-slate-400">
                      With {doctor.name} ({doctor.specialty})
                    </p>
                  </div>

                  <div className="bg-slate-800/80 rounded-2xl p-4 text-left text-xs text-slate-300 space-y-2 border border-slate-700">
                    <div className="flex justify-between border-b border-slate-700/80 pb-2">
                      <span className="text-slate-400">Consultation Mode:</span>
                      <strong className="text-white uppercase font-mono">{activeMode} CALL</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/80 pb-2">
                      <span className="text-slate-400">Total Duration:</span>
                      <strong className="text-emerald-400 font-mono">{formatTimer(callDuration)}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/80 pb-2">
                      <span className="text-slate-400">Council Registry:</span>
                      <span className="text-slate-300">{doctor.registrationNumber}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <strong className="text-white font-mono">
                        ₹{doctor.consultationFees?.[activeMode] || doctor.consultationFee || 600}
                      </strong>
                    </div>
                  </div>

                  {currentUserRole === 'doctor' ? (
                    /* Doctor Clinical Notes Entry */
                    <div className="space-y-3 text-left">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Clinical Findings & Assessment
                        </label>
                        <textarea
                          rows={2}
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Summary of patient symptoms and diagnosis..."
                          className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Digital Prescription & Advice
                        </label>
                        <textarea
                          rows={2}
                          value={prescriptionNotes}
                          onChange={(e) => setPrescriptionNotes(e.target.value)}
                          placeholder="Prescribed medicines, dosages, and follow-up instructions..."
                          className="w-full text-xs p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-[#1e6b75] hover:bg-[#165860] text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Close & Return to BANDAZE
                  </button>
                </div>
              </div>
            ) : activeMode === 'video' ? (
              /* Video Consultation Stage */
              <div className="flex-1 relative flex items-center justify-center bg-slate-950 min-h-[360px] sm:min-h-[460px]">
                {/* Remote Doctor Stream Display */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Waiting State overlay if remote not joined yet */}
                {callStatus !== 'connected' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950/90 backdrop-blur-xs">
                    <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 relative">
                      <Stethoscope className="w-10 h-10 animate-pulse" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping"></span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Waiting for Dr. {doctor.name.replace(/^Dr\.\s*/i, '')} to connect...
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Your secure, encrypted WebRTC consultation room is ready. The doctor has been alerted.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                      <span>Room:</span>
                      <strong className="text-teal-300">{session?.id}</strong>
                    </div>

                    {cameraError && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 max-w-sm flex items-center gap-2 text-left">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Camera Notice: {cameraError} (Audio fallback active)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Local Self-Video PIP Box */}
                <div className="absolute bottom-4 right-4 w-28 sm:w-40 aspect-4/3 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl z-10">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isVideoDisabled ? 'hidden' : 'block'}`}
                  />
                  {isVideoDisabled && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] gap-1 bg-slate-900">
                      <VideoOff className="w-5 h-5 text-slate-600" />
                      <span>Camera Off</span>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-2 text-[9px] font-bold text-white/80 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    You
                  </span>
                </div>
              </div>
            ) : activeMode === 'voice' ? (
              /* Voice Consultation Stage */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 bg-radial from-slate-900 to-slate-950">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-2xl relative">
                  <PhoneCall className="w-12 h-12" />
                  {callStatus === 'connected' && (
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping"></div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-white">{doctor.name}</h4>
                  <p className="text-xs text-teal-300 font-medium">{doctor.specialty}</p>
                  <p className="text-xs text-slate-400">
                    {callStatus === 'connected' ? 'Secure Voice Call Connected' : 'Calling doctor...'}
                  </p>
                </div>

                {/* Audio Waves Simulation */}
                <div className="flex items-center gap-1.5 h-8">
                  {[40, 70, 30, 90, 60, 45, 80, 50, 35, 75].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: callStatus === 'connected' ? `${h}%` : '20%' }}
                      className="w-1 bg-teal-400 rounded-full transition-all duration-300"
                    />
                  ))}
                </div>

                <div className="text-xs font-mono text-slate-400 bg-slate-900 px-4 py-1 rounded-full border border-slate-800">
                  {callStatus === 'connected' ? formatTimer(callDuration) : 'Connecting voice channel...'}
                </div>
              </div>
            ) : (
              /* Text Chat View (when in pure chat mode) */
              <div className="flex-1 flex flex-col h-full bg-slate-950">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="p-3 bg-teal-950/40 border border-teal-800/40 rounded-2xl text-xs text-teal-200 text-center max-w-md mx-auto">
                    Direct confidential consultation channel with <strong>{doctor.name}</strong>. Messages are encrypted and archived in your health record.
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                      <p>No messages yet. Send a message to start the consultation.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                            {m.senderName}
                          </span>
                          <div
                            className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[#1e6b75] text-white rounded-br-xs'
                                : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700'
                            }`}
                          >
                            <p>{m.text}</p>
                            <span className="text-[9px] text-white/60 block text-right mt-1 font-mono">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message, symptoms, or query..."
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingMessage || !chatInput.trim()}
                    className="p-2.5 bg-[#1e6b75] hover:bg-[#165860] text-white rounded-xl disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Bottom Floating Control Bar (for Video & Voice) */}
            {(activeMode === 'video' || activeMode === 'voice') && callStatus !== 'completed' && (
              <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-center gap-3 sm:gap-4 shrink-0 z-20">
                {/* Audio Toggle */}
                <button
                  type="button"
                  onClick={toggleMuteAudio}
                  className={`p-3.5 rounded-2xl transition-all shadow-md ${
                    isAudioMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Video Toggle (Video mode only) */}
                {activeMode === 'video' && (
                  <button
                    type="button"
                    onClick={toggleVideo}
                    className={`p-3.5 rounded-2xl transition-all shadow-md ${
                      isVideoDisabled ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    title={isVideoDisabled ? 'Turn On Camera' : 'Turn Off Camera'}
                  >
                    {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                )}

                {/* Flip Camera */}
                {activeMode === 'video' && (
                  <button
                    type="button"
                    onClick={switchCameraFacing}
                    className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-md hidden sm:block"
                    title="Switch Camera Facing"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                )}

                {/* Open Chat Drawer Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSideChatOpen(!isSideChatOpen)}
                  className={`p-3.5 rounded-2xl transition-all shadow-md relative ${
                    isSideChatOpen ? 'bg-teal-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  title="Open In-Call Chat"
                >
                  <MessageSquare className="w-5 h-5" />
                  {messages.length > 0 && !isSideChatOpen && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-teal-400 rounded-full"></span>
                  )}
                </button>

                {/* End Call Button */}
                <button
                  type="button"
                  onClick={handleEndConsultation}
                  disabled={isEnding}
                  className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                  title="End Consultation"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span className="hidden sm:inline">End Call</span>
                </button>
              </div>
            )}
          </div>

          {/* Collapsible Side Chat Drawer during Video/Voice Call */}
          {isSideChatOpen && (activeMode === 'video' || activeMode === 'voice') && (
            <div className="w-full md:w-80 h-72 md:h-auto border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900 flex flex-col shrink-0">
              <div className="p-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                  <span>In-Call Consultation Chat</span>
                </span>
                <button
                  onClick={() => setIsSideChatOpen(false)}
                  className="text-slate-400 hover:text-white p-1 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-6">
                    No chat messages in this consultation yet.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-xs p-2.5 rounded-xl ${
                        m.senderId === currentUserId
                          ? 'bg-teal-900/60 text-teal-100 ml-4'
                          : 'bg-slate-800 text-slate-200 mr-4 border border-slate-700'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-slate-400 block mb-0.5">
                        {m.senderName}
                      </span>
                      <p>{m.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 flex gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Chat with doctor..."
                  className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
