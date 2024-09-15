import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

interface Options {
  project?: string;
  podVersion?: string;
}

export const generateLockfile = (options?: Options) => {
  const { project, podVersion } = options ?? {};
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

  const path = resolve(project ?? process.cwd());

  const podfileExists = existsSync(resolve(path, "Podfile"));
  if (!podfileExists) {
    console.log(`No Podfile could be found in ${path}, aborting.`);
    process.exit(1);
  }

  console.log("Generating lockfile for project");
  try {
    execSync("pod install --lockfile-only", { cwd: path });
    console.log(
      "\nPodfile.lock generated successfully! No dependencies were installed in the making of this lockfile.\n"
    );
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
