import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, Users, MessageCircle, HelpCircle, TrendingUp } from "lucide-react";

const AdminAnalyticsTab = () => {
    // Fetch analytics data
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('analytics_daily_view')
                .select('*')
                .order('date', { ascending: true })
                .limit(30);

            if (error) {
                // Fallback for when view doesn't exist yet
                console.error("Analytics view error:", error);
                return [];
            }
            return data;
        },
    });

    // Fetch totals
    const { data: totals } = useQuery({
        queryKey: ['admin-totals'],
        queryFn: async () => {
            const { count: usersCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
            const { count: questionsCount } = await supabase.from('baloria_questions').select('*', { count: 'exact', head: true });
            const { count: answersCount } = await supabase.from('baloria_answers').select('*', { count: 'exact', head: true });

            return {
                users: usersCount || 0,
                questions: questionsCount || 0,
                answers: answersCount || 0
            };
        }
    });

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#4D96FF]" /></div>;
    }

    // Calculate engagement rate (simple metric: answers / questions)
    const engagementRate = totals ? ((totals.answers / (totals.questions || 1)) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPI_Card title="Totaal Gebruikers" value={totals?.users} icon={Users} color="#4D96FF" />
                <KPI_Card title="Totaal Vragen" value={totals?.questions} icon={HelpCircle} color="#FFD93D" />
                <KPI_Card title="Totaal Antwoorden" value={totals?.answers} icon={MessageCircle} color="#10B981" />
                <KPI_Card title="Engagement Rate" value={`${engagementRate}%`} icon={TrendingUp} color="#F472B6" subtitle="Antwoorden per vraag" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Growth Chart */}
                <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4">
                    <div className="mb-4">
                        <h3 className="text-[#F1F5F9] text-lg font-medium">Gebruikersgroei (30 dagen)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94A3B8"
                                    fontSize={12}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
                                />
                                <YAxis stroke="#94A3B8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F1F5F9' }}
                                    itemStyle={{ color: '#F1F5F9' }}
                                />
                                <Line type="monotone" dataKey="new_users" name="Nieuwe Gebruikers" stroke="#4D96FF" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4">
                    <div className="mb-4">
                        <h3 className="text-[#F1F5F9] text-lg font-medium">Activiteit (Vragen & Antwoorden)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94A3B8"
                                    fontSize={12}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
                                />
                                <YAxis stroke="#94A3B8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F1F5F9' }}
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                />
                                <Legend wrapperStyle={{ color: '#94A3B8' }} />
                                <Bar dataKey="new_questions" name="Vragen" fill="#FFD93D" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="new_answers" name="Antwoorden" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

const KPI_Card = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5">
            <Icon className="w-24 h-24" style={{ color }} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-[#F1F5F9]">{value ?? '-'}</h3>
                {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
            </div>
        </div>
    </div>
);

export default AdminAnalyticsTab;
