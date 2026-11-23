import { Tool } from "../..";
import { validateSingleEdit } from "../../edit/searchAndReplace/findAndReplaceUtils";
import { executeFindAndReplace } from "../../edit/searchAndReplace/performReplace";
import { validateSearchAndReplaceFilepath } from "../../edit/searchAndReplace/validateArgs";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { NO_PARALLEL_TOOL_CALLING_INSTRUCTION } from "./editFile";

export interface SingleFindAndReplaceArgs {
  filepath: string;
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

export const singleFindAndReplaceTool: Tool = {
  type: "function",
  displayTitle: "查找替换",
  wouldLikeTo: "edit {{{ filepath }}}",
  isCurrently: "editing {{{ filepath }}}",
  hasAlready: "edited {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  isInstant: false,
  function: {
    name: BuiltInToolNames.SingleFindAndReplace,

    description: `在文件中执行精确字符串替换。

重要：
- 编辑前务必先使用 \`${BuiltInToolNames.ReadFile}\` 工具读取文件最新内容。用户也可能在你工作时修改该文件。
- ${NO_PARALLEL_TOOL_CALLING_INSTRUCTION}
- 编辑 \`${BuiltInToolNames.ReadFile}\` 输出的文本时，必须保留原样的空白/缩进。
- 除非用户明确要求，不要在文件中添加表情符号。
- 全文件替换或重命名时使用 \`replace_all\`（如重命名变量）。

警告：
- 不使用 \`replace_all\` 时，若 \`old_string\` 在文件中不唯一，替换会失败。请提供包含更多上下文更长字符串使其唯一，或使用 \`replace_all\` 替换全部。
- 若最近没有用 \`${BuiltInToolNames.ReadFile}\` 读取文件最新内容，替换很可能失败。`,
    parameters: {
      type: "object",
      required: ["filepath", "old_string", "new_string"],
      properties: {
        filepath: {
          type: "string",
          description:
            "要修改的文件路径，相对工作区根目录",
        },
        old_string: {
          type: "string",
          description:
            "要替换的文本，必须精确匹配（含空白/缩进）",
        },
        new_string: {
          type: "string",
          description:
            "替换后的文本（必须与 old_string 不同）",
        },
        replace_all: {
          type: "boolean",
          description: "替换文件中所有 old_string（默认 false）",
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `要在文件中执行精确字符串替换，请使用 ${BuiltInToolNames.SingleFindAndReplace} 工具并传入文件路径（相对工作区根目录）以及要查找和替换的字符串。

  例如，可以这样回复：`,
    exampleArgs: [
      ["filepath", "path/to/file.ts"],
      ["old_string", "const oldVariable = 'value'"],
      ["new_string", "const newVariable = 'updated'"],
      ["replace_all", "false"],
    ],
  },
  defaultToolPolicy: "allowedWithPermission",
  preprocessArgs: async (args, extras) => {
    const { oldString, newString, replaceAll } = validateSingleEdit(
      args.old_string,
      args.new_string,
      args.replace_all,
    );
    const fileUri = await validateSearchAndReplaceFilepath(
      args.filepath,
      extras.ide,
    );

    const editingFileContents = await extras.ide.readFile(fileUri);
    const newFileContents = executeFindAndReplace(
      editingFileContents,
      oldString,
      newString,
      replaceAll ?? false,
      0,
    );

    return {
      ...args,
      fileUri,
      editingFileContents,
      newFileContents,
    };
  },
};
