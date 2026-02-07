import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getHistory } from "../lib/api";
import Header from "../components/Header";

const History = () => {
    const navigate = useNavigate();
    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            const userId = localStorage.getItem("user_id") || "demo_user";
            try {
                const data = await getHistory(userId);
                if (data && data.history) {
                    setHistoryItems(data.history);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, []);

    const formatDate = (isoStr: string) => {
        if (!isoStr) return "";
        const date = new Date(isoStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (isoStr: string) => {
        if (!isoStr) return "";
        const date = new Date(isoStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <Header title="Food History" showBack />

            <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="max-w-md mx-auto space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : historyItems.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">No meals logged yet.</p>
                            <button
                                onClick={() => navigate("/capture")}
                                className="mt-4 text-primary font-medium"
                            >
                                Track your first meal
                            </button>
                        </div>
                    ) : (
                        historyItems.map((item, index) => (
                            <div
                                key={index}
                                className="glass-card rounded-2xl p-3 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md shrink-0 bg-secondary flex items-center justify-center">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.food_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Calendar className="text-muted-foreground" size={24} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-foreground truncate">{item.food_name}</h3>
                                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            {item.calories} cal
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {item.nutrition?.protein_g}g P • {item.nutrition?.carbs_g}g C • {item.nutrition?.fats_g}g F
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} /> {formatDate(item.timestamp)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} /> {formatTime(item.timestamp)}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight size={16} className="text-muted-foreground" />
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default History;
