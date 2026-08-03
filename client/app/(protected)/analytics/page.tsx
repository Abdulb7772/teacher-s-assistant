"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CompletionCircle from "@/components/ui/CompletionCircle";
import EmptyState from "@/components/ui/EmptyState";
import GradeBadge from "@/components/ui/GradeBadge";
import PageHeader from "@/components/ui/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import Skeleton, { SkeletonCards } from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { shortMonth } from "@/lib/formatters";
import * as analyticsService from "@/services/analyticsService";

const TOOLTIP_STYLE = {
  background: "#102C57",
  border: "1px solid rgba(212,175,55,0.3)",
  borderRadius: 12,
  color: "#E5E7EB",
};

const AXIS_TICK = { fill: "rgba(255,255,255,0.45)", fontSize: 11 };

function CardTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
        <Icon size={17} />
      </span>
      <h3 className="font-display font-semibold text-white">{children}</h3>
    </div>
  );
}

const gradeColor = (grade: string): string =>
  /^A/.test(grade) ? "#22C55E" : /^[BC]/.test(grade) ? "#D4AF37" : "#EF4444";

export default function AnalyticsPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsService.getAnalytics,
    // Same key + options as dashboard: one shared cache, instant cross-page nav.
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
  const analytics = data?.data;

  const header = (
    <PageHeader
      title="Analytics"
      subtitle="Performance insights across your course"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Analytics" }]}
    />
  );

  if (isPending) {
    return (
      <>
        {header}
        <SkeletonCards count={4} />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <Skeleton className="mb-5 h-6 w-44" />
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (isError || !analytics) {
    return (
      <>
        {header}
        <Alert variant="error" className="mb-6">
          Failed to load analytics data.
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-3">
            Retry
          </Button>
        </Alert>
      </>
    );
  }

  const stats = [
    { icon: BookOpen, label: "Total Courses", value: analytics.totalCourses, accent: "gold" },
    { icon: Users, label: "Students", value: analytics.totalStudents, accent: "gold" },
    { icon: ClipboardList, label: "Quizzes", value: analytics.totalQuizzes, accent: "blue" },
    { icon: TrendingUp, label: "Completion", value: `${analytics.completionPercent}%`, accent: "blue" },
  ] as const;

  const topicData = [
    { name: "Completed", value: analytics.completedTopics, color: "#D4AF37" },
    { name: "Pending", value: analytics.pendingTopics, color: "rgba(255,255,255,0.15)" },
  ];

  const trendData = analytics.studentPerformance.map((s) => ({
    name: s.name.split(" ")[0],
    score: s.percentage,
  }));

  return (
    <>
      {header}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} delay={i * 0.05} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardTitle icon={PieChartIcon}>Topic Status</CardTitle>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={topicData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={4}
                stroke="none"
              >
                <Cell fill="#D4AF37" />
                <Cell fill="rgba(255,255,255,0.15)" />
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-center gap-6">
            {topicData.map((t) => (
              <div key={t.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                <span className="text-white/60">{t.name}</span>
                <span className="font-semibold text-white">{t.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle icon={BarChart3}>Monthly Progress</CardTitle>
          {analytics.monthlyProgress.length === 0 ? (
            <EmptyState icon={BarChart3} title="No data yet" description="Monthly progress will appear here." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.monthlyProgress} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={(m: string) => shortMonth(m)}
                  stroke="rgba(255,255,255,0.35)"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="rgba(255,255,255,0.35)"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="completed" name="Completed" fill="#D4AF37" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardTitle icon={BarChart3}>Grade Distribution</CardTitle>
          {analytics.gradeDistribution.length === 0 ? (
            <EmptyState icon={BarChart3} title="No grades yet" description="Grade distribution will appear once quizzes are recorded." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.gradeDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="grade"
                  stroke="rgba(255,255,255,0.35)"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="rgba(255,255,255,0.35)"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {analytics.gradeDistribution.map((g, i) => (
                    <Cell key={i} fill={gradeColor(g.grade)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardTitle icon={Users}>Student Performance</CardTitle>
          {analytics.studentPerformance.length === 0 ? (
            <EmptyState icon={Users} title="No students yet" description="Add students to see their performance." />
          ) : (
            <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
              {analytics.studentPerformance.slice(0, 10).map((s, i) => (
                <div key={s._id} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.04]">
                  <span className="w-5 text-center font-display text-sm font-bold text-gold/70">{i + 1}</span>
                  <Avatar name={s.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium text-white">{s.name}</p>
                      </div>
                      <ProgressBar value={s.percentage} color="gold" className="mt-1.5 h-1.5" />
                    </div>
                  <span className="text-sm font-semibold text-gold">{s.percentage}%</span>
                  <GradeBadge grade={s.grade} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle icon={LineChartIcon}>Quiz Average Trend</CardTitle>
          {trendData.length === 0 ? (
            <EmptyState icon={LineChartIcon} title="No trend yet" description="Student scores will be plotted here." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.35)"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="rgba(255,255,255,0.35)"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="#F6C453"
                  strokeWidth={2.5}
                  dot={{ fill: "#D4AF37", r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardTitle icon={Target}>Completion Overview</CardTitle>
          <div className="flex flex-col items-center">
            <CompletionCircle value={analytics.completionPercent} size={160} label="Overall" sublabel="Completed" />
            <div className="mt-5 w-full space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-white/50">Completed topics</span>
                  <span className="font-semibold text-green-400">{analytics.completedTopics}</span>
                </div>
                <ProgressBar value={analytics.completionPercent} color="green" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-white/50">Pending topics</span>
                  <span className="font-semibold text-red-400">{analytics.pendingTopics}</span>
                </div>
                <ProgressBar value={100 - analytics.completionPercent} color="red" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
