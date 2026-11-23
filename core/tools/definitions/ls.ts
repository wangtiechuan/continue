import { Tool } from "../..";

import { ToolPolicy } from "@continuedev/terminal-security";
import { ResolvedPath, resolveInputPath } from "../../util/pathResolver";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { evaluateFileAccessPolicy } from "../policies/fileAccess";

export const lsTool: Tool = {
  type: "function",
  displayTitle: "列出目录",
  wouldLikeTo: "列出 {{{ dirPath }}} 下的文件",
  isCurrently: "正在列出 {{{ dirPath }}} 下的文件",
  hasAlready: "已列出 {{{ dirPath }}} 下的文件",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.LSTool,
    description: "列出指定目录下的文件和文件夹",
    parameters: {
      type: "object",
      properties: {
        dirPath: {
          type: "string",
          description:
            "目录路径。可以是相对路径（基于工作区根）、绝对路径、波浪路径（~/...）或 file:// URI。路径用正斜杠",
        },
        recursive: {
          type: "boolean",
          description:
            "为 true 时递归列出文件和文件夹。为避免结果过大，请谨慎使用",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithoutPermission",
  systemMessageDescription: {
    prefix: `To list files and folders in a given directory, call the ${BuiltInToolNames.LSTool} tool with "dirPath" and "recursive". For example:`,
    exampleArgs: [
      ["dirPath", "path/to/dir"],
      ["recursive", "false"],
    ],
  },
  toolCallIcon: "FolderIcon",
  preprocessArgs: async (args, { ide }) => {
    const dirPath = args.dirPath as string;

    // Default to current directory if no path provided
    const pathToResolve = dirPath || ".";
    const resolvedPath = await resolveInputPath(ide, pathToResolve);

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
