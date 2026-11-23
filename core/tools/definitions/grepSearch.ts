import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const grepSearchTool: Tool = {
  type: "function",
  displayTitle: "正则搜索",
  wouldLikeTo: '搜索 "{{{ query }}}"',
  isCurrently: '正在搜索 "{{{ query }}}"',
  hasAlready: '已搜索 "{{{ query }}}"',
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.GrepSearch,
    description:
      "用 ripgrep 在仓库中进行正则搜索。会排除大多数构建、缓存、密钥目录/文件。输出可能被截断，请使用精准的查询词",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description:
            "要在文件内容中搜索的正则表达式。可用交替（如 word1|word2|word3）或字符类一次搜索多个词。",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithoutPermission",
  systemMessageDescription: {
    prefix: `要在项目中执行 grep 搜索，请调用 ${BuiltInToolNames.GrepSearch} 工具并传入要匹配的查询模式。例如：`,
    exampleArgs: [["query", ".*main_services.*"]],
  },
  toolCallIcon: "MagnifyingGlassIcon",
};
