import { Head } from '@inertiajs/react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MonthlyEntry   = { name: string; Users: number; Backups: number };
type RoleEntry      = { name: string; value: number };
type AreaEntry      = { month: string; users: number; backups: number };
type RadialEntry    = { name: string; value: number; fill: string };

type PageProps = {
    totalUsers:         number;
    totalBackups:       number;
    totalActivityLogs:  number;
    monthlyData:        MonthlyEntry[];
    roleDistribution:   RoleEntry[];
    areaData:           AreaEntry[];
    performanceMetrics: RadialEntry[];
};

const ROLE_COLORS = ['#fbbf24', '#a78bfa', '#38bdf8', '#4ade80', '#f87171'];

export default function AdminDashboard({
    totalUsers,
    totalBackups,
    totalActivityLogs,
    monthlyData,
    roleDistribution,
    areaData,
    performanceMetrics,
}: PageProps) {
    const summaryCards = [
        { label: 'Users',         value: totalUsers },
        { label: 'Backups',       value: totalBackups },
        { label: 'Activity Logs', value: totalActivityLogs },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">

                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {summaryCards.map((item) => (
                        <Card key={item.label} className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
                            <CardHeader className="px-4 py-3">
                                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {item.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 py-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {item.value.toLocaleString()}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* Monthly Activity — bar chart */}
                    <Card className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                                Monthly Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Users"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Backups" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Monthly Trends — line chart */}
                    <Card className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                                Monthly Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Users"   stroke="#22c55e" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Backups" stroke="#f43f5e" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* User Roles — pie chart */}
                    <Card className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                                User Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-[300px] items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleDistribution.map((entry, i) => ({
                                            ...entry,
                                            fill: ROLE_COLORS[i % ROLE_COLORS.length],
                                        }))}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    />
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Resource Usage — area chart */}
                    <Card className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                                Resource Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="users"   name="Users"      stroke="#8884d8" fill="#c6dae7" />
                                    <Area type="monotone" dataKey="backups" name="Activities" stroke="#82ca9d" fill="#b7e4c7" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics — radial bar */}
                    <Card className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800 md:col-span-2">
                        <CardHeader className="px-4 py-3">
                            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">
                                Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    innerRadius="30%"
                                    outerRadius="80%"
                                    data={performanceMetrics}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <RadialBar
                                        dataKey="value"
                                        cornerRadius={10}
                                        label={{ fill: '#fff', position: 'insideStart' }}
                                    />
                                    <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
                                    <Tooltip formatter={(v) => `${v}%`} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }],
};
