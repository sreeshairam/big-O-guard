import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Activity, Clock, BarChart3, Code2, Menu } from "lucide-react";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });

  // Ensure dark mode class is on document
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const navItems = [
    { href: "/", label: "Analyzer", icon: Code2 },
    { href: "/history", label: "History", icon: Clock },
    { href: "/stats", label: "Stats", icon: BarChart3 },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full border-r border-border bg-sidebar">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground font-sans">
          BIG-O<span className="text-primary">GUARD</span>
        </span>
      </div>

      <div className="flex-1 px-4 py-2 flex flex-col gap-2">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 px-2">Navigation</div>
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md font-mono text-sm transition-all cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-[inset_0_0_10px_rgba(0,255,255,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-2 px-2 py-2 rounded bg-secondary/50 border border-border">
          <div className={cn("w-2 h-2 rounded-full", health ? "bg-accent shadow-[0_0_8px_rgba(0,255,100,0.8)]" : "bg-destructive shadow-[0_0_8px_rgba(255,0,0,0.8)]")} />
          <span className="text-xs font-mono text-muted-foreground">
            {health ? "System Online" : "System Offline"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground selection:bg-primary/30">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar z-20">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">BIG-O GUARD</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] bg-background z-10">
          <Sidebar />
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}