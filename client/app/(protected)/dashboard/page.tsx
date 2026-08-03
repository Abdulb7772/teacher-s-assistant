"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  History,
  Percent,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CompletionCircle from "@/components/ui/CompletionCircle";
import EmptyState from "@/components/ui/EmptyState";
import GradeBadge from "@/components/ui/GradeBadge";
import PageHeader from "@/components/ui/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import Skeleton, { SkeletonCards } from "@/components/ui/Skeleton";
import StatCard from "@/components/ui/StatCard";
import { formatDateTime, shortMonth } from "@/lib/formatters";
import * as analyticsService from "@/services/analyticsService";

const TOOLTIP_STYLE = {
  background: "#102C57",
  border: "1px solid rgba(212,175,55,0.3)",
  borderRadius: 12,
  color: "#E5E7EB",
};

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

function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <Skeleton className="mb-5 h-5 w-40" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="mt-3 h-4 w-3/4" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsService.getAnalytics,
    // Analytics is only recomputed by backend on write; 5-min staleness keeps
    // dashboard <-> analytics navigation instant (cache hit, no refetch).
    staleTime: 5 * 60 * 1000,
    // Show previously cached analytics immediately while a background refetch runs.
    placeholderData: (prev) => prev,
  });
  const analytics = data?.data;

  const header = (
    <PageHeader
      title="Dashboard"
      subtitle="Welcome back — here's your semester overview"
      breadcrumbs={[{ label: "Dashboard" }]}
    />
  );

  if (isPending) {
    return (
      <>
        {header}
        <SkeletonCards count={8} />
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <ChartSkeleton className="h-72" />
            <ChartSkeleton className="h-80" />
            <ChartSkeleton className="h-72" />
          </div>
          <div className="space-y-6">
            <ChartSkeleton className="h-80" />
            <ChartSkeleton className="h-64" />
            <ChartSkeleton className="h-72" />
          </div>
        </div>
      </>
    );
  }

  if (isError || !analytics) {
    return (
      <>
        {header}
        <Alert variant="error" className="mb-6">
          Failed to load dashboard data.
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-3">
            Retry
          </Button>
        </Alert>
      </>
    );
  }

  const stats = [
    { icon: BookOpen, label: "Total Courses", value: analytics.totalCourses, accent: "gold" },
    { icon: CheckCircle2, label: "Completed Topics", value: analytics.completedTopics, accent: "green" },
    { icon: Clock, label: "Pending Topics", value: analytics.pendingTopics, accent: "red" },
    { icon: TrendingUp, label: "Completion", value: `${analytics.completionPercent}%`, accent: "blue" },
    { icon: Users, label: "Students", value: analytics.totalStudents, accent: "gold" },
    { icon: ClipboardList, label: "Quizzes", value: analytics.totalQuizzes, accent: "blue" },
    { icon: Award, label: "Average Marks", value: analytics.averageMarks, accent: "gold" },
    { icon: Percent, label: "Avg Percentage", value: `${analytics.averagePercent}%`, accent: "green" },
  ] as const;

  return (
    <>
      {header}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} delay={i * 0.05} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardTitle icon={Target}>Course Completion</CardTitle>
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
              <CompletionCircle value={analytics.completionPercent} size={160} label="Completion" sublabel="Topics" />
              <div className="w-full max-w-[220px] space-y-4">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-white/50">Completed</span>
                    <span className="font-semibold text-green-400">{analytics.completedTopics}</span>
                  </div>
                  <ProgressBar value={analytics.completionPercent} color="green" />
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-white/50">Pending</span>
                    <span className="font-semibold text-red-400">{analytics.pendingTopics}</span>
                  </div>
                  <ProgressBar value={100 - analytics.completionPercent} color="red" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle icon={BarChart3}>Monthly Progress</CardTitle>
            {analytics.monthlyProgress.length === 0 ? (
              <EmptyState icon={BarChart3} title="No progress yet" description="Topic completion will appear here by month." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.monthlyProgress} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(m: string) => shortMonth(m)}
                    stroke="rgba(255,255,255,0.35)"
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="rgba(255,255,255,0.35)"
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
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
            <CardTitle icon={Activity}>Recent Activities</CardTitle>
            {analytics.recentActivities.length === 0 ? (
              <EmptyState icon={Activity} title="No activity yet" description="Completed topics, quizzes and students will show up here." />
            ) : (
              <div>
                {analytics.recentActivities.map((a, i) => (
                  <div key={i} className="relative flex gap-3">
                    {i < analytics.recentActivities.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-px bg-white/10" />
                    )}
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        a.type === "topic_completed" ? "bg-green-400" : a.type === "quiz_added" ? "bg-gold" : "bg-blue-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1 pb-5 last:pb-0">
                      <p className="text-sm font-medium text-white">{a.title}</p>
                      <p className="mt-0.5 text-xs text-white/45">{a.meta}</p>
                      <p className="mt-1 text-[11px] text-gold/60">{formatDateTime(a.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle icon={CalendarClock}>Upcoming Topics</CardTitle>
            {analytics.upcomingTopics.length === 0 ? (
              <EmptyState icon={CalendarClock} title="All caught up" description="No pending topics right now." />
            ) : (
              <div className="space-y-2.5">
                {analytics.upcomingTopics.slice(0, 6).map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3 transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 font-display text-sm font-bold text-gold">
                      {c.lectureNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{c.title}</p>
                      <p className="mt-0.5 text-xs text-white/45">
                        {c.month} · Week {c.week}
                      </p>
                    </div>
                    <Badge variant="neutral">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardTitle icon={History}>Recent Updates</CardTitle>
            {analytics.recentUpdates.length === 0 ? (
              <EmptyState icon={History} title="Nothing updated yet" description="Course and student changes will appear here." />
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {analytics.recentUpdates.map((u) => (
                  <div key={u.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        u.kind === "course" ? "bg-gold/10 text-gold" : "bg-blue-500/10 text-blue-300"
                      }`}
                    >
                      {u.kind === "course" ? <BookOpen size={15} /> : <User size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{u.title}</p>
                      <p className="mt-0.5 truncate text-xs text-white/45">{u.meta}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-gold/60">{formatDateTime(u.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardTitle icon={Trophy}>Top Students</CardTitle>
            {analytics.studentPerformance.length === 0 ? (
              <EmptyState icon={Users} title="No students yet" description="Top performers will appear here once students are added." />
            ) : (
              <div className="space-y-3">
                {analytics.studentPerformance.slice(0, 5).map((s, i) => (
                  <div key={s._id} className="flex items-center gap-3">
                    <span className="w-5 text-center font-display text-sm font-bold text-gold/70">{i + 1}</span>
                    <Avatar name={s.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{s.name}</p>
                      <ProgressBar value={s.percentage} color="gold" className="mt-1.5 h-1.5" />
                    </div>
                    <span className="text-sm font-semibold text-gold">{s.percentage}%</span>
                    <GradeBadge grade={s.grade} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
