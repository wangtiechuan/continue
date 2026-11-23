import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const codebaseTool: Tool = {
  type: "function",
  displayTitle: "代码库搜索",
  wouldLikeTo: "在代码库中搜索：{{{ query }}}",
  isCurrently: "正在代码库中搜索：{{{ query }}}",
  hasAlready: "已在代码库中搜索：{{{ query }}}",
  readonly: true,
  isInstant: false,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.CodebaseTool,
    description:
      "对代码库进行语义搜索，根据自然语言查询返回相关代码片段。适合在理解或修改代码库之前查找相关代码上下文。",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description:
            "用自然语言描述要查找的内容（如认证逻辑、数据库连接设置、错误处理）",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `To search the codebase, use the ${BuiltInToolNames.CodebaseTool} tool with a natural language query. For example, to find authentication logic, you might respond with:`,
    exampleArgs: [
      ["query", "How is user authentication handled in this codebase?"],
    ],
  },
};
