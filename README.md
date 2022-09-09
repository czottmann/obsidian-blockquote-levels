# Copy Search URL

This plugin adds a button to [Obsidian](https://obsidian.md)'s search view.
Clicking it will copy the [Obsidian URL](https://help.obsidian.md/Advanced+topics/Using+obsidian+URI#Action+search)
for the current search to the clipboard.

![Showcase GIF: both editor and search view are open, a search for "code" is done, then a mouse click on the new "Copy Obsidian search URL" is done, the result is manually pasted in the editor, then another search is done for "note", the button is clicked, and the result is pasted into the editor as well, show a different URL](https://raw.githubusercontent.com/czottmann/obsidian-copy-search-url/master/showcase.gif)


## Installation

1. Search for "Copy Search URL" in Obsidian's community plugins browser.
2. Enable the plugin in your Obsidian settings under "Community plugins".

That's it.


## Installation via BRAT (for pre-releases or betas)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat).
2. Add "Copy Search URL" to BRAT:
    1. Open "Obsidian42 - BRAT" via Settings → Community Plugins
    2. Click "Add Beta plugin"
    3. Use the repository address `czottmann/obsidian-copy-search-url`
3. Enable "Copy Search URL" under Settings → Options → Community Plugins


## Please note

This plugin adds functionality (a button) to a core plugin. The jury's out
whether that a idea is a wise one, tho — either way, here we are. ;)

I wanted this functionality for a while so I've built it myself.  It was a good
learning experience for me.


## Development

Clone the repository, run `pnpm install` OR `npm install` to install the
dependencies.  Afterwards, run `pnpm dev` OR `npm run dev` to compile and have
it watch for file changes.


## Thanks to …

- the [obsidian-tasks](https://github.com/obsidian-tasks-group/obsidian-tasks)
  crew for the "starter templates" for the GitHub Action workflow and the handy
  `release.sh` script
- the humans of [Discord channel `#plugin-dev`](https://discord.com/channels/686053708261228577/840286264964022302)
  for pointing me in the right direction


## Author

Carlo Zottmann, <carlo@zottmann.org>, https://zottmann.org/


## License

MIT, see [LICENSE.md](LICENSE.md).
