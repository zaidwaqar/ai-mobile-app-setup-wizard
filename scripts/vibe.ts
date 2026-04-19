import readline from "node:readline";
import { handleRepositoryInput } from "../src/persistence/repository-storage";

function promptLine(promptText: string) {
  return new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function buildPhaseMessage() {
  return [
    "Build phase unlocked.",
    "",
    "Next action for your AI tool:",
    'Implement the app described in `project/build-brief.md` inside this repo.',
    "",
    "Rules:",
    "- Keep using `project/` files as the source of truth.",
    "- If you switch tools/models, resume from /continue (do not restart).",
  ].join("\n");
}

async function main() {
  const root = process.cwd();

  process.stdout.write(
    [
      "Vibe mode is running.",
      "Type /start to begin, answer one question at a time, and type /build when ready.",
      "",
    ].join("\n"),
  );

  while (true) {
    const input = (await promptLine("> ")).trim();
    if (!input) {
      continue;
    }

    const response = await handleRepositoryInput(root, input);
    process.stdout.write(`${response.reply}\n\n`);

    if (response.snapshot.state.buildBriefReady) {
      process.stdout.write(`${buildPhaseMessage()}\n`);
      return;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
