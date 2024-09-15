import manifest from "../package.json";
import { generateLockfile } from "./lib";

const printHelpAndExit = (exitCode = 0) => {
  console.log(`
    Usage: pod-lockfile [options]
  
    Options:
      --project: The path to the project directory holding a Podfile, defaults to current working directory
      --pod-version: The version of cocoapods to install or require, defaults to latest
      --version: Print the version of the package
      --debug: Log more detailed output
    `);
  process.exit(exitCode);
};

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  printHelpAndExit(0);
}

type SupportedFlags = {
  debug?: boolean;
  project?: string;
  "pod-version"?: string;
  version?: boolean;
};

const knownFlags: Array<keyof SupportedFlags> = [
  "debug",
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
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    if (knownFlags.includes(key as any) === false) {
      unsupportedFlags.add(key);
      return acc;
    }

    const nextArgIsValue = nextArg.startsWith("--") === false;

    return {
      ...acc,
      [key]: nextArgIsValue ? nextArg : true,
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
generateLockfile({ ...flags, podVersion });
