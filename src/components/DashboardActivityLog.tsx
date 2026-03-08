import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";

interface ActivityItem {
    created_at: string;
    profile?: { name: string };
    habits?: { name: string; icon: string };
}

export const DashboardActivityLog = ({ activity }: { activity: ActivityItem[] }) => {
    return (
        <div className="glass-panel rounded p-0 min-h-[500px] neo-shadow relative">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

            <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-[#224949] pb-2">
                    <h3 className="text-lg font-bold text-white font-bold tracking-wider">ACTIVE_TASKS</h3>
                    <button className="text-slate-400 hover:text-[#25f4f4] transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {activity.length === 0 ? (
                    <>
                        <div className="space-y-4 opacity-30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-background-dark border border-[#224949]" />
                                <div className="h-2 bg-background-dark w-full" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-background-dark border border-[#224949]" />
                                <div className="h-2 bg-background-dark w-2/3" />
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <p className="text-[10px] font-bold text-slate-400">waiting for input...</p>
                        </div>
                    </>
                ) : (
                    <div className="space-y-3">
                        {activity.slice(0, 8).map((act, i) => (
                            <div
                                key={i}
                                className="bg-card-dark rounded p-3 text-white shadow-sm border border-[#224949] hover:border-[#25f4f4] transition-all group relative overflow-hidden"
                            >
                                {/* Left accent bar — teal */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#25f4f4] group-hover: transition-all" />

                                <div className="flex items-center gap-3 pl-2">
                                    <div className="w-10 h-10 rounded bg-background-dark flex items-center justify-center border border-[#224949] group-hover:border-[#25f4f4] shrink-0 transition-colors">
                                        <span className="text-lg">{act.habits?.icon || "⚡"}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold font-bold text-sm truncate text-white group-hover:text-[#25f4f4]">
                                            {act.habits?.name?.toUpperCase() || "TASK"}.exe
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                                            <span className="text-[#25f4f4]">BY: {act.profile?.name || "SYS"}</span>
                                            <span className="text-[#224949]">|</span>
                                            <span className="text-slate-400">
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
