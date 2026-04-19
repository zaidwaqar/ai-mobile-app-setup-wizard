import { promises as fs } from "fs";
import path from "path";
import { renderRepositoryFiles } from "../core/documents";
import { createDefaultState, handleWizardInput, hydrateState } from "../core/engine";
import { WizardResponse, WizardState } from "../core/types";

function instructionContent() {
  return `# AI Mobile App Setup Wizard Instructions

This repository is a reusable Expo-based mobile app setup wizard for AI agents and human operators.

## Main goal

Guide a beginner through describing a mobile app idea one question at a time, then choose the simplest correct architecture:

- local-only
- local-first with optional sync
- full cloud backend

## Commands

- \`/start\`
- \`/continue\`
- \`/product\`
- \`/ui\`
- \`/features\`
- \`/integrations\`
- \`/credentials\`
- \`/review\`
- \`/build\`

## Key rules

1. Ask only one question at a time.
2. Keep questions non-technical and beginner-friendly.
3. Do not force a backend for simple offline utilities.
4. If cloud is not needed, explicitly keep the plan local-first.
5. Save every answer immediately.
6. Keep UI preferences separate from product and architecture details.
7. Never store real secrets in the repository.

## Source of truth files

- \`project/session/state.json\`
- \`project/session/checklist.md\`
- \`project/product-idea.md\`
- \`project/features.md\`
- \`project/ui.md\`
- \`project/integrations.md\`
- \`project/credentials-checklist.md\`
- \`project/build-brief.md\`
`;
}

async function ensureDir(target: string) {
  await fs.mkdir(target, { recursive: true });
}

async function write(filePath: string, content: string) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf8");
}

export async function saveRepositoryState(rootDir: string, state: WizardState) {
  const root = path.resolve(rootDir);
  const projectDir = path.join(root, "project");
  const sessionDir = path.join(projectDir, "session");

  await ensureDir(sessionDir);
  state.updatedAt = new Date().toISOString();

  await write(path.join(sessionDir, "state.json"), JSON.stringify(state, null, 2));

  const files = renderRepositoryFiles(state);
  await Promise.all(
    Object.entries(files).map(([relativePath, content]) =>
      write(path.join(root, relativePath), content || `# ${path.basename(relativePath)}`),
    ),
  );

  await Promise.all([
    write(path.join(root, "INSTRUCTION.md"), instructionContent()),
    write(path.join(root, "CLAUDE.md"), "# CLAUDE\n\nSee `INSTRUCTION.md`.\n"),
    write(path.join(root, "CODEX.md"), "# CODEX\n\nSee `INSTRUCTION.md`.\n"),
    write(path.join(root, "AGENTS.md"), "# AGENTS\n\nSee `INSTRUCTION.md`.\n"),
  ]);
}

export async function loadRepositoryState(rootDir: string) {
  const statePath = path.join(rootDir, "project", "session", "state.json");

  try {
    const raw = await fs.readFile(statePath, "utf8");
    return hydrateState(JSON.parse(raw) as Partial<WizardState>);
  } catch {
    return createDefaultState();
  }
}

export async function resetRepositoryWorkspace(rootDir: string) {
  const state = createDefaultState();
  await saveRepositoryState(rootDir, state);
  return state;
}

export async function handleRepositoryInput(rootDir: string, input: string): Promise<WizardResponse> {
  const state = await loadRepositoryState(rootDir);
  const response = handleWizardInput(state, input);
  await saveRepositoryState(rootDir, response.snapshot.state);
  return response;
}
