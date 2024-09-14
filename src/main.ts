import { execSync } from "child_process";
import { existsSync } from "fs";

const installedGems = execSync("gem list --local").toString();

const podInstalled = installedGems.split(/\r?\n/).find((gem) => {
  return gem.trim().startsWith("cocoapods (");
});

if (!podInstalled) {
  console.log("Installing cocoapods");
  execSync("gem install cocoapods");
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
