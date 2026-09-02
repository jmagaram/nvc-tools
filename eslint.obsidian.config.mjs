// The community directory's automated review, runnable before submitting.
//
// This is not the project's linter — `npm run lint` is oxlint, and it stays the
// one that runs on every change. This config exists only to answer "would the
// directory's scanner complain", which is why it is a separate file and a
// separate script.
//
// It is scoped to the plugin. `src/` is the component gallery: the scanner
// reads it as plugin source, but most of it is never imported by `obsidian/`,
// and its demo pages would raise findings about code that never ships. Read
// anything it says about `src/` as advisory.
//
// The ignore below is ours alone — the directory's scanner has no such list and
// lints the demo pages too. So a finding it raises there is real even though
// this config cannot see it, which is how a `navigator.userAgent` in
// `src/demos/` came to fail a submission. Anything the demos do that a plugin
// may not do has to go, ignored here or not.

import obsidianmd from 'eslint-plugin-obsidianmd'

export default [
  // Only what ships. Build tooling (`scripts/`, the vite configs) is on the
  // scanner's own ignore list and is not in tsconfig.app.json either, so
  // type-aware rules cannot parse it.
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      'src/demos/',
      'scripts/',
      '*.mjs',
      'vite.config.ts',
      'vite.plugin.config.ts',
    ],
  },
  ...obsidianmd.configs.recommended,
  {
    // Several of the recommended rules are type-aware. tsconfig.app.json
    // already covers exactly the two folders being linted.
    languageOptions: {
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]
