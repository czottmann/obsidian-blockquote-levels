import { Command, Editor, MarkdownView, Plugin } from "obsidian";

export default class CopySearchUrl extends Plugin {
  button: HTMLDivElement;

  async onload() {
    this.addCommand({
      id: "blockquote-levels-increase",
      name: "Increase",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        if (editor.somethingSelected()) {
          this.increaseLevelForSelections(editor);
        } else {
          this.increaseLevelForLine(editor, editor.getCursor("head").line);
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
          this.decreaseLevelForLine(editor, editor.getCursor("head").line);
        }
      },
    });
  }

  onunload() {
  }

  private increaseLevelForSelections(editor: Editor) {
    for (const selection of editor.listSelections()) {
      let [firstLine, lastLine] = [
        selection.anchor.line,
        selection.head.line,
      ].sort();

      for (let lineNo = lastLine; lineNo >= firstLine; lineNo--) {
        this.increaseLevelForLine(editor, lineNo);
      }
    }
  }

  private increaseLevelForLine(editor: Editor, lineNo: number) {
    const line = editor.getLine(lineNo);
    const prefix = /^>/.test(line) ? ">" : "> ";
    editor.setLine(lineNo, prefix + line);
  }

  private decreaseLevelForSelections(editor: Editor) {
    for (const selection of editor.listSelections()) {
      let [firstLine, lastLine] = [
        selection.anchor.line,
        selection.head.line,
      ].sort();

      for (let lineNo = lastLine; lineNo >= firstLine; lineNo--) {
        this.decreaseLevelForLine(editor, lineNo);
      }
    }
  }

  private decreaseLevelForLine(editor: Editor, lineNo: number) {
    const line = editor.getLine(lineNo);
    editor.setLine(lineNo, line.replace(/^>\s*/, ""));
  }
}
