# pod-lockfile

Generate a cocoapods lockfile without installing (works on linux machines)

`yarn add pod-lockfile`

You must have ruby and the RubyGem package manager (`gem`) installed wherever you're running pod-lockfile.

## Usage

### Command Line (yarn/npm bin)

```
$ yarn pod-lockfile -h

Usage: pod-lockfile [options]

Options:
  --project: The path to the project directory holding a Podfile, defaults to current working directory
  --pod-version: The version of cocoapods to install or require, defaults to latest
  --version: Print the version of the package
  --debug: Log more detailed output
```

### Programmatic API

```ts
import { generateLockfile } from "pod-lockfile";

generateLockfile({ project: "./ios" });
```

Where `generateLockfile(options: Options)`:

```ts
interface Options {
  // relative or absolute path to directory holding Podfile
  project?: string;

  // version of cocoapods you require (defaults to latest or whatever is already installed)
  podVersion?: string;
}
```

## What it does

This module will install cocoapods if you don't have it and a [cocoapods plugin](https://github.com/SotoiGhost/cocoapods-lockfile) which allows running `pod install --lockfile-only`. This is useful for non-mac/darwin environments where you don't want to actually install the pods but you do want a lockfile generated from an available Podfile.

## Contributing

Run `yarn test` to run the CI checks locally.
