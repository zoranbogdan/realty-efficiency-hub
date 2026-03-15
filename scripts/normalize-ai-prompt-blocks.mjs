import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'src/content/blog/cold-outreach-prompts-realtors.md',
  'src/content/blog/open-house-follow-up-prompts.md',
  'src/content/blog/open-house-marketing-prompts.md',
  'src/content/blog/property-tour-script-prompts.md',
  'src/content/blog/real-estate-buyer-qualification-prompts.md',
  'src/content/blog/real-estate-email-prompts.md',
  'src/content/blog/real-estate-follow-up-text-prompts.md',
  'src/content/blog/real-estate-listing-description-prompts.md',
  'src/content/blog/real-estate-marketing-prompts.md',
  'src/content/blog/social-media-prompts-realtors.md',
];

const ORDER = ['ROLE', 'CONTEXT', 'TASK', 'PSYCHOLOGICAL TRIGGERS', 'CONSTRAINTS'];

const defaults = {
  ROLE: 'Act as a super-specialized AI prompt engineer with deep real estate expertise.',
  CONTEXT: [
    '- Audience: Real estate agents and teams.',
    '- Use case: [Insert specific scenario for this prompt].',
    '- Inputs: [Insert property, lead, market, or campaign details].',
  ].join('\n'),
  TASK: 'Use the prompt content below and generate a practical, high-quality output for the specified scenario.',
  'PSYCHOLOGICAL TRIGGERS': [
    '- Clarity: prioritize direct, useful, and actionable output.',
    '- Relevance: align the message with the recipient\'s real estate context.',
    '- Trust: use specific details and a confident professional tone.',
  ].join('\n'),
  CONSTRAINTS: [
    '- Keep output practical, accurate, and easy to use.',
    '- Avoid fluff, hype, or unverifiable claims.',
    '- Use placeholders in [brackets] for missing variables.',
  ].join('\n'),
};

function normalizeSectionName(name) {
  const n = name.trim().toUpperCase();
  if (n === 'PSICHOLOGICAL TRIGGERS') return 'PSYCHOLOGICAL TRIGGERS';
  return n;
}

function parseSections(block) {
  const lines = block.split('\n');
  const indices = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^#\s*(.+?)\s*$/);
    if (!m) continue;
    const k = normalizeSectionName(m[1]);
    if (ORDER.includes(k)) indices.push({ i, k });
  }

  if (indices.length === 0) return null;

  const sections = {};
  for (let j = 0; j < indices.length; j += 1) {
    const cur = indices[j];
    const end = j + 1 < indices.length ? indices[j + 1].i : lines.length;
    const content = lines.slice(cur.i + 1, end).join('\n').trim();
    sections[cur.k] = content;
  }
  return sections;
}

function rebuildBlock(originalBlock) {
  const trimmed = originalBlock.trim();
  const parsed = parseSections(trimmed);

  const sections = {};

  if (parsed) {
    for (const key of ORDER) {
      sections[key] = parsed[key] && parsed[key].trim() ? parsed[key].trim() : defaults[key];
    }
  } else {
    sections.ROLE = defaults.ROLE;
    sections.CONTEXT = defaults.CONTEXT;
    sections.TASK = trimmed;
    sections['PSYCHOLOGICAL TRIGGERS'] = defaults['PSYCHOLOGICAL TRIGGERS'];
    sections.CONSTRAINTS = defaults.CONSTRAINTS;
  }

  return ORDER.map((k) => `# ${k}\n${sections[k]}`).join('\n\n');
}

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  let count = 0;
  const updated = original.replace(/~~~text\n([\s\S]*?)\n~~~/g, (_, block) => {
    count += 1;
    const rebuilt = rebuildBlock(block);
    return `~~~text\n${rebuilt}\n~~~`;
  });

  if (updated !== original) {
    writeFileSync(file, updated, 'utf8');
  }

  console.log(`${file}: normalized ${count} prompt blocks`);
}
