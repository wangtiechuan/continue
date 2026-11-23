import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const globSearchTool: Tool = {
  type: "function",
  displayTitle: "文件名搜索",
  wouldLikeTo: '按模式搜索文件 "{{{ pattern }}}"',
  isCurrently: '正在按模式搜索文件 "{{{ pattern }}}"',
  hasAlready: '已按模式搜索文件 "{{{ pattern }}}"',
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.FileGlobSearch,
    description:
      "用 glob 模式在项目中递归搜索文件。支持 ** 递归目录。会排除大多数构建、缓存、密钥目录/文件（可改用 ls 工具）。输出可能被截断，请使用精准模式",
    parameters: {
      type: "object",
      required: ["pattern"],
      properties: {
        pattern: {
          type: "string",
          description: "用于匹配文件路径的 glob 模式",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithoutPermission",
  systemMessageDescription: {
    prefix: `要根据 glob 模式返回文件列表，请使用 ${BuiltInToolNames.FileGlobSearch} 工具`,
    exampleArgs: [["pattern", "*.py"]],
  },
  toolCallIcon: "MagnifyingGlassIcon",
};
