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
    prefix: `To fetch the content of a URL, use the ${BuiltInToolNames.FetchUrlContent} tool. For example, to read the contents of a webpage, you might respond with:`,
    exampleArgs: [["url", "https://example.com"]],
  },
  toolCallIcon: "GlobeAltIcon",
};
