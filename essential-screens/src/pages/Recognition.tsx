import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Check, Search, Zap } from "lucide-react";

const Recognition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const imageSrc = location.state?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
  const data = location.state?.data;

  // Defaults if no data passed (fallback)
  // Map backend structure (food_name, protein_g, etc.) to frontend display
  const foodName = data?.food_name || "Unknown Food";
  const confidence = data?.confidence ? `${Math.round(data.confidence * 100)}%` : "95%";
  const calories = data?.calories || 0;
  const macros = {
    protein: data?.protein_g ? `${data.protein_g}g` : "0g",
    carbs: data?.carbs_g ? `${data.carbs_g}g` : "0g",
    fats: data?.fats_g ? `${data.fats_g}g` : "0g"
  };

  const handleContinue = () => {
    navigate("/nutrients", { state: { image: imageSrc, data: data } });
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-card rounded-3xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/review")}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Recognition Results</h1>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <MoreHorizontal size={20} className="text-foreground" />
          </button>
        </div>

        <div className="flex gap-6 flex-col md:flex-row">
          {/* Image */}
          <div className="flex-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg ring-1 ring-border/50">
              <img
                src={imageSrc}
                alt="Recognized food"
                className="w-full h-full object-cover"
              />
            </div>


          </div>

          {/* Results */}
          <div className="flex-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check size={12} className="text-primary-foreground" />
              </div>
              <span className="text-xs text-primary font-bold tracking-wide">SUCCESSFULLY IDENTIFIED</span>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-4">{foodName}</h2>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                <Zap size={12} className="text-primary" />
                <span className="text-xs font-semibold text-primary">{confidence} AI Confidence</span>
              </div>
              <button className="px-3 py-1 rounded-full text-xs font-medium bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors">
                Edit Name
              </button>
            </div>

            {/* Nutrient Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "ESTIMATED CALS", value: `${calories} kcal`, delay: '0.3s' },
                { label: "PROTEIN", value: macros.protein, delay: '0.35s' },
                { label: "CARBOHYDRATES", value: macros.carbs, delay: '0.4s' },
                { label: "FATS", value: macros.fats, delay: '0.45s' }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-secondary/30 rounded-xl p-4 border border-border hover:bg-secondary/50 transition-colors animate-slide-up"
                  style={{ animationDelay: item.delay }}
                >
                  <p className="text-[10px] text-primary font-bold mb-1 tracking-wider">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full gradient-primary text-primary-foreground font-medium py-3 px-6 rounded-full mt-6 hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg glow-primary"
            >
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recognition;
