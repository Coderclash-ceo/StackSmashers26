import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { register } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all details.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({ full_name: fullName, email, password });
      localStorage.setItem("user_id", result.user_id);
      localStorage.setItem("full_name", fullName);
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      navigate("/capture");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform: 'google' | 'apple') => {
    if (platform === 'google') {
      // Redirect to Google Sign In
      window.open("https://accounts.google.com/signin", "_blank");
    } else {
      // Redirect to Apple Sign In
      window.open("https://appleid.apple.com/sign-in", "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Logo */}
      <div className="flex flex-col items-center mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-2 glow-primary">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
            <path d="M12 2C13.5 2 15 3.5 15 5C15 6.5 14 8 12 8C10 8 9 6.5 9 5C9 3.5 10.5 2 12 2Z" fill="currentColor" />
            <path d="M12 8C8 8 6 12 6 16C6 20 8 22 12 22C16 22 18 20 18 16C18 12 16 8 12 8Z" fill="currentColor" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground">NutriLink</h1>
        <p className="text-muted-foreground text-sm">Level up your fitness journey</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-foreground">Create Account</h2>
          <p className="text-muted-foreground text-sm mt-1">Join the community of health enthusiasts.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2 font-medium">Full Name</label>
            <div className="relative group">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Thompson"
                className="w-full bg-secondary/50 border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2 font-medium">Email Address</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-secondary/50 border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-2 font-medium">Password</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full bg-secondary/50 border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-primary text-primary-foreground font-medium py-3 px-6 rounded-full hover:opacity-90 hover:scale-[1.02] transition-all duration-300 mt-2 shadow-lg glow-primary flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
          </button>
        </form>

        {/* Social Login */}
        <div className="mt-5">
          <p className="text-muted-foreground text-xs text-center mb-3 uppercase tracking-wider">Or sign up with</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleSocialLogin('apple')}
              className="flex-1 bg-secondary/50 border border-border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-foreground">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
              <span className="text-sm text-foreground font-medium">Apple</span>
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              className="flex-1 bg-secondary/50 border border-border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-foreground">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" />
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13997 18.63 6.70997 16.7 5.83997 14.1H2.17997V16.94C3.98997 20.53 7.69997 23 12 23Z" />
                <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z" />
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.69997 1 3.98997 3.47 2.17997 7.07L5.83997 9.91C6.70997 7.31 9.13997 5.38 12 5.38Z" />
              </svg>
              <span className="text-sm text-foreground font-medium">Google</span>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <button onClick={() => navigate("/signin")} className="text-primary hover:underline font-medium">
            Sign In
          </button>
        </p>

        <div className="flex justify-center gap-4 mt-6 text-[10px] text-muted-foreground/60">
          <button className="hover:text-foreground transition-colors">TERMS OF SERVICE</button>
          <button className="hover:text-foreground transition-colors">PRIVACY POLICY</button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
