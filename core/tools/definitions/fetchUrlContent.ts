import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const fetchUrlContentTool: Tool = {
  type: "function",
  displayTitle: "读取网页",
  wouldLikeTo: "抓取 {{{ url }}}",
  isCurrently: "正在抓取 {{{ url }}}",
  hasAlready: "已抓取 {{{ url }}}",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.FetchUrlContent,
    description:
      "通过 URL 查看网站内容。不要用于读取本地文件。",
    parameters: {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string",
          description: "要读取的 URL",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `要获取 URL 内容，请使用 ${BuiltInToolNames.FetchUrlContent} 工具。例如，要读取网页内容，可以这样回复：`,
    exampleArgs: [["url", "https://example.com"]],
  },
  toolCallIcon: "GlobeAltIcon",
};
