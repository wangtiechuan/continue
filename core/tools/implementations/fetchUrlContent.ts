import { ToolImpl } from ".";
import { getUrlContextItems } from "../../context/providers/URLContextProvider";
import { getStringArg } from "../parseArgs";

const DEFAULT_FETCH_URL_CHAR_LIMIT = 20000;

export const fetchUrlContentImpl: ToolImpl = async (args, extras) => {
  const url = getStringArg(args, "url");

  const contextItems = await getUrlContextItems(url, extras.fetch);

  // Track truncated content
  const truncatedUrls: string[] = [];

  // Check and truncate each context item
  const processedItems = contextItems.map((item) => {
    if (item.content.length > DEFAULT_FETCH_URL_CHAR_LIMIT) {
      truncatedUrls.push(url);
      return {
        ...item,
        content: item.content.substring(0, DEFAULT_FETCH_URL_CHAR_LIMIT),
      };
    }
    return item;
  });

  // Add truncation warning if needed
  if (truncatedUrls.length > 0) {
    processedItems.push({
      name: "截断提示",
      description: "",
      content: `来自 ${truncatedUrls.join("、")} 的内容因超出 ${DEFAULT_FETCH_URL_CHAR_LIMIT} 字符限制而被截断。如需更多内容，请尝试获取特定部分或使用更有针对性的方式。`,
    });
  }

  return processedItems;
};
