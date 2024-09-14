import { execSync } from "child_process";
import { existsSync } from "fs";

type SupportedFlags = {
  "pod-version"?: string;
};

const flags = process.argv.reduce((acc, arg, index) => {
  const nextArg = process.argv[index + 1] ?? "";
  if (arg.startsWith("--") && nextArg.startsWith("--") === false) {
    return {
      ...acc,
      [arg.replace("--", "")]: nextArg || true,
    };
  }
  return acc;
}, {} as SupportedFlags);

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

const podfileExists = existsSync("Podfile");
if (!podfileExists) {
  console.log(`No Podfile could be found in ${process.cwd()}, aborting.`);
  process.exit(1);
}

console.log("Generating lockfile for project");
execSync("pod install --lockfile-only");
