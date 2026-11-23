import { ToolImpl } from ".";
import { fetchSearchResults } from "../../context/providers/WebContextProvider";
import { getStringArg } from "../parseArgs";

const DEFAULT_WEB_SEARCH_CHAR_LIMIT = 8000;

export const searchWebImpl: ToolImpl = async (args, extras) => {
  const query = getStringArg(args, "query");

  const webResults = await fetchSearchResults(query, 5, extras.fetch);

  // Track truncated results
  const truncatedResults: string[] = [];

  // Check and truncate each result
  const processedResults = webResults.map((result, index) => {
    if (result.content.length > DEFAULT_WEB_SEARCH_CHAR_LIMIT) {
      truncatedResults.push(
        result.name || result.description || `Result #${index + 1}`,
      );
      return {
        ...result,
        content: result.content.substring(0, DEFAULT_WEB_SEARCH_CHAR_LIMIT),
      };
    }
    return result;
  });

  // Add truncation warning if needed
  if (truncatedResults.length > 0) {
    processedResults.push({
      name: "截断提示",
      description: "",
      content: `以下搜索结果的内容因超出 ${DEFAULT_WEB_SEARCH_CHAR_LIMIT} 字符限制而被截断：${truncatedResults.join("、")}。如需更详细的信息，请尝试优化搜索查询。`,
    });
  }

  return processedResults;
};
