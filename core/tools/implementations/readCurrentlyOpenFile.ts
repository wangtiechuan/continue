import { getUriDescription } from "../../util/uri";

import { ToolImpl } from ".";
import { throwIfFileIsSecurityConcern } from "../../indexing/ignore";
import { throwIfFileExceedsHalfOfContext } from "./readFileLimit";

export const readCurrentlyOpenFileImpl: ToolImpl = async (_, extras) => {
  const result = await extras.ide.getCurrentFile();

  if (result) {
    throwIfFileIsSecurityConcern(result.path);
    await throwIfFileExceedsHalfOfContext(
      result.path,
      result.contents,
      extras.config.selectedModelByRole.chat,
    );

    const { relativePathOrBasename, last2Parts, baseName } = getUriDescription(
      result.path,
      await extras.ide.getWorkspaceDirs(),
    );

    return [
      {
        name: `当前文件：${baseName}`,
        description: last2Parts,
        content: `\`\`\`${relativePathOrBasename}\n${result.contents}\n\`\`\``,
        uri: {
          type: "file",
          value: result.path,
        },
      },
    ];
  } else {
    return [
      {
        name: `无当前文件`,
        description: "",
        content: "当前没有打开的文件。",
      },
    ];
  }
};
