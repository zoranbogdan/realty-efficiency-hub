export const contentTypes = [
  "prompt-guide",
  "workflow-guide",
  "system-guide",
  "comparison-article",
  "guide",
  "tool-review",
] as const;

export type ContentType = (typeof contentTypes)[number];

export const contentTypeMeta: Record<
  ContentType,
  { label: string; short: string; bestFor: string }
> = {
  "prompt-guide": {
    label: "Prompt Guide",
    short: "Prompt",
    bestFor: "Copy/paste prompts you can use immediately",
  },
  "workflow-guide": {
    label: "Workflow Guide",
    short: "Workflow",
    bestFor: "Step-by-step implementation and operations",
  },
  "system-guide": {
    label: "System Guide",
    short: "System",
    bestFor: "Architecture and full-system design",
  },
  "comparison-article": {
    label: "Comparison Article",
    short: "Comparison",
    bestFor: "Choosing between approaches or tools",
  },
  guide: {
    label: "Guide",
    short: "Guide",
    bestFor: "General educational deep-dives",
  },
  "tool-review": {
    label: "Tool Review",
    short: "Review",
    bestFor: "Detailed tool evaluation and fit",
  },
};
