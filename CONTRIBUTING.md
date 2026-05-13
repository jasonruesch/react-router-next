# Contributing to react-router-next

Thanks for your interest in contributing! This document covers everything you need to know to get a change merged into `@evolonix/react-router-next`.

## Code of Conduct

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) — it describes the kind of community we want to be and the behaviors we encourage.

## Reporting bugs and requesting features

- **Bugs:** open a [bug report](https://github.com/evolonix/react-router-next/issues/new?template=bug_report.yml). Please include a minimal reproduction — a CodeSandbox or stripped-down repo is the fastest path to a fix.
- **Features:** open a [feature request](https://github.com/evolonix/react-router-next/issues/new?template=feature_request.yml). Describe the use case before the implementation.
- **Security vulnerabilities:** **do not** open a public issue. See [SECURITY.md](.github/SECURITY.md) for the private reporting process.
- **Usage questions:** see [SUPPORT.md](SUPPORT.md).

## Repository layout

This is an npm workspaces monorepo:

```
.
├── packages/
│   └── react-router-next/   # the published library (runtime + Vite plugin + CLI)
└── apps/
    └── demo/                # example app that exercises every feature
```

Only `packages/react-router-next` ships to npm. The `demo` app is a private workspace used for development and is excluded from the changesets release flow (see [.changeset/config.json](.changeset/config.json)).

## Prerequisites

- **Node** ≥ 22 (the repo's `.nvmrc` pins the exact version used in CI — `nvm use` will pick it up)
- **npm** ≥ 9 (uses npm workspaces)

## Local setup

```sh
git clone https://github.com/evolonix/react-router-next.git
cd react-router-next
npm install                       # install all workspaces
npm run dev                       # run the package build (tsup --watch) and the demo's Vite dev server concurrently
```

Per-workspace commands:

```sh
npm run build -w @evolonix/react-router-next   # build the library (tsup → dist/)
npm run dev   -w @evolonix/react-router-next   # tsup --watch
npm run build -w demo                          # tsc -b && vite build
npm run dev   -w demo                          # vite dev server
npm run typegen -w demo                        # regenerate routes.d.ts shim
```

## Quality gates

CI runs the same scripts you can run locally before pushing:

```sh
npm run format:check   # prettier --check .
npm run lint           # eslint across workspaces
npm run typecheck      # tsc --noEmit on the library
npm run build          # full build of package + demo
```

All four must pass for a PR to be mergeable. To auto-fix formatting:

```sh
npm run format
```

## Changesets — required for user-facing changes

Releases are automated via [changesets](https://github.com/changesets/changesets). **Any PR that changes `packages/react-router-next` in a way users will notice must include a changeset.** Examples that need one: bug fixes, new features, type changes, breaking changes, public-API tweaks. Examples that do **not** need one: README/docs-only changes, repo tooling, demo-only updates, tests, internal refactors with no behavioral change.

To add a changeset:

```sh
npx changeset
```

Pick a bump level (`patch` / `minor` / `major`) and write a one-line summary in the imperative mood — it becomes a line in the published changelog/release notes. Commit the generated `.changeset/*.md` file alongside your code changes.

When your PR merges to `main`, the release workflow opens (or updates) a `chore(release): version packages` PR. Merging that PR publishes to npm with provenance.

## Pull request expectations

- **Keep PRs focused.** One logical change per PR; don't bundle unrelated refactors.
- **Link the issue** the PR closes (`Closes #123`) when applicable.
- **Fill out the [PR template](.github/PULL_REQUEST_TEMPLATE.md).**
- **Update or add tests** when you change behavior. If a feature is hard to test in isolation, demonstrate it in `apps/demo/`.
- **Update docs** — both [packages/react-router-next/README.md](packages/react-router-next/README.md) and any relevant section of the root [README.md](README.md) — when you change a public API or convention.
- **Pass CI before requesting review.** A red CI is a non-starter.

## Commit messages

The project follows the spirit of [Conventional Commits](https://www.conventionalcommits.org/). Common prefixes seen in the history: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `refactor:`, `test:`. The release-bot uses `chore(release):` — please don't reuse that prefix in normal contributions.

## Questions?

Open a [GitHub Discussion](https://github.com/evolonix/react-router-next/discussions) or ping the maintainer on the relevant issue. Thanks for helping make this project better!
