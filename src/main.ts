import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

import manifest from "../package.json";

const printHelpAndExit = (exitCode = 0) => {
  console.log(`
    Usage: pod-lockfile [options]
  
    Options:
      --project: The path to the project directory holding a Podfile, defaults to current working directory
      --pod-version: The version of cocoapods to install or require, defaults to latest
      --version: Print the version of the package
    `);
  process.exit(exitCode);
};

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  printHelpAndExit(0);
}

type SupportedFlags = {
  project?: string;
  "pod-version"?: string;
  version?: boolean;
};

const knownFlags: Array<keyof SupportedFlags> = [
  "project",
  "pod-version",
  "version",
];
const unsupportedFlags = new Set<string>();

const flags = process.argv.reduce((acc, arg, index) => {
  if (/^-[a-zA-Z]/.test(arg)) {
    unsupportedFlags.add(arg);
    return acc;
  }

  const nextArg = process.argv[index + 1] ?? "";
  if (arg.startsWith("--") && nextArg.startsWith("--") === false) {
    const key = arg.slice(2);
    if (knownFlags.includes(key as any) === false) {
      unsupportedFlags.add(key);
      return acc;
    }
    return {
      ...acc,
      [key]: nextArg || true,
    };
  }
  return acc;
}, {} as SupportedFlags);

if (unsupportedFlags.size > 0) {
  console.log(
    `Unsupported option(s): ${Array.from(unsupportedFlags).join(", ")}\n\n`
  );
  printHelpAndExit(1);
}

if (flags["version"]) {
  console.log(manifest.version);
  process.exit(0);
}

const podVersion = flags["pod-version"];
const requiresPodVersion = typeof podVersion === "string";
const installedGems = execSync("gem list --local").toString();

const podInstalled = installedGems.split(/\r?\n/).find((gem) => {
  return gem.trim().startsWith("cocoapods (");
});

if (
  podInstalled &&
  requiresPodVersion &&
  podInstalled.includes(`(${podVersion.trim()}`) === false
) {
  throw new Error(
    `Pod version mismatch, expected ${podVersion}, got:\n\t${podInstalled}\n`
  );
}

if (!podInstalled) {
  console.log(
    requiresPodVersion
      ? `Installing cocoapods w/ required version ${podVersion}`
      : "Installing cocoapods"
  );
  execSync(
    requiresPodVersion
      ? `gem install cocoapods -v ${podVersion}`
      : "gem install cocoapods"
  );
}

const pluginInstalled = installedGems.split(/\r?\n/).find((gem) => {
  return gem.trim().startsWith("cocoapods-lockfile (");
});

if (!pluginInstalled) {
  console.log("Installing cocoapods-lockfile plugin");
  execSync("gem install cocoapods-lockfile");
}

const path = resolve(flags["project"] ?? process.cwd());

const podfileExists = existsSync(resolve(path, "Podfile"));
if (!podfileExists) {
  console.log(`No Podfile could be found in ${path}, aborting.`);
  process.exit(1);
}

console.log("Generating lockfile for project");
execSync("pod install --lockfile-only");
