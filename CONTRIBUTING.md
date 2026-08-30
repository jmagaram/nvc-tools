# Contributing

This repo is two things: the **Nonviolent Communication** Obsidian plugin, and
the gallery of small React components it is built out of. The plugin imports
straight from `src/` and adds nothing to it, so a change to a component is a
change to the plugin.

## Build it yourself

Point `.env.local` at your vault folder — the one containing `.obsidian` — and
deploy:

```sh
npm install
echo 'OBSIDIAN_VAULT=/path/to/your/vault' > .env.local
npm run plugin:deploy
```

Then enable **Nonviolent Communication** under Settings → Community plugins.
`npm run plugin:dev` rebuilds and redeploys on every change; with pjeby's Hot
Reload plugin installed, Obsidian picks each build up on its own.

`.env.local` is gitignored — the vault path is one machine's, not the
project's.

## Run a beta without building

[BRAT](https://tfthacker.com/BRAT) installs a plugin from a repo's releases
rather than from the directory, which is how a tester runs a version that is
tagged but not yet listed — see **Releasing** below for why a beta gets a tag
and a release without a manifest bump.

1. Install **BRAT** from Settings → Community plugins.
2. Open the command palette and run **BRAT: Add a beta plugin for testing**.
3. Paste `jmagaram/nvc-tools` and click **Add Plugin**.
4. Enable **Nonviolent Communication** under Settings → Community plugins.

BRAT checks for new releases on startup, so updates arrive on their own. Don't
run this and a build of your own at once — disable whichever you are not
testing.

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

### The tag is the trigger

**Do not use GitHub's "Draft a new release" button.** The release here is
something the tag produces, not something you write by hand. Pushing a tag runs
`.github/workflows/release.yml`, which builds and then runs `gh release create`
— and that fails if a release for the tag already exists, leaving you a release
page with no `main.js` on it, which is the one file Obsidian downloads.

Start on `main`, with everything the release should contain already merged:

```sh
git checkout main && git pull
npm run lint:obsidian        # the directory's own review, run locally
npm run version:bump 1.1.0   # writes both files, prints these same commands
git commit -am "Prepare 1.1.0"
git push
git tag -a 1.1.0 -m "1.1.0"
git push origin 1.1.0
```

That last push is what cuts the release. The workflow checks the tag against
the manifest, builds, and opens a **draft** release with `main.js`,
`manifest.json` and `styles.css` attached.

Then, on the Releases page, edit that draft:

1. Write the notes. The directory's review asks for them, and an empty body is
   what a reader gets instead of a changelog.
2. Check the three assets are actually attached. If the workflow failed there
   will be none — fix and re-tag rather than publishing an empty release.
3. Leave **Set as a pre-release** unchecked. The directory skips pre-releases
   outright, which is what made every 0.1.x invisible to it.
4. **Publish release.** Neither the directory nor BRAT can see a draft.

### What the version has to line up with

The tag must match `manifest.json`'s `version` exactly — `1.1.0`, no `v`
prefix, no pre-release suffix. The workflow fails the run rather than shipping a
release nothing can find.

Bumping the root `manifest.json` is what tells every installed copy there is an
update, so a beta gets a tag and a release *without* a manifest bump.

`npm run build` is the **plugin** build, not the gallery's — the directory's
scanner runs it and checks its output against the release assets, so it has to
stay the plugin one. The gallery builds with `npm run gallery:build`.

`npm run lint:obsidian` is that scanner's review, run locally. It is not the
project's linter — `npm run lint` is — and it answers one question, which is
whether a release would pass. Worth a run before every tag, since it is cheaper
than a failed submission.

Submission to the community directory happens once, at `community.obsidian.md`
— not by pull request; `obsidianmd/obsidian-releases` stopped taking those in
May 2026. After that, an update is only a new release.
