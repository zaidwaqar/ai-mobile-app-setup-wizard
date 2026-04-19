import { promises as fs } from "fs";
import path from "path";
import { handleRepositoryInput, resetRepositoryWorkspace } from "../src/persistence/repository-storage";
import { createTempRepoDir } from "./helpers/temp-repo";

describe("persistence tests", () => {
  it("saves answers immediately and updates checklist and state", async () => {
    const root = await createTempRepoDir("mobile-persistence");
    await resetRepositoryWorkspace(root);

    await handleRepositoryInput(root, "/start");
    await handleRepositoryInput(root, "Pocket Planner");

    const state = await fs.readFile(path.join(root, "project/session/state.json"), "utf8");
    const checklist = await fs.readFile(path.join(root, "project/session/checklist.md"), "utf8");
    const productIdea = await fs.readFile(path.join(root, "project/product-idea.md"), "utf8");

    expect(state).toMatch(/Pocket Planner/);
    expect(checklist).toMatch(/App name/);
    expect(productIdea).toMatch(/Pocket Planner/);
  });

  it("keeps progress through interruption and /continue resumes safely", async () => {
    const root = await createTempRepoDir("mobile-resume");
    await resetRepositoryWorkspace(root);

    await handleRepositoryInput(root, "/start");
    await handleRepositoryInput(root, "Clinic Flow");
    await handleRepositoryInput(root, "A clinic coordination app.");
    const interruption = await handleRepositoryInput(root, "How would monetization work?");
    const resumed = await handleRepositoryInput(root, "/continue");

    expect(interruption.reply).toMatch(/kept your place/i);
    expect(resumed.reply).toMatch(/Who is this app mainly for/i);
  });
});
