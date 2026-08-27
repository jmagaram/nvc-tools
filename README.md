# NVC

An Obsidian plugin for putting feelings and needs into a note.

It adds two commands — **NVC: Insert feelings…** and **NVC: Insert needs…** —
each opening a picker over the note you are in. Walk the categories, choose the
words that fit, and what you picked lands at the cursor:

```md
- Angry: incensed, indignant, outraged
- Peaceful: calm, content
```

The words come from the Center for Nonviolent Communication's Feelings and
Needs Inventory. What goes in the note is a fenced block whose body is those
same bullets, so the note still reads with the plugin turned off. With it on,
the block can be redrawn as a list, a table, or one comma-separated line, and
**Convert to Markdown** turns it into ordinary markdown for good.

## Install the beta

The plugin is not in the community directory yet. To try it, use
[BRAT](https://tfthacker.com/BRAT):

1. Install **BRAT** from Settings → Community plugins.
2. Open the command palette and run **BRAT: Add a beta plugin for testing**.
3. Paste `jmagaram/nvc-tools` and click **Add Plugin**.
4. Enable **NVC** under Settings → Community plugins.

BRAT checks for new releases on startup, so updates arrive on their own.

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

The plugin is built out of small, presentation-only React components that live
in `src/`. The gallery is where they are developed: the home page lists every
component, and clicking one opens a page where you can configure its props and
see it render below.

```sh
npm run dev
```

See `CLAUDE.md` for design rules and how to add a component.

## Releasing

`manifest.json` and `versions.json` live at the repo root because that is where
Obsidian's community directory reads them from.

```sh
npm run version:bump 0.2.0
```

That sets the version in both files and prints the tag commands. Pushing a tag
runs `.github/workflows/release.yml`, which builds and opens a draft release
with `main.js`, `manifest.json` and `styles.css` attached. Write the notes and
publish it — BRAT cannot see a draft.

The tag must match `manifest.json`'s `version` exactly. Once the plugin is in
the directory, bumping the root `manifest.json` is what tells every existing
user there is an update, so a beta after that point gets a tag and a release
*without* a manifest bump.

## Attribution

The feelings and needs word lists in `src/data/` come from the Center for
Nonviolent Communication's Feelings and Needs Inventory, © 2023 Center for
Nonviolent Communication, [cnvc.org](https://www.cnvc.org). CNVC gives
permission to copy and share it and asks to be credited. The gallery carries
that credit on its home page and the plugin carries it under the categories in
both modals; anything else built from these components inherits the same
obligation.

The definitions attached to each word are not from CNVC. They were written for
this project.

## License

[MIT](LICENSE), for this project's own code.

That covers the code only. The CNVC word lists keep their own terms, described
under Attribution above — the MIT license does not relicense them.
