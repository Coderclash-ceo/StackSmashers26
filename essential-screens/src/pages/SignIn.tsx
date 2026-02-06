import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { login } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Parallax Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

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

  const handleSocialLogin = (platform: 'google' | 'apple') => {
    // Social login logic
    if (platform === 'google') {
      navigate("/capture");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1a2f1a] to-[#0d1a0d]"
      onMouseMove={handleMouseMove}
    >
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>

      {/* Floating Glass Card */}
      <motion.div
        style={{ rotateX, rotateY, perspective: 1000 }}
        initial={{ y: 0 }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
      >
        {/* Glow Element */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-neon-green/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-green/10 flex items-center justify-center border border-neon-green/20 shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-neon-green">
              <path d="M12 2C13.5 2 15 3.5 15 5C15 6.5 14 8 12 8C10 8 9 6.5 9 5C9 3.5 10.5 2 12 2Z" fill="currentColor" />
              <path d="M12 8C8 8 6 12 6 16C6 20 8 22 12 22C16 22 18 20 18 16C18 12 16 8 12 8Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Track your food.</h1>
          <h1 className="text-3xl font-bold text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">Track your health.</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-neon-green transition-colors" size={18} />
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-light"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-neon-green transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-light"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <motion.button
            disabled={isLoading}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(57,255,20,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-neon-green text-black font-bold py-3.5 rounded-full shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </motion.button>

          <motion.button
            type="button"
            onClick={() => navigate("/signup")}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-transparent border border-white/20 text-white font-medium py-3.5 rounded-full hover:border-white/40 transition-all"
          >
            Create Account
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-white/40 text-sm">Sign up with</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center">
          <motion.button
            onClick={() => handleSocialLogin('google')}
            // Anti-gravity float
            animate={{ y: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}

            // Hover interactions
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 25px rgba(57,255,20,0.2)",
              borderColor: "rgba(255,255,255,0.3)"
            }}
            whileTap={{ scale: 0.95 }}

            // Base styles: 48x48, circle, olive glass, soft border
            className="w-12 h-12 rounded-full bg-[#1a2f1a]/40 backdrop-blur-md border border-white/10 flex items-center justify-center group relative shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]"
          >
            {/* Faint Green Halo Expansion */}
            <div className="absolute inset-0 bg-neon-green/5 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out pointer-events-none"></div>

            {/* White Google Icon - Flat & Clean */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="relative z-10 opacity-90 group-hover:opacity-100 transition-opacity">
              <path d="M21.35 11.1H12v3.6h5.36c-.23 1.23-.9 2.27-1.92 2.96v2.46h3.11c1.82-1.68 2.87-4.15 2.87-7.07 0-.7-.06-1.37-.17-1.95z" />
              <path d="M12 20.6c2.63 0 4.84-.87 6.45-2.36l-3.11-2.46c-.87.58-1.99.93-3.34.93-2.54 0-4.69-1.72-5.46-4.03H3.32v2.54C4.94 18.45 8.24 20.6 12 20.6z" />
              <path d="M6.54 12.69c-.2-.61-.31-1.25-.31-1.91s.11-1.31.31-1.91V6.32H3.32C2.66 7.63 2.29 9.12 2.29 12s.37 4.37 1.03 5.68l3.22-2.53z" />
              <path d="M12 5.25c1.43 0 2.71.49 3.73 1.46L18.46 4C16.91 2.55 14.65 1.77 12 1.77 8.24 1.77 4.94 3.92 3.32 7.13l3.22 2.53c.77-2.31 2.92-4.41 5.46-4.41z" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
