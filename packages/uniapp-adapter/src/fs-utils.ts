import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function copyDirectory(source: string, target: string): void {
  if (!existsSync(source)) {
    throw new Error(`Source directory does not exist: ${source}`);
  }

  mkdirSync(target, { recursive: true });
  cpSync(source, target, {
    recursive: true,
    force: true,
    filter: (path) => !path.includes("node_modules") && !path.includes(".DS_Store")
  });
}

export function readJsonFile<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeJsonFile(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

export function writeTextFile(path: string, value: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
}
