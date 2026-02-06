import { useNavigate } from "react-router-dom";
import { RefreshCw, Check, X, Shield, Lock } from "lucide-react";
import { useState } from "react";

const Sync = () => {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleFitStatus, setGoogleFitStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSync = () => {
    if (googleFitStatus === 'disconnected') {
      alert("Please connect Google Fit first.");
      return;
    }
    setIsSyncing(true);
    // In a real app, this would call a backend sync endpoint
    // For now we just show the success state immediately or after a short delay
    setTimeout(() => {
      setIsSyncing(false);
      setShowSuccessToast(true);
    }, 1000);
  };

  const toggleGoogleFit = () => {
    if (googleFitStatus === 'connected') {
      const confirm = window.confirm("Are you sure you want to disconnect Google Fit?");
      if (confirm) setGoogleFitStatus('disconnected');
    } else {
      // Simulate OAuth flow
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // In a real app, this would be your OAuth URL
      const popup = window.open(
        'https://accounts.google.com/o/oauth2/auth/oauthchooseaccount?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Ffitness.activity.read&service=lso&o2v=1&flowName=GeneralOAuthFlow',
        'Google Fit',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      // Simulate successful return from popup
      setTimeout(() => {
        popup?.close();
        setGoogleFitStatus('connected');
      }, 2000);
    }
  };

  const integrations = [
    {
      name: "Google Fit",
      description: "Seamlessly import heart rate, resting metabolic rate, and daily activity logs from your Google ecosystem.",
      status: googleFitStatus,
      statusLabel: googleFitStatus === 'connected' ? "CONNECTED" : "DISCONNECTED",
      icon: (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center ring-1 ring-border">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6V12C4 16.42 7.34 20.5 12 22C16.66 20.5 20 16.42 20 12V6L12 2Z" fill="#4285F4" />
            <path d="M12 11V15M12 7V9" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ),
      lastSync: googleFitStatus === 'connected' ? "Synced just now" : null,
      action: googleFitStatus === 'connected' ? "Disconnect" : "Connect Google Fit",
      actionColor: googleFitStatus === 'connected' ? "text-destructive" : "text-primary",
      onClick: toggleGoogleFit
    },
    {
      name: "Fitbit",
      description: "Track specialized metrics including sleep stages, flooring levels, and active zone minutes.",
      status: "inactive",
      statusLabel: "COMING SOON",
      icon: (
        <div className="w-12 h-12 rounded-full bg-[#00B0B9]/20 flex items-center justify-center grayscale opacity-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#00B0B9">
            <rect x="10" y="2" width="4" height="4" rx="1" />
            <rect x="10" y="8" width="4" height="4" rx="1" />
            <rect x="10" y="14" width="4" height="4" rx="1" />
            <rect x="10" y="20" width="4" height="2" rx="1" />
            <rect x="4" y="8" width="4" height="4" rx="1" />
            <rect x="16" y="8" width="4" height="4" rx="1" />
          </svg>
        </div>
      ),
      lastSync: null,
      action: "Notify Me",
      actionColor: "text-muted-foreground cursor-not-allowed",
      onClick: () => alert("Fitbit integration is coming soon!")
    },
    {
      name: "Apple Health",
      description: "Premium integration including Apple Watch VO2 Max data and comprehensive dietary macronutrients.",
      status: "inactive",
      statusLabel: "COMING SOON",
      icon: (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center ring-1 ring-border grayscale opacity-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF2D55">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ),
      lastSync: null,
      action: "Notify Me",
      actionColor: "text-muted-foreground cursor-not-allowed",
      onClick: () => alert("Apple Health integration is coming soon!")
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center glow-primary">
            <RefreshCw size={16} className="text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">NutriLink</span>
        </div>

        <nav className="flex items-center gap-8">
          <button onClick={() => navigate("/capture")} className="text-muted-foreground font-medium text-sm hover:text-foreground transition-colors">Dashboard</button>
          <button className="text-primary font-medium text-sm border-b-2 border-primary pb-0.5">Integrations</button>
          <button onClick={() => navigate("/statistics")} className="text-muted-foreground font-medium text-sm hover:text-foreground transition-colors">Analytics</button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
              <span className="text-xs font-medium">AR</span>
            </div>
            <span className="text-sm text-foreground">Alex Rivera</span>
          </div>
          <button
            onClick={() => navigate("/sign-in")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="flex justify-center mt-6 animate-slide-up absolute top-20 left-0 right-0 z-50">
          <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-2 shadow-lg">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Check size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Nutrition data synced</p>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="text-muted-foreground hover:text-foreground ml-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-6 py-8 max-w-5xl mx-auto">
        <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Connect <span className="text-gradient">Devices</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Centralize your biometric data for high-precision nutrition analysis and automated health insights.
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className={`glass-card rounded-2xl p-5 transition-all duration-300 animate-slide-up group ${integration.status === 'inactive' ? 'opacity-70' : 'hover:bg-card/80'}`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {integration.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${integration.status === "connected"
                  ? "bg-primary/20 text-primary border-primary/20"
                  : integration.status === "priority"
                    ? "bg-primary/20 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                  }`}>
                  {integration.statusLabel}
                </span>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{integration.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{integration.description}</p>

              {integration.lastSync && (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  <p className="text-xs text-muted-foreground">{integration.lastSync}</p>
                </div>
              )}

              <button
                onClick={integration.onClick}
                className={`w-full text-sm font-medium py-2 rounded-full border transition-colors ${integration.status === 'connected'
                  ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                  : integration.status === 'inactive'
                    ? 'border-border text-muted-foreground bg-muted/50 cursor-pointer'
                    : 'border-primary text-primary hover:bg-primary/10'
                  }`}
              >
                {integration.action}
              </button>
            </div>
          ))}
        </div>

        {/* Sync Button */}
        <div className="flex justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={handleSync}
            disabled={isSyncing || googleFitStatus === 'disconnected'}
            className={`gradient-primary text-primary-foreground font-medium py-3 px-8 rounded-full flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200 glow-primary ${isSyncing || googleFitStatus === 'disconnected' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing Data..." : "Sync Nutrition Data"}
          </button>
        </div>

        {/* Footer Badges */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground opacity-50 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-2">
            <Shield size={14} />
            <span>OAUTH 2.0 ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={14} />
            <span>HIPAA COMPLIANT</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sync;
