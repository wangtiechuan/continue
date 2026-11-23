import { ToolImpl } from ".";
import { ContextItem } from "../..";
import { getStringArg } from "../parseArgs";

const MAX_AGENT_GLOB_RESULTS = 100;

export const fileGlobSearchImpl: ToolImpl = async (args, extras) => {
  const pattern = getStringArg(args, "pattern");
  const results = await extras.ide.getFileResults(
    pattern,
    MAX_AGENT_GLOB_RESULTS,
  );

  if (results.length === 0) {
    return [
      {
        name: "文件结果",
        description: "glob 搜索",
        content: "glob 搜索未返回任何结果。",
      },
    ];
  }
  const contextItems: ContextItem[] = [
    {
      name: "文件结果",
      description: "glob 搜索",
      content: results.join("\n"),
    },
  ];

  // In case of truncation, add a warning
  if (results.length === MAX_AGENT_GLOB_RESULTS) {
    contextItems.push({
      name: "截断提示",
      description: "",
      content: `提示：上述结果被截断为前 ${MAX_AGENT_GLOB_RESULTS} 个文件。如果结果不理想，请优化搜索模式`,
    });
  }

  return contextItems;
};
