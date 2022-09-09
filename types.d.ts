import { Editor } from "obsidian";

export interface LineProcessor {
  (line: string): string;
}

export interface SelectionProcessor {
  (editor: Editor): void;
}

export interface SelectionLineNumbers {
  firstLine: number;
  lastLine: number;
}
