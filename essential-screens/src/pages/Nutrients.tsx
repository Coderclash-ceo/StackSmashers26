import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Share2, Plus, Camera } from "lucide-react";
import { useEffect, useState } from "react";

const Nutrients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animated, setAnimated] = useState(false);

  // Get data passed from previous screen
  const imageSrc = location.state?.image || "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&q=80";
  const data = location.state?.data;

  // Cleanup macros for display (remove 'g' for charts)
  const getMacroVal = (val: string) => parseInt(val) || 0;

  const macroData = {
    protein: data?.protein_g ? `${data.protein_g}g` : "0g",
    carbs: data?.carbs_g ? `${data.carbs_g}g` : "0g",
    fats: data?.fats_g ? `${data.fats_g}g` : "0g"
  };
  const foodName = data?.food_name || "Unknown Food";
  const calories = data?.calories || 0;

  const micronutrients = data?.micronutrients || [
    { label: "Fiber", value: "0g", percentage: 0, dailyValue: "0%" },
    { label: "Sodium", value: "0mg", percentage: 0, dailyValue: "0%" },
    { label: "Vitamin D", value: "0mcg", percentage: 0, dailyValue: "0%" },
    { label: "Iron", value: "0mg", percentage: 0, dailyValue: "0%" },
    { label: "Potassium", value: "0mg", percentage: 0, dailyValue: "0%" },
  ];

  useEffect(() => {
    setAnimated(true);
  }, []);

  const handleAddToLog = () => {
    navigate("/sync");
  };

  const macros = [
    { label: "PROTEIN", value: macroData.protein, percentage: 80, color: "text-primary" },
    { label: "CARBS", value: macroData.carbs, percentage: 30, color: "text-accent" },
    { label: "FATS", value: macroData.fats, percentage: 55, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/recognition")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Food Insight</h1>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Share2 size={20} className="text-foreground" />
          </button>
        </div>

        {/* Food Image */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg glow-primary animate-fade-in">
            <img
              src={imageSrc}
              alt={foodName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Food Name */}
        <div className="text-center mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-foreground mb-2">{foodName}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20">
              HIGH PROTEIN
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/20">
              LOW CARB
            </span>
          </div>
        </div>

        {/* Calories */}
        <div className="text-center mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-5xl font-bold text-gradient inline-block">{calories} <span className="text-2xl text-muted-foreground font-normal">kcal</span></p>
          <p className="text-sm text-muted-foreground mt-1">Estimated total energy</p>
        </div>

        {/* Macros */}
        <div className="flex justify-center gap-6 mb-6">
          {macros.map((macro, index) => (
            <div key={index} className="flex flex-col items-center animate-slide-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
              <div className="relative w-16 h-16 mb-2">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="hsl(120 15% 20%)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="hsl(82 84% 55%)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="176"
                    strokeDashoffset={animated ? 176 - (176 * macro.percentage) / 100 : 176}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">{macro.percentage}%</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide">{macro.label}</p>
              <p className="text-lg font-bold text-foreground">{macro.value}</p>
            </div>
          ))}
        </div>

        {/* Micronutrients */}
        <div className="bg-secondary/30 rounded-2xl p-4 border border-border mb-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Micronutrients</h3>
            <span className="text-xs text-primary font-medium">% Daily Value</span>
          </div>

          <div className="space-y-3">
            {micronutrients.map((nutrient, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-20 font-medium">{nutrient.label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: animated ? `${nutrient.percentage}%` : '0%' }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-foreground w-16 text-right">{nutrient.value}</span>
                <span className="text-xs text-muted-foreground w-10 text-right">{nutrient.dailyValue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <button
            onClick={handleAddToLog}
            className="flex-1 gradient-primary text-primary-foreground font-medium py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg glow-primary"
          >
            <Plus size={18} />
            Add to Log
          </button>
          <button className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <Camera size={20} className="text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nutrients;
