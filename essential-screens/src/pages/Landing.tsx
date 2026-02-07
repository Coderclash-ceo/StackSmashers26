import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0f0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Deep forest background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Logo Section */}
      <div className="flex flex-col items-center mb-10 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#b4f43c] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(180,244,60,0.4)] relative">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full mb-3" />
            <div className="absolute top-[55%] w-6 h-4 bg-white rounded-t-full" />
          </div>
          {/* Outer Ring Glow */}
          <div className="absolute inset-0 rounded-full border-2 border-[#b4f43c]/20 scale-125 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">NutriLink</h1>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-sm bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-2xl animate-slide-up">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white leading-tight">Track your food.</h2>
          <h2 className="text-3xl font-bold text-[#b4f43c] leading-tight mb-4">Track your health.</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            AI-powered nutrition analysis at your fingertips.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate("/signin")}
            className="w-full bg-[#b4f43c] text-black font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(180,244,60,0.3)]"
          >
            <LogIn size={20} />
            Sign In
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="w-full bg-[#1a1f1a] text-white font-medium py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-[#252a25] transition-all border border-white/5"
          >
            <UserPlus size={20} />
            Create Account
          </button>
        </div>

        {/* Social Login / Divider */}
        <div className="mt-10">
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <span className="relative bg-[#0d120d] px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">
              Or continue with
            </span>
          </div>

          <div className="flex justify-center gap-6">
            <button className="w-14 h-14 rounded-full bg-[#1a1f1a] border border-white/5 flex items-center justify-center hover:bg-[#252a25] hover:scale-110 transition-all duration-300 shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
            </button>
            <button className="w-14 h-14 rounded-full bg-[#1a1f1a] border border-white/5 flex items-center justify-center hover:bg-[#252a25] hover:scale-110 transition-all duration-300 shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" />
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13997 18.63 6.70997 16.7 5.83997 14.1H2.17997V16.94C3.98997 20.53 7.69997 23 12 23Z" />
                <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z" />
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.69997 1 3.98997 3.47 2.17997 7.07L5.83997 9.91C6.70997 7.31 9.13997 5.38 12 5.38Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
