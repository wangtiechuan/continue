import { ToolImpl } from ".";
import { ContextItem } from "../..";
import { getDiffsFromCache } from "../../autocomplete/snippets/gitDiffCache";

export const DEFAULT_GIT_DIFF_LINE_LIMIT = 5000;

export const viewDiffImpl: ToolImpl = async (args, extras) => {
  const diffs = await getDiffsFromCache(extras.ide); // const diffs = await extras.ide.getDiff(true);
  // TODO includeUnstaged should be an option

  const combinedDiff = diffs.join("\n");

  if (!combinedDiff.trim()) {
    return [
      {
        name: "Diff",
        description: "当前 Git 差异",
        content: "当前没有未提交的改动",
      },
    ];
  }

  const diffLines = combinedDiff.split("\n");

  let truncated = false;
  let processedDiff = combinedDiff;

  if (diffLines.length > DEFAULT_GIT_DIFF_LINE_LIMIT) {
    truncated = true;
    processedDiff = diffLines.slice(0, DEFAULT_GIT_DIFF_LINE_LIMIT).join("\n");
  }

  const contextItems: ContextItem[] = [
    {
      name: "差异对比",
      description: "当前 git 差异",
      content: processedDiff,
    },
  ];

  if (truncated) {
    contextItems.push({
      name: "截断提示",
      description: "",
      content: `git 差异因超出 ${DEFAULT_GIT_DIFF_LINE_LIMIT} 行而被截断。请尝试查看特定文件或聚焦更小的改动范围。`,
    });
  }

  return contextItems;
};
