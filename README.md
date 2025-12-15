# VsD System

![Foundry VTT v13](https://img.shields.io/badge/Foundry-v13-green)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![License](https://img.shields.io/github/license/jero-rodriguez/vsd-system)
![Latest Release](https://img.shields.io/github/v/release/jero-rodriguez/vsd-system)
![Release Workflow](https://img.shields.io/github/actions/workflow/status/jero-rodriguez/vsd-system/release.yml?label=release)

**VsD System** is an unofficial **Against the Darkmaster** system for **Foundry VTT v13**, built with a modern, maintainable architecture based on **ES modules**, a clean source/build separation, and a fully automated release pipeline.

This repository contains the **actual source code** of the system. It is not a generic generator template.

## Project Status

* Foundry VTT: **v13**
* Language: JavaScript (ESM)
* Styling: CSS (SCSS present but not currently used)
* Build tooling: Node.js
* Releases: GitHub Actions
* Versioning: Semantic Versioning + Conventional Commits

The system is under **active development**.

## Installation

### Automatic installation (recommended)

From Foundry VTT:

1. Go to **Game Systems**
2. Click **Install System**
3. Use the manifest URL of the desired release:

   ```
   https://raw.githubusercontent.com/jero-rodriguez/vsd-system/refs/tags/vX.Y.Z/system.json
   ```

Replace `vX.Y.Z` with the target version (for example `v0.0.4`).

### Manual installation

1. Download the ZIP file from the **Releases** section of this repository.
2. Extract its contents into:

   ```
   <FoundryData>/systems/vsd-system
   ```
3. Restart Foundry VTT.

## Repository Structure

```
vsd-system/
├─ src/                # Source code (authoritative)
│  ├─ module/          # Runtime JavaScript
│  ├─ templates/       # Handlebars sheets and templates
│  ├─ css/             # Final CSS styles
│  ├─ assets/          # Images and static resources
│  ├─ lang/            # Localization files
│  ├─ lib/             # Internal libraries
│  ├─ packs/           # Compendiums
│  ├─ system.json      # Source manifest
│  └─ template.json    # Data template
├─ tools/              # Build and packaging scripts
│  ├─ build.mjs
│  └─ zip.mjs
├─ dist/               # Build output (never committed)
├─ .github/workflows/  # GitHub Actions
├─ package.json
└─ README.md
```

Important notes:

* `dist/` is **staging only**. Its contents are packaged directly into the release ZIP.
* ZIP files are **never committed** to the repository.

## Local Development

### Requirements

* Node.js **18+** (Node 20 recommended)
* npm

### Install dependencies

```
npm install
```

### Build the system

Generates the final Foundry-ready files in `dist/`:

```
npm run build
```

### Package the system

Creates the installable ZIP (without a `dist/` directory inside):

```
npm run zip
```

Or both steps together:

```
npm run release
```

## Versioning and Changelog

This project uses:

* **Semantic Versioning**
* **Conventional Commits**
* **standard-version** for automated releases

### Recommended commit types

* `feat:` new features
* `fix:` bug fixes
* `refactor:` refactoring
* `chore:` maintenance tasks
* `docs:` documentation changes

Example:

```
feat: add initial character sheet
```

### Bumping the version

* Patch release:

```
npm run version:patch
```

* Minor release:

```
npm run version:minor
```

* Major release:

```
npm run version:major
```

This automatically:

* Updates `package.json`
* Updates `CHANGELOG.md`
* Creates a release commit
* Creates a Git tag `vX.Y.Z`

Then push everything:

```
git push origin main --follow-tags
```

## Automated Releases (GitHub Actions)

When a tag `vX.Y.Z` is pushed:

1. GitHub Actions runs the build
2. Generates the installable ZIP
3. Creates a **GitHub Release**
4. Uploads the ZIP as a release asset

ZIP files exist **only** as release assets, never in the repository history.

## Compatibility

* Foundry VTT **v13 only**
* Not compatible with older Foundry versions

## License

See `LICENSE.txt` for details.

## Support and References

* Foundry VTT Discord: [https://discord.gg/foundryvtt](https://discord.gg/foundryvtt)
* Foundry API Documentation: [https://foundryvtt.com/api/](https://foundryvtt.com/api/)
