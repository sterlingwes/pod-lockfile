import { execSync } from "child_process";

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
  console.log("Installing cocoapods-lockfile");
  execSync("gem install cocoapods-lockfile");
}

console.log("Generating lockfile for simple fixture");
execSync("cd test/fixtures/simple && pod install --lockfile-only");

const lockfile = execSync("cat test/fixtures/simple/Podfile.lock").toString();
console.log("got a lockfile!");
console.log(lockfile);
