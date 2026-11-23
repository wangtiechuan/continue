import { ToolPolicy } from "@continuedev/terminal-security";
import { Tool } from "../..";
import { ResolvedPath, resolveInputPath } from "../../util/pathResolver";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { evaluateFileAccessPolicy } from "../policies/fileAccess";

export const createNewFileTool: Tool = {
  type: "function",
  displayTitle: "新建文件",
  wouldLikeTo: "新建 {{{ filepath }}}",
  isCurrently: "正在新建 {{{ filepath }}}",
  hasAlready: "已新建 {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  isInstant: true,
  function: {
    name: BuiltInToolNames.CreateNewFile,
    description:
      "新建一个文件。仅在文件不存在且需要创建时使用",
    parameters: {
      type: "object",
      required: ["filepath", "contents"],
      properties: {
        filepath: {
          type: "string",
          description:
            "新文件的创建路径。可以是相对路径（基于工作区根）、绝对路径、波浪路径（~/...）或 file:// URI。",
        },
        contents: {
          type: "string",
          description: "写入新文件的内容",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `To create a NEW file, use the ${BuiltInToolNames.CreateNewFile} tool with the relative filepath and new contents. For example, to create a file located at 'path/to/file.txt', you would respond with:`,
    exampleArgs: [
      ["filepath", "path/to/the_file.txt"],
      ["contents", "Contents of the file"],
    ],
  },
  preprocessArgs: async (args, { ide }) => {
    const filepath = args.filepath as string;
    const resolvedPath = await resolveInputPath(ide, filepath);

    // Store the resolved path info in args for policy evaluation
    return {
      resolvedPath,
    };
  },
  evaluateToolCallPolicy: (
    basePolicy: ToolPolicy,
    _: Record<string, unknown>,
    processedArgs?: Record<string, unknown>,
  ): ToolPolicy => {
    const resolvedPath = processedArgs?.resolvedPath as
      | ResolvedPath
      | null
      | undefined;
    if (!resolvedPath) return basePolicy;

    return evaluateFileAccessPolicy(basePolicy, resolvedPath.isWithinWorkspace);
  },
};
