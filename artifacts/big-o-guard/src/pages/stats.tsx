import React from "react";
import { useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { BarChart3, TrendingUp, Layers, Code2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Using the CSS variables we defined
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Stats() {
  const { data: stats, isLoading, error } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-sans flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          System Stats
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Skeleton className="h-[300px] bg-card" />
          <Skeleton className="h-[300px] bg-card" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-sans">System Stats</h1>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 text-center text-destructive">
            <p>Failed to load statistics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-sans flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          System Stats
        </h1>
        <p className="text-muted-foreground font-mono text-sm">Aggregated complexity distribution across all analyses.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Total Runs
              </span>
              <span className="text-4xl font-bold text-foreground mt-2">
                {stats.totalAnalyses}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-bl-full" />
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Languages
              </span>
              <span className="text-4xl font-bold text-foreground mt-2">
                {stats.languageBreakdown.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full" />
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Dominant Time O(n)
              </span>
              <span className="text-xl font-bold text-foreground mt-2 truncate">
                {stats.timeComplexityBreakdown.length > 0 
                  ? [...stats.timeComplexityBreakdown].sort((a,b) => b.count - a.count)[0]?.complexity 
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Time Complexity Chart */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50 bg-secondary/10 pb-4">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Time Complexity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {stats.timeComplexityBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.timeComplexityBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="complexity" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-sm">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Space Complexity Chart */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50 bg-secondary/10 pb-4">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Space Complexity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {stats.spaceComplexityBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.spaceComplexityBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="complexity" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-sm">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Language Breakdown */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="border-b border-border/50 bg-secondary/10 pb-4">
            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Language Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            {stats.languageBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.languageBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="language"
                  >
                    {stats.languageBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-sm">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}