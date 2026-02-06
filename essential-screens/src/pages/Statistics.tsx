import { ArrowLeft, TrendingUp, Calendar, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useEffect, useState } from "react";
import { getHistory } from "../lib/api";

const Statistics = () => {
    const navigate = useNavigate();
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [macroData, setMacroData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getHistory('demo_user');
                if (data && data.history) {
                    processData(data.history);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const processData = (history: any[]) => {
        // 1. Process Weekly Data (last 7 days)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            return {
                fullDate: d.toLocaleDateString(),
                day: days[d.getDay()],
                calories: 0
            };
        });

        history.forEach(item => {
            const itemDate = new Date(item.timestamp).toLocaleDateString();
            const dayBucket = last7Days.find(d => d.fullDate === itemDate);
            if (dayBucket) {
                dayBucket.calories += item.calories || 0;
            }
        });
        setWeeklyData(last7Days);

        // 2. Process Macro Data (Average of last 5 meals or today)
        let totalP = 0, totalC = 0, totalF = 0;
        const recentHistory = history.slice(0, 10);
        recentHistory.forEach(item => {
            totalP += item.nutrition?.protein_g || 0;
            totalC += item.nutrition?.carbs_g || 0;
            totalF += item.nutrition?.fats_g || 0;
        });

        const count = recentHistory.length || 1;
        setMacroData([
            { name: "Protein", value: Math.round(totalP / count), color: "#10b981", percent: Math.min(100, Math.round((totalP / count) / 1.5)) },
            { name: "Carbs", value: Math.round(totalC / count), color: "#3b82f6", percent: Math.min(100, Math.round((totalC / count) / 2.5)) },
            { name: "Fats", value: Math.round(totalF / count), color: "#f59e0b", percent: Math.min(100, Math.round((totalF / count) / 0.8)) },
        ]);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="flex items-center gap-4 px-6 py-4 border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
                <button
                    onClick={() => navigate("/capture")}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                    <ArrowLeft size={20} className="text-foreground" />
                </button>
                <h1 className="text-xl font-semibold text-foreground">Statistics</h1>
            </header>

            <main className="flex-1 p-6 scrollbar-hide">
                <div className="max-w-md mx-auto space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* Weekly Chart */}
                            <div className="glass-card rounded-3xl p-6 animate-slide-up">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                                        <Calendar size={18} className="text-primary" />
                                        Weekly Intake
                                    </h2>
                                    <span className="text-xs text-muted-foreground">Last 7 Days</span>
                                </div>

                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={weeklyData}>
                                            <XAxis
                                                dataKey="day"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#888', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                                                {weeklyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.calories > 2200 ? '#f59e0b' : '#3b82f6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Macro Progress */}
                            <div className="glass-card rounded-3xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                                        <Zap size={18} className="text-yellow-400" />
                                        Macro Goals
                                    </h2>
                                    <span className="text-xs text-muted-foreground">Recent Average</span>
                                </div>

                                <div className="space-y-6">
                                    {macroData.map((item) => (
                                        <div key={item.name}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">{item.name}</span>
                                                <span className="font-medium text-foreground">{item.value}g</span>
                                            </div>
                                            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trend Card */}
                            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-6 border border-primary/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <TrendingUp size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">On Track!</h3>
                                        <p className="text-sm text-muted-foreground">
                                            You've logged {weeklyData.filter(d => d.calories > 0).length} active days this week. Keep tracking for better insights!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Statistics;
