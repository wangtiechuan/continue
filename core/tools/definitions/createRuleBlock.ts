import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

const NAME_ARG_DESC =
  "简短描述规则用途的名称（如 React 规范、类型提示）";
const RULE_ARG_DESC =
  "清晰、祈使语气的指令，供后续代码生成遵循（如 使用命名导出、添加 Python 类型提示）。每条规则只聚焦一个标准。";
const DESC_ARG_DESC =
  "规则何时适用的描述。Agent 请求型规则必填（由 AI 根据描述决定是否应用），其他类型可选。";
const GLOB_ARG_DESC =
  "可选，规则适用的文件 glob 模式（如 **/*.{ts,tsx} 或 src/**/*.ts）";
const REGEX_ARG_DESC =
  "可选，用于匹配文件内容的正则。仅当文件内容匹配时应用（如 useEffect 匹配 React hooks）";

const ALWAYS_APPLY_DESC =
  "是否始终应用该规则。Agent 请求型和手动型设为 false；始终型和自动附加型省略或设为 true。";

export const createRuleBlock: Tool = {
  type: "function",
  displayTitle: "新建规则",
  wouldLikeTo: '为 "{{{ name }}}" 新建规则',
  isCurrently: '正在为 "{{{ name }}}" 新建规则',
  hasAlready: '已为 "{{{ name }}}" 新建规则',
  readonly: false,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.CreateRuleBlock,
    description:
      '创建一条可在后续对话中引用的规则。当你希望确立始终遵循的代码规范/偏好，或避免再次犯某个错误时使用。修改已有规则请改用编辑工具。\n\n规则类型：\n- 始终型：仅包含 rule（始终注入模型上下文）\n- 自动附加型：包含 rule 和 globs/regex（文件匹配模式时注入）\n- Agent 请求型：包含 rule 和 description（AI 根据描述决定何时应用）\n- 手动型：仅包含 rule（仅在使用 @规则名 显式提到时注入）',
    parameters: {
      type: "object",
      required: ["name", "rule"],
      properties: {
        name: {
          type: "string",
          description: NAME_ARG_DESC,
        },
        rule: {
          type: "string",
          description: RULE_ARG_DESC,
        },
        description: {
          type: "string",
          description: DESC_ARG_DESC,
        },
        globs: {
          type: "string",
          description: GLOB_ARG_DESC,
        },
        regex: {
          type: "string",
          description: REGEX_ARG_DESC,
        },
        alwaysApply: {
          type: "boolean",
          description: ALWAYS_APPLY_DESC,
        },
      },
    },
  },
  defaultToolPolicy: "disabled",
  systemMessageDescription: {
    prefix: `Sometimes the user will provide feedback or guidance on your output. If you were not aware of these "rules", consider using the ${BuiltInToolNames.CreateRuleBlock} tool to persist the rule for future interactions.
This tool cannot be used to edit existing rules, but you can search in the ".continue/rules" folder and use the edit tool to manage rules.
To create a rule, respond with a ${BuiltInToolNames.CreateRuleBlock} tool call and the following arguments:
- name: ${NAME_ARG_DESC}
- rule: ${RULE_ARG_DESC}
- description: ${DESC_ARG_DESC}
- globs: ${GLOB_ARG_DESC}
- alwaysApply: ${ALWAYS_APPLY_DESC}
For example:`,
    exampleArgs: [
      ["name", "Use PropTypes"],
      [
        "rule",
        "Always use PropTypes when declaring React component properties",
      ],
      [
        "description",
        "Ensure that all prop types are explicitly declared for better type safety and code maintainability in React components.",
      ],
      ["globs", "**/*.js"],
      ["alwaysApply", "false"],
    ],
  },
  toolCallIcon: "PencilIcon",
};
