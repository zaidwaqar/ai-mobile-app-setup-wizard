import {
  handleRepositoryInput,
  loadRepositoryState,
  saveRepositoryState,
} from "../src/persistence/repository-storage";

function print(text: string) {
  process.stdout.write(`${text}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const root = process.cwd();

  if (args.includes("--help") || args.includes("-h")) {
    print("Usage:");
    print('  npm run wizard -- "/start"');
    print('  npm run wizard -- "my answer"');
    print("  npm run wizard -- --status");
    print("");
    print("This writes durable state to project/session/state.json and updates project/*.md files.");
    process.exit(0);
  }

  if (args.includes("--status")) {
    const state = await loadRepositoryState(root);
    await saveRepositoryState(root, state);
    print(`Completed steps: ${state.completedStepIds.length}`);
    print(`Awaiting step: ${state.awaitingStepId ?? "none"}`);
    process.exit(0);
  }

  const input = args.join(" ").trim();
  if (!input) {
    print("Missing input. Example: npm run wizard -- /start");
    process.exit(1);
  }

  const response = await handleRepositoryInput(root, input);
  print(response.reply);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
