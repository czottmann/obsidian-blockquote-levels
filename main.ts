import {
  App,
  Editor,
  EditorSelection,
  EditorSelectionOrCaret,
  MarkdownView,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import {
  LineProcessor,
  SelectionLineNumbers,
  SelectionProcessor,
} from "./types";

interface BlockquoteLevelsSettings {
  spaceBetweenPrefixes: boolean;
  removeSpaceAfterPrefix: boolean; // New setting
}

const DEFAULT_SETTINGS: BlockquoteLevelsSettings = {
  spaceBetweenPrefixes: false,
  removeSpaceAfterPrefix: false, // Default value for the new setting
};

export default class BlockquoteLevels extends Plugin {
  settings: BlockquoteLevelsSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BlockquoteLevelsSettingTab(this.app, this));

    this.addCommand({
      id: "blockquote-levels-increase",
      name: "Increase",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        if (editor.somethingSelected()) {
          this.increaseLevelForSelections(editor);
        } else {
          this.increaseLevelForLine(editor);
        }
      },
    });

    this.addCommand({
      id: "blockquote-levels-decrease",
      name: "Decrease",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        if (editor.somethingSelected()) {
          this.decreaseLevelForSelections(editor);
        } else {
          this.decreaseLevelForLine(editor);
        }
      },
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private increaseLevelForSelections(editor: Editor) {
    const prefix = this.settings.spaceBetweenPrefixes ? "> " : ">";
    this.processSelections(
      editor,
      (line: string) => {
        if (this.settings.removeSpaceAfterPrefix) {
          return /^>/.test(line) ? `${prefix.trim()}${line}` : `>${line}`;
        }
        return /^>/.test(line) ? `${prefix}${line}` : `> ${line}`;
      },
    );
  }

  private decreaseLevelForSelections(editor: Editor) {
    this.processSelections(
      editor,
      (line: string) => line.replace(/^>\s*/, ""),
    );
  }

  private processSelections(editor: Editor, lineProcessor: LineProcessor) {
    this.expandAndSortSelections(editor);

    // Replace text
    for (const selection of editor.listSelections()) {
      const text = editor.getRange(selection.anchor, selection.head)
        .split(/\n/)
        .map(lineProcessor)
        .join("\n");

      editor.replaceRange(text, selection.anchor, selection.head);
    }
  }

  private expandAndSortSelections(editor: Editor) {
    const preparedSelections = editor.listSelections()
      // Sort selections by line numbers, descending, so we're working from the
      // bottom up, seems safer
      .sort((s1, s2) =>
        this.getLineNumbersOfSelection(s2).lastLine -
        this.getLineNumbersOfSelection(s1).lastLine
      )
      // Expand selections to full lines
      .map((selection): EditorSelectionOrCaret => {
        const { firstLine, lastLine } = this.getLineNumbersOfSelection(
          selection,
        );
        return {
          anchor: { line: firstLine, ch: 0 },
          head: { line: lastLine, ch: editor.getLine(lastLine).length },
        };
      });

    editor.setSelections(preparedSelections);
  }

  getLineNumbersOfSelection(selection: EditorSelection): SelectionLineNumbers {
    const nos = [selection.anchor.line, selection.head.line]
      .sort((a, b) => a - b);

    return {
      firstLine: nos[0],
      lastLine: nos[1],
    };
  }

  private increaseLevelForLine(editor: Editor) {
    this.processLine(
      editor,
      () => this.increaseLevelForSelections(editor),
    );
  }

  private decreaseLevelForLine(editor: Editor) {
    this.processLine(
      editor,
      () => this.decreaseLevelForSelections(editor),
    );
  }

  private processLine(editor: Editor, selectionProcessor: SelectionProcessor) {
    const { line, ch } = editor.getCursor("head");
    const origLineLength = editor.getLine(line).length;

    // Create selection containing the line the cursor is in
    editor.setSelection(
      { line, ch: 0 },
      { line, ch: origLineLength },
    );
    selectionProcessor(editor);

    // Set correct new cursor position, which also clears the selection
    const cursorOffset = editor.getLine(line).length - origLineLength;
    editor.setCursor({ line, ch: ch + cursorOffset });
  }
}

class BlockquoteLevelsSettingTab extends PluginSettingTab {
  plugin: BlockquoteLevels;

  constructor(app: App, plugin: BlockquoteLevels) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.createEl("h2", { text: "Blockquote Levels Settings" });

    new Setting(containerEl)
      .setName("Use a space between subsequent blockquote prefixes")
      .setDesc('Disabled: ">>> quote", Enabled: "> > > quote"')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.spaceBetweenPrefixes)
          .onChange(async (value) => {
            console.log(
              "[Blockquote Levels] " +
                "Use spaces between subsequent blockquote prefixes: " +
                value,
            );
            this.plugin.settings.spaceBetweenPrefixes = value;
            await this.plugin.saveSettings();          
	  })
      );

    // New setting
    new Setting(containerEl)
      .setName("Remove the space after blockquote prefixes")
      .setDesc('Disabled: ">>> quote", Enabled: ">>>quote"')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.removeSpaceAfterPrefix)
          .onChange(async (value) => {
            console.log(
              "[Blockquote Levels] " +
                "Remove the space after blockquote prefixes: " +
                value,
            );
            this.plugin.settings.removeSpaceAfterPrefix = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
