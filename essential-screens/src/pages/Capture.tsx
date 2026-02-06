import { useNavigate } from "react-router-dom";
import { Camera, Bell, Image as ImageIcon, Upload, ArrowRight } from "lucide-react";
import React, { useRef, useState } from "react";

const Capture = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

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

  const handleAnalyzeUpload = () => {
    if (capturedImage) {
      navigate("/review", { state: { image: capturedImage, file: capturedFile } });
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
              <span className="text-xs font-medium">{localStorage.getItem("full_name")?.split(' ').map(n => n[0]).join('') || "US"}</span>
            </div>
            <span className="text-sm text-foreground">{localStorage.getItem("full_name") || "User"}</span>
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
      </main>
    </div>
  );
};

export default Capture;
