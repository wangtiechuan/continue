import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const searchWebTool: Tool = {
  type: "function",
  displayTitle: "搜索网页",
  wouldLikeTo: '搜索网页 "{{{ query }}}"',
  isCurrently: '正在搜索网页 "{{{ query }}}"',
  hasAlready: '已搜索网页 "{{{ query }}}"',
  readonly: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.SearchWeb,
    description:
      "执行网页搜索并返回靠前的结果。请少用，仅在需要专业、外部或最新知识时使用。常规编程问题无需搜索网页。",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "自然语言搜索词",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithoutPermission",
  systemMessageDescription: {
    prefix: `To search the web, use the ${BuiltInToolNames.SearchWeb} tool with a natural language query. For example, to search for the current weather, you would respond with:`,
    exampleArgs: [["query", "What is the current weather in San Francisco?"]],
  },
  toolCallIcon: "GlobeAltIcon",
};
