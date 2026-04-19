import { promises as fs } from "fs";
import os from "os";
import path from "path";

export async function createTempRepoDir(prefix: string) {
  return fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
}
