import React from "react";
import { analyzeImage as apiAnalyzeImage } from "../lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCw, Sparkles, Info } from "lucide-react";

const Review = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const imageSrc = location.state?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";

  const [status, setStatus] = React.useState<'preparing' | 'analyzing' | 'success' | 'error'>('preparing');

  // Helper function: Prepare image (e.g., resize, format)
  const prepareImage = async () => {
    // BACKEND HOOK: Add image preparation logic here
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
    setStatus('analyzing');
  };

  // State to hold analysis results to pass to next screen
  const [analysisResult, setAnalysisResult] = React.useState<any>(null);

  // Helper function: Analyze image (send to API)
  const analyzeImage = async () => {
    try {
      // Send image file to backend
      const file: File | undefined = location.state?.file;
      if (!file) {
        setStatus('error');
        return;
      }

      const userId = localStorage.getItem("user_id") || "demo_user";
      const data = await apiAnalyzeImage(file, userId);
      // Expecting backend AnalysisResponse { nutrition, message, fitness_sync_status }
      if (data && data.nutrition) {
        setAnalysisResult(data.nutrition);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setStatus('error');
    }
  };

  React.useEffect(() => {
    const runWorkflow = async () => {
      await prepareImage();
      // Only run analysis if still on this page/component is mounted
      await analyzeImage();
    };
    runWorkflow();
  }, []);

  const handleAnalyze = () => {
    if (analysisResult) {
      navigate("/recognition", { state: { image: imageSrc, data: analysisResult } });
    }
  };

  const handleRetake = () => {
    navigate("/capture");
  };



  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/capture")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Review Image</h1>
          <div className="w-10"></div>
        </div>

        {/* Image Preview with Overlay */}
        <div className="relative mb-6 group">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-inner relative">
            <img
              src={imageSrc}
              alt="Food preview"
              className={`w-full h-full object-cover transition-transform duration-700 ${status === 'preparing' || status === 'analyzing' ? 'scale-105 blur-sm' : ''} ${status === 'success' ? 'group-hover:scale-105' : ''}`}
            />
            {/* Scan animation */}
            {(status === 'preparing' || status === 'analyzing') && (
              <>
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-white shadow-[0_0_20px_5px_rgba(255,255,255,0.7)] animate-[scan_2s_ease-in-out_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold tracking-widest animate-pulse">
                    {status === 'preparing' ? 'PREPARING...' : 'ANALYZING...'}
                  </span>
                </div>
              </>
            )}

            {/* Error Overlay */}
            {status === 'error' && (
              <div className="absolute inset-0 bg-destructive/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-destructive font-bold text-xl">!</div>
                  <p className="text-white font-semibold">Not Food Detected</p>
                  <p className="text-white/80 text-xs">Our AI couldn't identify this as a meal.</p>
                </div>
              </div>
            )}
          </div>

          {/* Quality Badge */}
          {status === 'success' && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full px-3 py-1 border border-white/10 animate-fade-in">
              <span className="text-xs font-medium text-white">CONFIDENCE: 98%</span>
            </div>
          )}
        </div>

        {/* Status Text & Buttons */}
        <div className="text-center mb-6 min-h-[60px]">
          {(status === 'preparing' || status === 'analyzing') && (
            <p className="text-muted-foreground animate-pulse">
              {status === 'preparing' ? 'Optimizing image...' : 'Identifying food items...'}
            </p>
          )}
          {status === 'success' && (
            <div className="animate-slide-up">
              <h2 className="text-xl font-semibold text-primary mb-1">Looks delicious!</h2>
              <p className="text-muted-foreground text-sm">We've identified your meal.</p>
            </div>
          )}
          {status === 'error' && (
            <div className="animate-slide-up">
              <h2 className="text-xl font-semibold text-destructive mb-1">Scan Failed</h2>
              <p className="text-muted-foreground text-sm">Could not identify valid food.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {status === 'success' && (
            <button
              onClick={handleAnalyze}
              className="w-full gradient-primary text-primary-foreground font-medium py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg glow-primary group animate-slide-up"
            >
              <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              See Nutrition Facts
            </button>
          )}

          <button
            onClick={handleRetake}
            className={`w-full bg-secondary text-secondary-foreground font-medium py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors border border-border ${status === 'preparing' || status === 'analyzing' ? 'opacity-50 pointer-events-none' : 'animate-slide-up'}`}
          >
            <RefreshCw size={18} />
            {status === 'error' ? 'Try Again' : 'Retake Photo'}
          </button>
        </div>

        {/* Info */}
        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground bg-secondary/30 py-2 rounded-lg">
          <Info size={14} />
          <span className="text-xs">Ensure the food is clearly visible</span>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-4">
          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Review;
