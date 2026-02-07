import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all details.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });
      localStorage.setItem("user_id", result.user_id);
      localStorage.setItem("full_name", result.full_name);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${result.full_name}`,
      });
      navigate("/capture");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0f0a]">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Static Glass Card (Float screen removed as requested) */}
      <div className="relative z-10 w-full max-w-sm bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-3xl animate-fade-in">

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#b4f43c] flex items-center justify-center shadow-[0_0_20px_rgba(180,244,60,0.3)] relative group">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full mb-2" />
              <div className="absolute top-[55%] w-5 h-3 bg-white rounded-t-full" />
            </div>
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Track your food.</h1>
          <h1 className="text-3xl font-bold text-[#b4f43c]">Track your health.</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#b4f43c] transition-colors" size={18} />
            <input
              type="email"
              placeholder="vyasfranklin319@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1f1a]/80 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#b4f43c]/30 focus:bg-[#1a1f1a] transition-all"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#b4f43c] transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1f1a]/80 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-[#b4f43c]/30 focus:bg-[#1a1f1a] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-[#b4f43c] text-black font-bold py-4 rounded-full shadow-[0_0_15px_rgba(180,244,60,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="w-full bg-transparent border border-white/5 text-white/60 font-medium py-4 rounded-full hover:bg-white/5 hover:text-white transition-all text-sm"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
