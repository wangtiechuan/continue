import { ToolPolicy } from "@continuedev/terminal-security";
import { Tool } from "../..";
import { ResolvedPath, resolveInputPath } from "../../util/pathResolver";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { evaluateFileAccessPolicy } from "../policies/fileAccess";

export const readFileTool: Tool = {
  type: "function",
  displayTitle: "读取文件",
  wouldLikeTo: "读取 {{{ filepath }}}",
  isCurrently: "正在读取 {{{ filepath }}}",
  hasAlready: "已读取 {{{ filepath }}}",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ReadFile,
    description:
      "用于查看已有文件的内容。",
    parameters: {
      type: "object",
      required: ["filepath"],
      properties: {
        filepath: {
          type: "string",
          description:
            "要读取的文件路径。可以是相对路径（基于工作区根）、绝对路径、波浪路径（~/...）或 file:// URI",
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `要读取已知路径的文件，请使用 ${BuiltInToolNames.ReadFile} 工具。例如，要读取 'path/to/file.txt' 位置的文件，可以这样回复：`,
    exampleArgs: [["filepath", "path/to/the_file.txt"]],
  },
  defaultToolPolicy: "allowedWithoutPermission",
  toolCallIcon: "DocumentIcon",
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
