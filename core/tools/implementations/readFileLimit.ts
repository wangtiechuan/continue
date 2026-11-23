import { ILLM } from "../..";
import { countTokensAsync } from "../../llm/countTokens";
import { ContinueError, ContinueErrorReason } from "../../util/errors";

export async function throwIfFileExceedsHalfOfContext(
  filepath: string,
  content: string,
  model: ILLM | null,
) {
  if (model) {
    const tokens = await countTokensAsync(content, model.title);
    const tokenLimit = model.contextLength / 2;
    if (tokens > tokenLimit) {
      throw new ContinueError(
        ContinueErrorReason.FileTooLarge,
      `文件 ${filepath} 过大（${tokens} tokens，超出 ${tokenLimit} token 限制）。请尝试其他方式`,
      );
    }
  }
}
