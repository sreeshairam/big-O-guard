import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Code2, Zap, AlertTriangle, FileCode2, ChevronRight } from "lucide-react";
import { useAnalyzeCode, getGetHistoryQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import type { AnalysisResult } from "@workspace/api-client-react/src/generated/api.schemas";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ComplexityBadge } from "@/components/complexity-badge";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_CODE = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
`;

export default function Analyzer() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const analyzeMutation = useAnalyzeCode();

  const handleAnalyze = () => {
    if (!code.trim()) {
      toast({
        title: "Code required",
        description: "Please enter some code to analyze.",
        variant: "destructive"
      });
      return;
    }

    analyzeMutation.mutate(
      { data: { code, language } },
      {
        onSuccess: (data) => {
          setResult(data);
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: getGetHistoryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          
          toast({
            title: "Analysis complete",
            description: "Complexity metrics extracted successfully.",
          });
        },
        onError: (err: any) => {
          toast({
            title: "Analysis failed",
            description: err?.error || "Could not analyze the provided code.",
            variant: "destructive"
          });
        }
      }
    );
  };

  // Line numbers generation
  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: Math.max(15, lineCount) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      {/* Left side: Editor */}
      <div className="flex-1 flex flex-col min-h-[500px] border border-border rounded-lg bg-card overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-3 border-b border-border bg-sidebar/50">
          <div className="flex items-center gap-3">
            <FileCode2 className="w-4 h-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-8 bg-background border-border font-mono text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            size="sm" 
            onClick={handleAnalyze} 
            disabled={analyzeMutation.isPending}
            className="font-mono shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all"
          >
            {analyzeMutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                ANALYZING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-3 h-3" />
                RUN_ANALYSIS
              </span>
            )}
          </Button>
        </div>
        
        <div className="flex-1 flex relative bg-[#0a0a0c]">
          {/* Line numbers */}
          <div className="w-12 shrink-0 border-r border-border/50 bg-secondary/20 flex flex-col text-right pr-3 py-4 font-mono text-sm text-muted-foreground/50 select-none overflow-hidden">
            {lines.map(line => (
              <div key={line} className="h-[24px] leading-[24px]">{line}</div>
            ))}
          </div>
          
          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm bg-transparent text-foreground resize-none focus:outline-none whitespace-pre leading-[24px]"
            spellCheck={false}
            placeholder="Paste your code here..."
          />
        </div>
      </div>

      {/* Right side: Results */}
      <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-4">
        <h2 className="text-xl font-bold font-sans flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Analysis Output
        </h2>

        {analyzeMutation.isPending ? (
          <div className="space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20 bg-primary/20" />
                  <Skeleton className="h-6 w-16 bg-primary/20" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20 bg-primary/20" />
                  <Skeleton className="h-6 w-16 bg-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Skeleton className="h-32 w-full bg-secondary" />
            <Skeleton className="h-24 w-full bg-secondary" />
          </div>
        ) : !result ? (
          <Card className="bg-secondary/30 border-dashed">
            <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center text-muted-foreground h-64">
              <Code2 className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-mono text-sm">Waiting for input.</p>
              <p className="text-xs mt-2 opacity-60">Run analysis to see Big-O metrics here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Complexity Badges Card */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">Time Complexity</span>
                  <ComplexityBadge complexity={result.timeComplexity} type="time" className="scale-110" />
                </div>
                <div className="h-px w-full bg-border/50" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">Space Complexity</span>
                  <ComplexityBadge complexity={result.spaceComplexity} type="space" className="scale-110" />
                </div>
              </CardContent>
            </Card>

            {/* Explanation Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {result.explanation}
                </p>
              </CardContent>
            </Card>

            {/* Suggestions Card */}
            {result.suggestions && result.suggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    Optimizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 text-foreground/80">
                        <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}