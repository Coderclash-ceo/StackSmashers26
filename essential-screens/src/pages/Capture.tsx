import { useNavigate } from "react-router-dom";
import { Camera, Bell, Image as ImageIcon, Upload, ArrowRight, LogOut, Mic, Send, StopCircle, Volume2, Sparkles } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { chat, voiceChat, getChats } from "../lib/api";

const Capture = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Chat & Voice States
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem("user_id") || "demo_user";

  const handleCapture = () => {
    // In a real app, capture frame from video
    // For now, let's just use a dummy image if they "capture"
    const dummyCapture = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
    navigate("/review", { state: { image: dummyCapture } });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setCapturedFile(file);
      setIsCameraActive(false); // Ensure camera is off if an image is uploaded
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("full_name");
    navigate("/signin");
  };

  const handleAnalyzeUpload = () => {
    if (capturedImage) {
      navigate("/review", { state: { image: capturedImage, file: capturedFile } });
    }
  };

  // AI Chat Logic
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getChats(userId);
        if (data && Array.isArray(data.history)) {
          setChatMessages(data.history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })));
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchHistory();
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isThinking) return;

    const userMsg = inputText.trim();
    setInputText("");
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);

    try {
      const response = await chat(userId, userMsg);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Voice Assistant Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], "voice_query.wav", { type: 'audio/wav' });

        setIsThinking(true);
        setChatMessages(prev => [...prev, { role: 'user', content: "🎤 [Voice Message]" }]);

        try {
          const response = await voiceChat(userId, audioFile);
          setChatMessages(prev => [
            ...prev.filter(m => m.content !== "🎤 [Voice Message]"),
            { role: 'user', content: `🎤 ${response.transcription}` },
            { role: 'assistant', content: response.response }
          ]);
        } catch (err) {
          console.error("Voice chat error:", err);
          setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process your voice message." }]);
        } finally {
          setIsThinking(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera is not supported on this browser/device environment (Requires HTTPS or Localhost).");
      return;
    }

    try {
      setCapturedImage(null); // Clear previous image
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // More specific error handling
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        alert("Camera permission denied. Please allow camera access in your browser settings.");
      } else {
        alert("Could not access camera. Ensure no other app is using it and you are on HTTPS/Localhost.");
      }
    }
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const retakeImage = () => {
    setCapturedImage(null);
    setIsCameraActive(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center glow-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
              <path d="M12 2C13.5 2 15 3.5 15 5C15 6.5 14 8 12 8C10 8 9 6.5 9 5C9 3.5 10.5 2 12 2Z" fill="currentColor" />
              <path d="M12 8C8 8 6 12 6 16C6 20 8 22 12 22C16 22 18 20 18 16C18 12 16 8 12 8Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-foreground">NutriLink</span>
            <span className="text-[10px] text-muted-foreground block -mt-1">PREMIUM AI ANALYSIS</span>
          </div>
        </div>

        <nav className="flex items-center gap-8">
          <button className="text-primary font-medium text-sm border-b-2 border-primary pb-0.5">DASHBOARD</button>
          <button onClick={() => navigate('/history')} className="text-muted-foreground font-medium text-sm hover:text-foreground transition-colors">HISTORY</button>
          <button onClick={() => navigate('/statistics')} className="text-muted-foreground font-medium text-sm hover:text-foreground transition-colors">STATISTICS</button>
        </nav>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Bell size={18} className="text-muted-foreground" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-secondary/50 p-1.5 rounded-full transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border shadow-sm">
                <span className="text-xs font-medium text-foreground">{localStorage.getItem("full_name")?.split(' ').map(n => n[0]).join('') || "US"}</span>
              </div>
              <span className="text-sm text-foreground font-medium hidden md:block">{localStorage.getItem("full_name")?.split(' ')[0] || "User"}</span>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 glass-card border border-border/50 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="px-4 py-2 border-b border-border/50 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{localStorage.getItem("full_name") || "User Account"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">Logged in</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-4 flex flex-col">
        <div className="animate-slide-up mb-6" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Log your meal</h1>
          <p className="text-muted-foreground">
            Instantly analyze your food nutrition using our AI engine.
          </p>
        </div>

        {/* Capture Area */}
        <div className="flex-1 min-h-[400px] relative rounded-3xl overflow-hidden glass-card border-none shadow-2xl animate-slide-up group" style={{ animationDelay: '0.3s' }}>
          {/* Preview Container */}
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            {/* Background / Placeholder */}
            {!isCameraActive && !capturedImage && (
              <div
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80')] bg-cover bg-center opacity-40 transition-opacity duration-700"
              />
            )}

            {/* Video Feed */}
            {isCameraActive && (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}

            {/* Image Preview (Uploaded) */}
            {capturedImage && (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain bg-black/50 backdrop-blur-sm" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Controls */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 pointer-events-none">
            {/* Initial Stats: No Camera, No Image */}
            {!isCameraActive && !capturedImage && (
              <div className="text-center mb-8 animate-fade-in pointer-events-auto">
                <h2 className="text-4xl font-bold text-white mb-4">Scan Your Meal</h2>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-xl glow-primary transition-all hover:scale-105 active:scale-95"
                  >
                    <Camera size={24} />
                    Start Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-semibold border border-white/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <ImageIcon size={24} />
                    Browse File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Active Camera Controls */}
            {isCameraActive && (
              <button
                onClick={handleCapture}
                className="pointer-events-auto absolute bottom-12 w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <div className="w-16 h-16 rounded-full bg-white"></div>
              </button>
            )}

            {/* Image Preview Confirmation Controls */}
            {capturedImage && (
              <div className="pointer-events-auto flex gap-4 mt-auto mb-8 animate-fade-in">
                <button
                  onClick={retakeImage}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-semibold border border-white/20 transition-all hover:scale-105"
                >
                  Change Image
                </button>
                <button
                  onClick={handleAnalyzeUpload}
                  className="flex items-center gap-2 gradient-primary text-primary-foreground px-8 py-3 rounded-full font-semibold shadow-xl glow-primary transition-all hover:scale-105"
                >
                  <Upload size={20} />
                  Analyze Photo
                </button>
              </div>
            )}
          </div>

          {/* Guidelines Overlay (Decorative) */}
          <div className="absolute inset-8 border-2 border-white/20 rounded-2xl pointer-events-none opacity-50">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/60 -mt-0.5 -ml-0.5 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/60 -mt-0.5 -mr-0.5 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/60 -mb-0.5 -ml-0.5 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/60 -mb-0.5 -mr-0.5 rounded-br-lg"></div>
          </div>
        </div>

        {/* AI Nutrichat Section */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles size={16} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground">AI Nutrichat</h3>
            <span className="bg-accent/10 border border-accent/20 text-accent text-[10px] px-2 py-0.5 rounded-full font-bold">BETA VOICE</span>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border-border/50 flex flex-col h-[400px] shadow-lg">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                  <Volume2 size={48} className="text-muted-foreground mb-2" />
                  <p className="text-foreground font-medium">How can I help you today?</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">Ask me about nutrition, recipes, or dietary advice.</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-secondary/80 text-foreground border border-border/50 rounded-tl-none'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isThinking && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-secondary/80 text-foreground border border-border/50 rounded-2xl rounded-tl-none px-4 py-2 text-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    AI is thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-secondary/20 border-t border-border/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                    ? 'bg-destructive text-white animate-pulse'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                >
                  {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isRecording ? "Listening..." : "Type your query here..."}
                  className="flex-1 bg-background/50 border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isThinking}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-all shadow-glow"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Capture;
