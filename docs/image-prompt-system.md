# Image Prompt System (Infographic-First)

This system standardizes post images as modern SaaS-style infographics so the site stays visually consistent.

## Master Prompt Template

Use this prompt for every image and only replace variable blocks from the manifest.

```text
Create a clean, editorial SaaS infographic for a real estate AI/automation website.

Global style (must stay consistent):
- White background with light blue/indigo accents
- Minimal flat vector icons
- Rounded cards, subtle shadows, thin connector arrows
- Clear visual hierarchy, generous whitespace
- Professional startup blog style
- No photos, no people, no buildings, no logos
- 16:9 ratio at 1600x900
- No watermark or tiny unreadable text

Content block:
- Pillar: {{PILLAR_NAME}}
- Content type: {{CONTENT_TYPE}}
- Title cue: {{SHORT_TITLE}}
- Subtext cue: {{ONE_LINE_SUMMARY}}

Diagram block:
- Diagram type: {{DIAGRAM_TYPE}}
- Left panel: {{LEFT_PANEL}}
- Right panel: {{RIGHT_PANEL}}
- Flow steps: {{FLOW_STEPS}}
- Visual motif: {{MOTIF}}

Composition rules:
- Main centered content panel with comfortable margins
- Strong top accent rail
- Clearly separated nodes/cards
- Connector arrows readable at mobile width
- Keep contrast accessible

Output rules:
- Clean flat infographic
- Export as WEBP, high quality
```

## Variable Definitions

- `PILLAR_NAME`: `AI Prompts` | `Automation Workflows`
- `CONTENT_TYPE`: `Prompt Guide` | `Workflow Guide` | `Comparison Article`
- `SHORT_TITLE`: short cue (3-8 words)
- `ONE_LINE_SUMMARY`: 80-140 chars
- `DIAGRAM_TYPE`: `3-step flow` | `5-step workflow` | `side-by-side comparison` | `input-output pipeline`
- `LEFT_PANEL`: what appears on left card/group
- `RIGHT_PANEL`: what appears on right card/group
- `FLOW_STEPS`: ordered steps, separated by ` -> `
- `MOTIF`: stylistic concept (cards, matrix, KPI nodes, etc.)

## Manifest Usage

Source of truth: `docs/post-image-manifest.json`

Each image entry should include:

- `short_title`
- `summary`
- `motif`
- `diagram_type`
- `flow_steps` (array)
- optional `left_panel`, `right_panel`

## Naming Convention

- Cover: `public/images/posts/<slug>-cover.webp`
- Optional section image: `public/images/posts/<slug>-section-1.webp`

## Placement Rules

- Normal posts: 1 image (cover)
- Longer workflow/comparison posts: up to 2 images

## Performance Rules

- Keep each image near or below 120KB when possible
- Use explicit dimensions in markup or responsive CSS constraints
- First image can be eager; later images should be lazy
- Keep alt text descriptive and page-specific

## Commands

- Generate all placeholders: `npm run generate:post-images`
- Generate missing only: `npm run generate:post-images -- --missing-only`
- Generate one post: `npm run generate:post-images -- --slug=<slug>`

## Recommended Human Workflow

1. Generate placeholder from manifest.
2. Use manifest fields with the master prompt in your image model.
3. Replace the placeholder file using the same filename.
4. Keep filenames unchanged so post embeds and SEO metadata remain valid.
