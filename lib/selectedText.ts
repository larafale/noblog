import { Extension } from "@tiptap/core";
import { Editor } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands {
    getSelectedText: {
      getSelectedText: () => ({ editor }: { editor: Editor }) => string;
    };
  }
}

const getSelectedText = Extension.create({
  name: "getSelectedText",
  addCommands() {
    return {
      getSelectedText:
        (trimmed = true) =>
        ({ editor }: { editor: Editor }): string => {
          const { from, to, empty } = editor.state.selection;
          if (empty) return "";
          const text = editor.state.doc.textBetween(from, to, " ");
          return trimmed ? text.trim() : text;
        },
    };
  },
});

export default getSelectedText;
