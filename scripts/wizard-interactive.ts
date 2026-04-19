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

async function main() {
  const root = process.cwd();

  // Minimal REPL so AI agents and humans can drive the wizard using the same commands.
  // Exit with Ctrl+C.
  while (true) {
    const input = (await promptLine("> ")).trim();
    if (!input) {
      continue;
    }
    const response = await handleRepositoryInput(root, input);
    process.stdout.write(`${response.reply}\n\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
