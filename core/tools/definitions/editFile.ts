import { Tool } from "../..";
import { EDIT_CODE_INSTRUCTIONS } from "../../llm/defaultSystemMessages";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export interface EditToolArgs {
  filepath: string;
  changes: string;
}

export const NO_PARALLEL_TOOL_CALLING_INSTRUCTION =
  "此工具不能与任何其他工具（包括自身）并行调用";

const CHANGES_DESCRIPTION =
  "对文件的修改内容，只展示需要的改动。不要包在代码块里，也不要写代码改动以外的内容。较大的文件可用简洁占位符表示未改动的部分，如 '// ... existing code ...'";

export const editFileTool: Tool = {
  type: "function",
  displayTitle: "编辑文件",
  wouldLikeTo: "编辑 {{{ filepath }}}",
  isCurrently: "正在编辑 {{{ filepath }}}",
  hasAlready: "已编辑 {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  isInstant: false,
  function: {
    name: BuiltInToolNames.EditExistingFile,
    description: `编辑已有文件。若不清楚文件内容，请先读取。\n${NO_PARALLEL_TOOL_CALLING_INSTRUCTION}`,
    parameters: {
      type: "object",
      required: ["filepath", "changes"],
      properties: {
        filepath: {
          type: "string",
          description:
            "要编辑的文件路径，相对工作区根目录。",
        },
        changes: {
          type: "string",
          description: CHANGES_DESCRIPTION,
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `To edit an EXISTING file, use the ${BuiltInToolNames.EditExistingFile} tool with
- filepath: the relative filepath to the file.
- changes: ${CHANGES_DESCRIPTION}
Only use this tool if you already know the contents of the file. Otherwise, use the ${BuiltInToolNames.ReadFile} or ${BuiltInToolNames.ReadCurrentlyOpenFile} tool to read it first.
For example:`,
    exampleArgs: [
      ["filepath", "path/to/the_file.ts"],
      [
        "changes",
        "// ... existing code ...\nfunction subtract(a: number, b: number): number {\n  return a - b;\n}\n// ... rest of code ...",
      ],
    ],
  },
};
