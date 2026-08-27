# nvc-tools

A gallery of small, presentation-only React components for NVC tools. The home
page lists every component; clicking one opens a page where you can configure
its props and see it render below.

```sh
npm install
npm run dev
```

See `CLAUDE.md` for design rules and how to add a component.

## The Obsidian plugin

`obsidian/` wraps two of the components as an Obsidian plugin. It adds two
commands — **NVC: Insert feelings…** and **NVC: Insert needs…** — each opening
a picker over the note you are in and inserting what you picked at the cursor:

```md
- Angry: incensed, indignant, outraged
- Peaceful: calm, content
```

To build and install it into your own vault, point `.env.local` at the vault
folder (the one containing `.obsidian`) and deploy:

```sh
echo 'OBSIDIAN_VAULT=/path/to/your/vault' > .env.local
npm run plugin:deploy
```

Then enable **NVC** under Settings → Community plugins. `npm run plugin:dev`
rebuilds and redeploys on every change; with pjeby's Hot Reload plugin
installed, Obsidian picks each build up on its own.

`.env.local` is gitignored — the vault path is one machine's, not the
project's.

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
