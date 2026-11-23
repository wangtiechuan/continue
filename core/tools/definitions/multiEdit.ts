import { Tool } from "../..";
import { validateMultiEdit } from "../../edit/searchAndReplace/multiEditValidation";
import { executeMultiFindAndReplace } from "../../edit/searchAndReplace/performReplace";
import { validateSearchAndReplaceFilepath } from "../../edit/searchAndReplace/validateArgs";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { NO_PARALLEL_TOOL_CALLING_INSTRUCTION } from "./editFile";

export interface EditOperation {
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

export interface MultiEditArgs {
  filepath: string;
  edits: EditOperation[];
}

export const multiEditTool: Tool = {
  type: "function",
  displayTitle: "批量查找替换",
  wouldLikeTo: "edit {{{ filepath }}}",
  isCurrently: "editing {{{ filepath }}}",
  hasAlready: "edited {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  isInstant: false,
  function: {
    name: BuiltInToolNames.MultiEdit,
    description: `对单个文件一次调用完成多组查找替换。
参数：filepath（相对工作区根）、edits（{old_string, new_string, replace_all?} 数组）。
规则：先读取文件；old_string 必须精确匹配（含空白）；old_string 与 new_string 必须不同；edits 按顺序原子应用；对同一文件的所有改动尽量一次调用完成。
${NO_PARALLEL_TOOL_CALLING_INSTRUCTION}`,
    parameters: {
      type: "object",
      required: ["filepath", "edits"],
      properties: {
        filepath: {
          type: "string",
          description:
            "要修改的文件路径，相对工作区根目录",
        },
        edits: {
          type: "array",
          description:
            "按顺序对文件执行的一组编辑操作",
          items: {
            type: "object",
            required: ["old_string", "new_string"],
            properties: {
              old_string: {
                type: "string",
                description:
                  "要替换的文本（必须精确匹配，含空白/缩进）",
              },
              new_string: {
                type: "string",
                description:
                  "替换后的文本，必须与 old_string 不同。",
              },
              replace_all: {
                type: "boolean",
                description:
                  "替换文件中所有 old_string（默认 false）",
              },
            },
          },
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `要对单个文件进行多处编辑，请使用 ${BuiltInToolNames.MultiEdit} 工具并传入文件路径（相对工作区根目录）和编辑操作数组。

  例如，可以这样回复：`,
    exampleArgs: [
      ["filepath", "path/to/file.ts"],
      [
        "edits",
        `[
  { "old_string": "const oldVar = 'value'", "new_string": "const newVar = 'updated'" },
  { "old_string": "oldFunction()", "new_string": "newFunction()", "replace_all": true }
]`,
      ],
    ],
  },
  defaultToolPolicy: "allowedWithPermission",
  preprocessArgs: async (args, extras) => {
    const { edits } = validateMultiEdit(args);
    const fileUri = await validateSearchAndReplaceFilepath(
      args.filepath,
      extras.ide,
    );

    const editingFileContents = await extras.ide.readFile(fileUri);
    const newFileContents = executeMultiFindAndReplace(
      editingFileContents,
      edits,
    );

    return {
      ...args,
      fileUri,
      editingFileContents,
      newFileContents,
    };
  },
};
