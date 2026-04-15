import React from "react";
import { format } from "date-fns";
import { useGetHistory, getGetHistoryQueryKey } from "@workspace/api-client-react";
import { Clock, Code2, Search, History as HistoryIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ComplexityBadge } from "@/components/complexity-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const { data: history, isLoading, error } = useGetHistory({
    query: { queryKey: getGetHistoryQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-sans flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-primary" />
          Analysis History
        </h1>
        <p className="text-muted-foreground font-mono text-sm">Review past code evaluations and complexity metrics.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-card/50">
              <CardContent className="p-4 flex gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 text-center text-destructive">
            <p>Failed to load history.</p>
          </CardContent>
        </Card>
      ) : !history || history.length === 0 ? (
        <Card className="border-dashed bg-secondary/20">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-mono text-sm">No analysis history found.</p>
            <p className="text-xs mt-2 opacity-60">Run some code in the analyzer to see it here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="overflow-hidden border-border/60 hover:border-primary/30 transition-colors group">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                {/* Info side */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-secondary text-xs font-mono uppercase tracking-wider text-muted-foreground border border-border">
                        {item.language}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        <Clock className="w-3 h-3" />
                        {format(new Date(item.createdAt), "MMM d, HH:mm")}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <ComplexityBadge complexity={item.timeComplexity} type="time" />
                      <ComplexityBadge complexity={item.spaceComplexity} type="space" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
                
                {/* Code snippet side */}
                <div className="w-full sm:w-[300px] bg-[#0a0a0c] border-t sm:border-t-0 sm:border-l border-border p-4 relative group-hover:bg-[#0d0d12] transition-colors">
                  <Code2 className="absolute top-3 right-3 w-4 h-4 text-muted-foreground/30" />
                  <pre className="text-xs font-mono text-muted-foreground/80 overflow-hidden whitespace-pre-wrap line-clamp-4">
                    {item.codeSnippet}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}