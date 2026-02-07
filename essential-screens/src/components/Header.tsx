import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, ArrowLeft } from "lucide-react";

interface HeaderProps {
    title?: string;
    showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack }) => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("user_id") || "demo_user";
    const fullName = localStorage.getItem("full_name") || "User Account";

    // Notification States
    const [notifications, setNotifications] = useState<any[]>(() => {
        const saved = localStorage.getItem(`notifications_${userId}`);
        return saved ? JSON.parse(saved) : [
            { id: 1, title: "Welcome to NutriLink", message: "Start tracking your meals for AI insights!", time: "Just now", unread: true }
        ];
    });
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
    }, [notifications, userId]);

    // Listen for changes from other components (via storage event)
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem(`notifications_${userId}`);
            if (saved) setNotifications(JSON.parse(saved));
        };
        window.addEventListener("storage", handleStorageChange);
        // Custom event for same-window updates
        window.addEventListener("notificationsUpdated", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("notificationsUpdated", handleStorageChange);
        };
    }, [userId]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, unread: false }));
        setNotifications(updated);
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        localStorage.setItem(`notifications_${userId}`, JSON.stringify([]));
    };

    const handleLogout = () => {
        localStorage.removeItem("user_id");
        localStorage.removeItem("full_name");
        navigate("/signin");
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
            <div className="flex items-center gap-4">
                {showBack ? (
                    <button
                        onClick={() => navigate("/capture")}
                        className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
                    >
                        <ArrowLeft size={18} className="text-foreground" />
                    </button>
                ) : (
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/capture")}>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center glow-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                                <path d="M12 2C13.5 2 15 3.5 15 5C15 6.5 14 8 12 8C10 8 9 6.5 9 5C9 3.5 10.5 2 12 2Z" fill="currentColor" />
                                <path d="M12 8C8 8 6 12 6 16C6 20 8 22 12 22C16 22 18 20 18 16C18 12 16 8 12 8Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div>
                            <span className="font-semibold text-foreground">NutriLink</span>
                            <span className="text-[10px] text-muted-foreground block -mt-1 uppercase tracking-wider">Premium AI</span>
                        </div>
                    </div>
                )}
                {title && <h1 className="text-lg font-semibold text-foreground ml-2">{title}</h1>}
            </div>

            {!showBack && (
                <nav className="hidden md:flex items-center gap-8">
                    <button onClick={() => navigate("/capture")} className="text-primary font-medium text-sm border-b-2 border-primary pb-0.5">DASHBOARD</button>
                    <button onClick={() => navigate("/history")} className="text-muted-foreground font-medium text-sm hover:text-foreground transition-colors">HISTORY</button>
                    <button onClick={() => navigate("/statistics")} className="text-muted-foreground font-medium text-sm hover:text-foreground transition-colors">STATISTICS</button>
                </nav>
            )}

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowUserMenu(false);
                        }}
                        className={`w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-all ${showNotifications ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                    >
                        <Bell size={18} className={unreadCount > 0 ? "text-primary" : "text-muted-foreground"} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background shadow-glow animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 mt-2 w-80 glass-card border border-border/50 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                                    <div className="flex gap-2">
                                        <button onClick={markAllAsRead} className="text-[10px] text-primary hover:underline font-bold">Mark all read</button>
                                        <button onClick={clearAllNotifications} className="text-[10px] text-muted-foreground hover:underline">Clear</button>
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-xs text-muted-foreground">No new notifications</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`px-4 py-3 border-b border-border/50 last:border-0 hover:bg-white/5 transition-colors cursor-default ${n.unread ? 'bg-primary/5' : ''}`}>
                                                <div className="flex items-start justify-between mb-1">
                                                    <span className="text-xs font-bold text-foreground">{n.title}</span>
                                                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground leading-relaxed">{n.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowUserMenu(!showUserMenu);
                            setShowNotifications(false);
                        }}
                        className="flex items-center gap-2 hover:bg-secondary/50 p-1.5 rounded-full transition-all duration-300"
                    >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border shadow-sm">
                            <span className="text-xs font-medium text-foreground">{fullName.split(' ').map(n => n[0]).join('') || "US"}</span>
                        </div>
                        <span className="text-sm text-foreground font-medium hidden md:block">{fullName.split(' ')[0] || "User"}</span>
                    </button>

                    {showUserMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                            <div className="absolute right-0 mt-2 w-48 glass-card border border-border/50 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="px-4 py-2 border-b border-border/50 mb-1">
                                    <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
                                    <p className="text-[10px] text-muted-foreground">Premium Account</p>
                                </div>
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
