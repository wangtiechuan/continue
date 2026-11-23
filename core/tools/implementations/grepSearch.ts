import { ToolImpl } from ".";
import { ContextItem } from "../..";
import { ContinueError, ContinueErrorReason } from "../../util/errors";
import { formatGrepSearchResults } from "../../util/grepSearch";
import { prepareQueryForRipgrep } from "../../util/regexValidator";
import { getStringArg } from "../parseArgs";

const DEFAULT_GREP_SEARCH_RESULTS_LIMIT = 100;
const DEFAULT_GREP_SEARCH_CHAR_LIMIT = 7500; // ~1500 tokens, will keep truncation simply for now

function splitGrepResultsByFile(content: string): ContextItem[] {
  const matches = [...content.matchAll(/^\.\/([^\n]+)$/gm)];

  const contextItems: ContextItem[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const filepath = match[1];
    const startIndex = match.index!;
    const endIndex =
      i < matches.length - 1 ? matches[i + 1].index! : content.length;

    // Extract grepped content for this file
    const fileContent = content
      .substring(startIndex, endIndex)
      .replace(/^\.\/[^\n]+\n/, "") // remove the line with file path
      .trim();

    if (fileContent) {
      contextItems.push({
        name: `${filepath} 中的搜索结果`,
        description: `来自 ${filepath} 的 grep 搜索结果`,
        content: fileContent,
        uri: { type: "file", value: filepath },
      });
    }
  }

  return contextItems;
}

export const grepSearchImpl: ToolImpl = async (args, extras) => {
  const rawQuery = getStringArg(args, "query");

  const { query, warning } = prepareQueryForRipgrep(rawQuery);

  let results: string;
  try {
    results = await extras.ide.getSearchResults(
      query,
      DEFAULT_GREP_SEARCH_RESULTS_LIMIT,
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Helpful error for common ripgrep exit code
    if (errorMessage.includes("Process exited with code 2")) {
      return [
        {
          name: "搜索错误",
          description: "搜索查询无法处理",
          content: `搜索因无效的正则表达式模式而失败。\n\n原始查询：${rawQuery}\n处理后查询：${query}\n\n错误：${errorMessage}\n\n提示：如果要搜索含特殊字符的字面文本，查询已被自动转义。如需正则模式，请确保使用正确的正则语法。`,
        },
      ];
    }

    throw new ContinueError(
      ContinueErrorReason.SearchExecutionFailed,
      errorMessage,
    );
  }

  const { formatted, numResults, truncated } = formatGrepSearchResults(
    results,
    DEFAULT_GREP_SEARCH_CHAR_LIMIT,
  );

  if (numResults === 0) {
    return [
      {
        name: "搜索结果",
        description: "grep 搜索结果",
        content: "搜索未返回任何结果。",
      },
    ];
  }

  const truncationReasons: string[] = [];
  if (numResults === DEFAULT_GREP_SEARCH_RESULTS_LIMIT) {
    truncationReasons.push(
      `结果数超过 ${DEFAULT_GREP_SEARCH_RESULTS_LIMIT}`,
    );
  }
  if (truncated) {
    truncationReasons.push(
      `字符数超过 ${DEFAULT_GREP_SEARCH_CHAR_LIMIT}`,
    );
  }

  let contextItems: ContextItem[];

  const splitByFile: boolean = args?.splitByFile || false;
  if (splitByFile) {
    contextItems = splitGrepResultsByFile(formatted);
  } else {
    contextItems = [
      {
        name: "搜索结果",
        description: "grep 搜索结果",
        content: formatted,
      },
    ];
  }

  // Add warnings about query modifications or truncation
  const warnings: string[] = [];
  if (warning) {
    warnings.push(warning);
  }
  if (truncationReasons.length > 0) {
    warnings.push(
      `结果已截断，因为${truncationReasons.join("，且")}`,
    );
  }

  if (truncationReasons.length > 0) {
    contextItems.push({
      name: "截断提示",
      description: "",
      content: `上述搜索结果因${truncationReasons.join("，且")}而被截断。如果结果不理想，请尝试优化搜索查询。`,
    });
  }
  return contextItems;
};
