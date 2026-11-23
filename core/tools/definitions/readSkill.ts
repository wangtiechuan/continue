import { GetTool } from "../..";
import { loadMarkdownSkills } from "../../config/markdown/loadMarkdownSkills";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const readSkillTool: GetTool = async (params) => {
  const { skills } = await loadMarkdownSkills(params.ide);
  return {
    type: "function",
    displayTitle: "读取技能",
    wouldLikeTo: "读取技能 {{{ skillName }}}",
    isCurrently: "正在读取技能 {{{ skillName }}}",
    hasAlready: "已读取技能 {{{ skillName }}}",
    readonly: true,
    isInstant: true,
    group: BUILT_IN_GROUP_NAME,
    function: {
      name: BuiltInToolNames.ReadSkill,
      description: `
按名称读取技能内容。技能包含特定任务的详细操作说明。技能名称需与下方可用技能列表中的名称一致：
${skills.map((skill) => `\nname: ${skill.name}\ndescription: ${skill.description}\n`)}`,
      parameters: {
        type: "object",
        required: ["skillName"],
        properties: {
          skillName: {
            type: "string",
            description:
              "要读取的技能名称，需与可用技能列表中的名称一致。",
          },
        },
      },
    },
  };
};
