# Contributing

This repo is two things: the **NVC** Obsidian plugin, and the gallery of small
React components it is built out of. The plugin imports straight from `src/` and
adds nothing to it, so a change to a component is a change to the plugin.

## Build it yourself

Point `.env.local` at your vault folder — the one containing `.obsidian` — and
deploy:

```sh
npm install
echo 'OBSIDIAN_VAULT=/path/to/your/vault' > .env.local
npm run plugin:deploy
```

Then enable **NVC** under Settings → Community plugins. `npm run plugin:dev`
rebuilds and redeploys on every change; with pjeby's Hot Reload plugin
installed, Obsidian picks each build up on its own.

`.env.local` is gitignored — the vault path is one machine's, not the
project's.

## The component gallery

The gallery is where the components are developed: the home page lists every
one, and clicking it opens a page where you can configure its props and see it
render below.

```sh
npm run dev
```

See `CLAUDE.md` for the design rules and how to add a component.

## Releasing

`manifest.json` and `versions.json` live at the repo root because that is where
Obsidian's community directory reads them from — at the HEAD of the default
branch, so a release has to be on `main`.

```sh
npm run version:bump 1.1.0
```

That sets the version in both files and prints the tag commands. Pushing a tag
runs `.github/workflows/release.yml`, which checks the tag against the manifest,
builds, and opens a draft release with `main.js`, `manifest.json` and
`styles.css` attached. Write the notes and **publish it** — neither the
directory nor BRAT can see a draft, and the directory ignores a pre-release.

The tag must match `manifest.json`'s `version` exactly; the workflow fails the
run rather than shipping a release nothing can find. Bumping the root
`manifest.json` is what tells every installed copy there is an update, so a beta
gets a tag and a release *without* a manifest bump.

`npm run build` is the **plugin** build, not the gallery's — the directory's
scanner runs it and checks its output against the release assets. The gallery
builds with `npm run gallery:build`.

Before submitting a release, run the directory's own review locally:

```sh
npm run lint:obsidian
```

Submission to the community directory happens once, at `community.obsidian.md`
— not by pull request; `obsidianmd/obsidian-releases` stopped taking those in
May 2026. After that, an update is only a new release.
