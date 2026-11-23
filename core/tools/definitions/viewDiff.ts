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
    prefix: `To view the current git diff, use the ${BuiltInToolNames.ViewDiff} tool. This will show you the changes made in the working directory compared to the last commit.`,
  },
  defaultToolPolicy: "allowedWithoutPermission",
  toolCallIcon: "CodeBracketIcon",
};
