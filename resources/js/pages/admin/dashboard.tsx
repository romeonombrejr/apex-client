import { Head } from '@inertiajs/react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    RadialBar,
    RadialBarChart,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

type MonthlyEntry = { name: string; Users: number; Backups: number };
type RoleEntry = { name: string; value: number };
type AreaEntry = { month: string; users: number; backups: number };
type RadialEntry = { name: string; value: number; fill: string };

type PageProps = {
    totalUsers: number;
    totalBackups: number;
    totalActivityLogs: number;
    monthlyData: MonthlyEntry[];
    roleDistribution: RoleEntry[];
    areaData: AreaEntry[];
    performanceMetrics: RadialEntry[];
};

const chartColor = (i: number) => `var(--chart-${(i % 5) + 1})`;

const monthlyConfig = {
    Users: { label: 'Users', color: 'var(--chart-1)' },
    Backups: { label: 'Backups', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const areaConfig = {
    users: { label: 'Users', color: 'var(--chart-1)' },
    backups: { label: 'Activities', color: 'var(--chart-2)' },
} satisfies ChartConfig;

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
        { label: 'Users', value: totalUsers },
        { label: 'Backups', value: totalBackups },
        { label: 'Activity Logs', value: totalActivityLogs },
    ];

    // Colors for the dynamic pie/radial series come from the theme's chart vars.
    const roleConfig: ChartConfig = Object.fromEntries(
        roleDistribution.map((entry, i) => [
            entry.name,
            { label: entry.name, color: chartColor(i) },
        ]),
    );

    const radialConfig: ChartConfig = Object.fromEntries(
        performanceMetrics.map((entry, i) => [
            entry.name,
            { label: entry.name, color: chartColor(i) },
        ]),
    );

    // Per-slice colors from theme chart vars (Recharts reads `fill` off each datum).
    const roleData = roleDistribution.map((entry, i) => ({
        ...entry,
        fill: chartColor(i),
    }));
    const radialData = performanceMetrics.map((entry, i) => ({
        ...entry,
        fill: chartColor(i),
    }));

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {summaryCards.map((item) => (
                        <Card key={item.label}>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    {item.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-3xl font-bold">
                                {item.value.toLocaleString()}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Monthly Activity — bar chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Monthly Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={monthlyConfig}
                                className="aspect-auto h-[300px] w-full"
                            >
                                <BarChart data={monthlyData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Bar
                                        dataKey="Users"
                                        fill="var(--color-Users)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="Backups"
                                        fill="var(--color-Backups)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Monthly Trends — line chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Monthly Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={monthlyConfig}
                                className="aspect-auto h-[300px] w-full"
                            >
                                <LineChart data={monthlyData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Users"
                                        stroke="var(--color-Users)"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Backups"
                                        stroke="var(--color-Backups)"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* User Roles — pie chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                User Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={roleConfig}
                                className="aspect-auto h-[300px] w-full"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent nameKey="name" />
                                        }
                                    />
                                    <Pie
                                        data={roleData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                    />
                                    <ChartLegend
                                        content={
                                            <ChartLegendContent nameKey="name" />
                                        }
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Resource Usage — area chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Resource Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={areaConfig}
                                className="aspect-auto h-[300px] w-full"
                            >
                                <AreaChart data={areaData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="var(--color-users)"
                                        fill="var(--color-users)"
                                        fillOpacity={0.2}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="backups"
                                        stroke="var(--color-backups)"
                                        fill="var(--color-backups)"
                                        fillOpacity={0.2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics — radial bar */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={radialConfig}
                                className="aspect-auto h-[300px] w-full"
                            >
                                <RadialBarChart
                                    innerRadius="30%"
                                    outerRadius="80%"
                                    data={radialData}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent nameKey="name" />
                                        }
                                    />
                                    <RadialBar dataKey="value" cornerRadius={10} />
                                    <ChartLegend
                                        content={
                                            <ChartLegendContent nameKey="name" />
                                        }
                                    />
                                </RadialBarChart>
                            </ChartContainer>
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
