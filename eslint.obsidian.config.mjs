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
