import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const viewRepoMapTool: Tool = {
  type: "function",
  displayTitle: "查看仓库地图",
  wouldLikeTo: "查看仓库地图",
  isCurrently: "正在获取仓库地图",
  hasAlready: "已查看仓库地图",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ViewRepoMap,
    description: "查看仓库目录结构地图",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  systemMessageDescription: {
    prefix: `To view the repository map, use the ${BuiltInToolNames.ViewRepoMap} tool. This will provide a visual representation of the project's structure and organization.`,
  },
  defaultToolPolicy: "allowedWithPermission",
  toolCallIcon: "MapIcon",
};
