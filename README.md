# NVC

An Obsidian plugin for putting feelings and needs into a note.

It adds two commands — **NVC: Insert feelings…** and **NVC: Insert needs…** —
each opening a picker over the note you are in. Feelings are split the way the
source splits them, by whether a need was met; a category you have answered
shows what you kept.

![The feelings picker: met and unmet tabs, two answered categories, the rest as pills](docs/images/feelings-picker.png)

Open a category and every word in it is there to mark at once. Or ask to be
walked through it a word at a time, with a definition for each — which is how
you find the words you would never have picked off a list.

![One word of a walk — Afraid, frightened — with its definition and a progress rule](docs/images/feeling-card.png)

Needs work the same way, as one undivided list.

![The needs picker](docs/images/needs-picker.png)

What you picked lands at the cursor:

```md
- Angry: incensed, indignant, outraged
- Peaceful: calm, content
```

The words come from the Center for Nonviolent Communication's Feelings and
Needs Inventory. What goes in the note is a fenced block whose body is those
same bullets, so the note still reads with the plugin turned off. With it on,
the block can be redrawn as a list, a table, or one comma-separated line,
**Edit…** reopens the picker on what it already holds, and **Convert to
Markdown** turns it into ordinary markdown for good.

![A block as it renders in a note](docs/images/inserted-feelings.png)

## Install

From inside Obsidian: Settings → Community plugins → **Browse**, search for
**NVC**, then **Install** and **Enable**.

### Betas

Releases reach the community directory only once they are cut. To run what is
on `main` ahead of that, use [BRAT](https://tfthacker.com/BRAT):

1. Install **BRAT** from Settings → Community plugins.
2. Open the command palette and run **BRAT: Add a beta plugin for testing**.
3. Paste `jmagaram/nvc-tools` and click **Add Plugin**.
4. Enable **NVC** under Settings → Community plugins.

BRAT checks for new releases on startup, so updates arrive on their own. Don't
run both copies at once — disable whichever you are not testing.

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
