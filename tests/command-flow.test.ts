import { handleRepositoryInput, resetRepositoryWorkspace } from "../src/persistence/repository-storage";
import { createTempRepoDir } from "./helpers/temp-repo";

describe("command flow tests", () => {
  it("/start begins the wizard from the first missing step", async () => {
    const root = await createTempRepoDir("mobile-command-start");
    await resetRepositoryWorkspace(root);

    const response = await handleRepositoryInput(root, "/start");

    expect(response.reply).toMatch(/What should this mobile app be called/i);
  });

  it("/continue resumes the next incomplete step", async () => {
    const root = await createTempRepoDir("mobile-command-continue");
    await resetRepositoryWorkspace(root);

    await handleRepositoryInput(root, "/start");
    await handleRepositoryInput(root, "Pocket Planner");

    const response = await handleRepositoryInput(root, "/continue");

    expect(response.reply).toMatch(/what should the app do/i);
  });

  it("/ui switches into UI mode", async () => {
    const root = await createTempRepoDir("mobile-command-ui");
    await resetRepositoryWorkspace(root);

    const response = await handleRepositoryInput(root, "/ui");
    expect(response.reply).toMatch(/light, dark, or mixed|design style/i);
  });

  it("/review returns a summary", async () => {
    const root = await createTempRepoDir("mobile-command-review");
    await resetRepositoryWorkspace(root);

    const response = await handleRepositoryInput(root, "/review");

    expect(response.reply).toMatch(/Mobile wizard review/i);
  });
});
