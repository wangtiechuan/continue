import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const readCurrentlyOpenFileTool: Tool = {
  type: "function",
  displayTitle: "读取当前打开的文件",
  wouldLikeTo: "读取当前打开的文件",
  isCurrently: "正在读取当前打开的文件",
  hasAlready: "已读取当前打开的文件",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ReadCurrentlyOpenFile,
    description:
      "读取 IDE 中当前打开的文件。如果用户提到的文件你看不到，或操作的内容似乎缺失，尝试用这个工具。",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `To view the user's currently open file, use the ${BuiltInToolNames.ReadCurrentlyOpenFile} tool.
If the user is asking about a file and you don't see any code, use this to check the current file`,
  },
  toolCallIcon: "DocumentTextIcon",
};
