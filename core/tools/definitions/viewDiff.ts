import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const viewDiffTool: Tool = {
  type: "function",
  displayTitle: "查看差异",
  wouldLikeTo: "查看 git diff",
  isCurrently: "正在获取 git diff",
  hasAlready: "已查看 git diff",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ViewDiff,
    description: "查看当前工作区改动的 diff",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  systemMessageDescription: {
    prefix: `要查看当前 git 差异，请使用 ${BuiltInToolNames.ViewDiff} 工具。它会显示工作区与上次提交相比的改动内容。`,
  },
  defaultToolPolicy: "allowedWithoutPermission",
  toolCallIcon: "CodeBracketIcon",
};
