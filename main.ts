import {
  Editor,
  EditorSelection,
  EditorSelectionOrCaret,
  MarkdownView,
  Plugin,
} from "obsidian";
import {
  LineProcessor,
  SelectionLineNumbers,
  SelectionProcessor,
} from "./types";

export default class BlockquoteLevels extends Plugin {
  async onload() {
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

  onunload() {
  }

  private increaseLevelForSelections(editor: Editor) {
    this.processSelections(
      editor,
      (line: string) => /^>/.test(line) ? `>${line}` : `> ${line}`,
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
