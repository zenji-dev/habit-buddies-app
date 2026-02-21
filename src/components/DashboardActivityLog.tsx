import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";

interface ActivityItem {
    created_at: string;
    profile?: { name: string };
    habits?: { name: string; icon: string };
}

export const DashboardActivityLog = ({ activity }: { activity: ActivityItem[] }) => {
    return (
        <div className="bg-card-dark border border-slate-900 rounded-none p-0 min-h-[500px] shadow-neon-box relative">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

            <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-900 pb-2">
                    <h3 className="text-lg font-bold text-white font-mono-tech tracking-wider">ACTIVE_TASKS</h3>
                    <button className="text-gray-500 hover:text-[#00a375] transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {activity.length === 0 ? (
                    <>
                        <div className="space-y-4 opacity-30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-900 border border-slate-800" />
                                <div className="h-2 bg-slate-900 w-full" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-900 border border-slate-800" />
                                <div className="h-2 bg-slate-900 w-2/3" />
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <p className="text-[10px] font-mono-tech text-gray-600">waiting for input...</p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-3">
                        {activity.slice(0, 8).map((act, i) => (
                            <div
                                key={i}
                                className="bg-surface-dark rounded-none p-3 text-white shadow-sm border border-slate-900 hover:border-[#00a375] transition-all group relative overflow-hidden"
                            >
                                {/* Left accent bar — teal */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00a375] group-hover:shadow-[0_0_10px_#00a375] transition-all" />

                                <div className="flex items-center gap-3 pl-2">
                                    <div className="w-10 h-10 rounded-none bg-background-dark flex items-center justify-center border border-slate-800 group-hover:border-[#00a375] shrink-0 transition-colors">
                                        <span className="text-lg">{act.habits?.icon || "⚡"}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold font-mono-tech text-sm truncate text-white group-hover:text-[#00a375]">
                                            {act.habits?.name?.toUpperCase() || "TASK"}.exe
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono-tech mt-1">
                                            <span className="text-[#00a375]">BY: {act.profile?.name || "SYS"}</span>
                                            <span className="text-slate-800">|</span>
                                            <span className="text-gray-400">
                                                {(() => { try { return format(new Date(act.created_at), "HH:mm"); } catch { return "--:--"; } })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
