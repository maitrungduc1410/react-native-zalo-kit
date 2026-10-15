# AGENTS.md

Notes for AI coding agents working on react-native-zalo-kit. Read [ARCHITECTURE.md](ARCHITECTURE.md) first for how the pieces fit together; this file covers how to work in the repo.

## What this is

A React Native library that wraps the official Zalo SDKs for Android and iOS. It covers Zalo login, access and refresh tokens, and the user profile. It is a TurboModule only (New Architecture), with an Expo config plugin for Expo apps.

Zalo no longer gives third-party apps access to friends, messages or feed APIs. Do not add wrappers for them.

## Setup

- Node version is in `.nvmrc`. Yarn 3 is checked in under `.yarn/releases`, so run `yarn`, not `npm install`.
- `yarn` at the root installs the library, `example/` and `docs/` workspaces.

## Commands

| Command | What it does |
| --- | --- |
| `yarn lint` | ESLint + Prettier on all JS/TS. |
| `yarn typecheck` | `tsc` for the library and for `plugin/`. |
| `yarn test` | Jest: `src/__tests__` (JS API with a mocked native module) and `plugin/src/__tests__` (config plugin). |
| `yarn prepare` | Builds `lib/` with bob and `plugin/build` with `tsc`. |
| `yarn docs:dev` / `yarn docs:build` | Docs site. `docs:build` also runs TypeDoc, and fails on dead links. |
| `yarn changeset` | Adds a changeset. Never call `npx changeset` directly. |
| `yarn example android` / `yarn example ios` | Runs the example app. |

Before you hand work back, run `yarn lint`, `yarn typecheck` and `yarn test`. Run `yarn docs:build` too if you touched `docs/` or the TSDoc in `src/`.

## Where things live

- Public API: `src/index.tsx`. Native spec: `src/NativeZaloKit.ts`.
- Android: `android/src/main/java/com/zalokit/`. iOS: `ios/`.
- Expo plugin: `plugin/src/index.ts`. `plugin/build` is generated and gitignored.
- Docs: `docs/guide/*.md` (English), `docs/vi/guide/*.md`, `docs/zh/guide/*.md`. `docs/api/` is generated, never edit it.

## Rules that are easy to break

**Keep the platforms in step.** Android and iOS implement the same state machine for login sessions and token refresh. A behavior change on one side almost always needs the same change on the other, plus a test or docs update.

**Error codes exist in three places.** `ErrorCodes` in `src/index.tsx`, the `ERROR_*` constants in `ZaloKitModule.kt`, and the `ZaloKitError*` constants in `ZaloKit.mm`. Add or rename them everywhere, and update `docs/guide/errors.md` and its translations.

**Native state is main-thread only.** On Android, `loginSession` and `refreshWaiters` are only read or written on the main thread, and SDK callbacks hop back with `runOnMain` first. On iOS, `methodQueue` is the main queue and callbacks `dispatch_async` to it. Do not add background-thread access to that state.

**Refresh tokens are single-use.** Every refresh must go through `refreshTokens`, which shares one request between concurrent callers. Do not call the SDK's refresh API from anywhere else.

**Every promise must settle.** A login that never resolves was the main bug in 5.x. Any new code path in login or refresh needs to resolve or reject, including when the SDK calls back for a session that has already been replaced.

**The `bIsZaloOutOfDate` reflection** in `ZaloSdkCompat.kt` depends on a private field of the Android SDK. If you bump `ZaloKit_zaloSdkVersion` in `android/gradle.properties`, check that the field still exists and that the keep rules in `consumer-rules.pro` still cover it.

**Changing `NativeZaloKit.ts` changes codegen.** Update `ZaloKitModule.kt`, `ZaloKit.mm`, the wrapper in `src/index.tsx` and the jest mock in `src/__tests__/index.test.tsx` together.

**The config plugin must be idempotent.** Running `expo prebuild` twice must not duplicate anything. The plugin tests check this; add a case when you add a modification.

## Docs

- The guide exists in English, Vietnamese and Simplified Chinese. When you change a page in `docs/guide/`, change `docs/vi/guide/` and `docs/zh/guide/` too, or say clearly in your summary that the translations are out of date.
- Translated pages give every `##` and `###` heading an explicit `{#id}` that matches the English slug, so links like `/vi/guide/zalo-app#for-play-app-signing` keep working. Keep them when editing.
- Translate naturally, the way developers in that language actually write. Leave technical terms that people use in English as they are (token, build, prebuild, callback, config plugin, hash key, bundle ID, Promise, reject). Do not invent translations for them.
- Links to the API reference always point at `/api/...`. There is only one, English, copy.
- Public API docs come from the TSDoc in `src/`. Document new functions and options there with `@param`, `@returns`, `@throws` and an `@example`.
- No em dashes in docs, README or comments. Use a comma, a colon, parentheses or a new sentence.

## Changes and releases

- Any change users can see (behavior, API, native setup) needs a changeset: `yarn changeset`, or a hand-written `.changeset/<name>.md`. Docs, CI, tests and example changes do not.
- Do not bump `version` in `package.json` and do not edit `CHANGELOG.md` by hand. The release workflow does both.
- Commit messages follow Conventional Commits (`fix:`, `feat:`, `docs:`, `chore:`, ...). commitlint runs in the `commit-msg` hook.

## Things to avoid

- Do not commit generated output: `lib/`, `plugin/build/`, `docs/api/`, `docs/.vitepress/dist/`, `docs/.vitepress/cache/`.
- Do not point the project at a private npm registry or mirror. `yarn.lock` must resolve against the public npm registry.
- Do not log access or refresh tokens, not even in debug builds.
