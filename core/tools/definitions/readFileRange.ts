import { ToolPolicy } from "@continuedev/terminal-security";
import { Tool } from "../..";
import { ResolvedPath, resolveInputPath } from "../../util/pathResolver";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { evaluateFileAccessPolicy } from "../policies/fileAccess";

export const readFileRangeTool: Tool = {
  type: "function",
  displayTitle: "读取文件片段",
  wouldLikeTo:
    "读取 {{{ filepath }}} 第 {{{ startLine }}}-{{{ endLine }}} 行",
  isCurrently:
    "正在读取 {{{ filepath }}} 第 {{{ startLine }}}-{{{ endLine }}} 行",
  hasAlready:
    "已读取 {{{ filepath }}} 第 {{{ startLine }}}-{{{ endLine }}} 行",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ReadFileRange,
    description:
      "读取已有文件中指定行范围。只支持正整数行号（从 1 开始）。要读取文件末尾，请改用终端工具执行 tail 命令。",
    parameters: {
      type: "object",
      required: ["filepath", "startLine", "endLine"],
      properties: {
        filepath: {
          type: "string",
          description:
            "要读取的文件路径，相对工作区根目录（不要用 URI 或绝对路径）",
        },
        startLine: {
          type: "number",
          description:
            "起始行号（从 1 开始）。必须是正整数。如 1 = 第一行，10 = 第十行",
        },
        endLine: {
          type: "number",
          description:
            "结束行号（从 1 开始）。必须是大于等于 startLine 的正整数。如 10 = 第十行，20 = 第二十行",
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `To read a specific range of lines from a file, use the ${BuiltInToolNames.ReadFileRange} tool. Only supports positive line numbers (1-based from start). For reading from the end of files, use the terminal tool with 'tail' command instead:`,
    exampleArgs: [
      ["filepath", "path/to/the_file.txt"],
      ["startLine", 10],
      ["endLine", 20],
    ],
  },
  defaultToolPolicy: "allowedWithoutPermission",
  toolCallIcon: "DocumentIcon",
  preprocessArgs: async (args, { ide }) => {
    const filepath = args.filepath as string;
    const resolvedPath = await resolveInputPath(ide, filepath);

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
