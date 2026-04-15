import { Router, type IRouter } from "express";
import { desc, sql, eq } from "drizzle-orm";
import { db, analysesTable } from "@workspace/db";
import { AnalyzeCodeBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { code, language = "python" } = parsed.data;

  const systemPrompt = `You are an expert algorithm analyst. Analyze the provided code and determine its Big-O time and space complexity.

Respond ONLY with valid JSON (no markdown, no code blocks) in this exact format:
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "explanation": "A clear explanation of why the complexities are what they are, referencing specific parts of the code.",
  "suggestions": ["Suggestion 1 for improvement", "Suggestion 2 if applicable"]
}

Rules:
- Use standard Big-O notation: O(1), O(log n), O(n), O(n log n), O(n^2), O(n^3), O(2^n), O(n!), etc.
- Be precise and educational in your explanation
- Provide 1-3 actionable optimization suggestions (empty array if code is already optimal)
- Consider the worst-case complexity`;

  const userMessage = `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  let timeComplexity = "O(n)";
  let spaceComplexity = "O(1)";
  let explanation = "Analysis could not be completed.";
  let suggestions: string[] = [];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      timeComplexity = parsed.timeComplexity ?? timeComplexity;
      spaceComplexity = parsed.spaceComplexity ?? spaceComplexity;
      explanation = parsed.explanation ?? explanation;
      suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    } else {
      explanation = content;
    }
  } catch (err) {
    req.log.error({ err }, "OpenAI analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
    return;
  }

  const [record] = await db
    .insert(analysesTable)
    .values({
      code,
      language,
      timeComplexity,
      spaceComplexity,
      explanation,
      suggestions,
    })
    .returning();

  res.json({
    id: record.id,
    timeComplexity: record.timeComplexity,
    spaceComplexity: record.spaceComplexity,
    explanation: record.explanation,
    suggestions: record.suggestions,
    language: record.language,
    code: record.code,
    createdAt: record.createdAt.toISOString(),
  });
});

router.get("/history", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.createdAt))
    .limit(50);

  res.json(
    rows.map((r) => ({
      id: r.id,
      timeComplexity: r.timeComplexity,
      spaceComplexity: r.spaceComplexity,
      explanation: r.explanation,
      language: r.language,
      codeSnippet: r.code.slice(0, 120),
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.get("/stats", async (req, res): Promise<void> => {
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analysesTable);
  const totalAnalyses = totalResult[0]?.count ?? 0;

  const timeBreakdown = await db
    .select({
      complexity: analysesTable.timeComplexity,
      count: sql<number>`count(*)::int`,
    })
    .from(analysesTable)
    .groupBy(analysesTable.timeComplexity)
    .orderBy(desc(sql`count(*)`));

  const spaceBreakdown = await db
    .select({
      complexity: analysesTable.spaceComplexity,
      count: sql<number>`count(*)::int`,
    })
    .from(analysesTable)
    .groupBy(analysesTable.spaceComplexity)
    .orderBy(desc(sql`count(*)`));

  const langBreakdown = await db
    .select({
      language: analysesTable.language,
      count: sql<number>`count(*)::int`,
    })
    .from(analysesTable)
    .groupBy(analysesTable.language)
    .orderBy(desc(sql`count(*)`));

  res.json({
    totalAnalyses,
    timeComplexityBreakdown: timeBreakdown.map((r) => ({
      complexity: r.complexity,
      count: r.count,
    })),
    spaceComplexityBreakdown: spaceBreakdown.map((r) => ({
      complexity: r.complexity,
      count: r.count,
    })),
    languageBreakdown: langBreakdown.map((r) => ({
      language: r.language,
      count: r.count,
    })),
  });
});

export default router;
