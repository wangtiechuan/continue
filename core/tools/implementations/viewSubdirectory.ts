import generateRepoMap from "../../util/generateRepoMap";
import { resolveInputPath } from "../../util/pathResolver";

import { ToolImpl } from ".";
import { ContinueError, ContinueErrorReason } from "../../util/errors";
import { getStringArg } from "../parseArgs";

export const viewSubdirectoryImpl: ToolImpl = async (args: any, extras) => {
  const directory_path = getStringArg(args, "directory_path");

  const resolvedPath = await resolveInputPath(extras.ide, directory_path);

  if (!resolvedPath) {
    throw new ContinueError(
      ContinueErrorReason.DirectoryNotFound,
      `Directory path "${directory_path}" does not exist or is not accessible.`,
    );
  }

  // Check if the resolved path actually exists
  const exists = await extras.ide.fileExists(resolvedPath.uri);
  if (!exists) {
    throw new ContinueError(
      ContinueErrorReason.DirectoryNotFound,
      `Directory path "${directory_path}" does not exist or is not accessible.`,
    );
  }

  const repoMap = await generateRepoMap(extras.llm, extras.ide, {
    dirUris: [resolvedPath.uri],
    outputRelativeUriPaths: true,
    includeSignatures: false,
  });

  return [
    {
      name: "仓库地图",
      description: `${resolvedPath.displayPath} 的地图`,
      content: repoMap,
    },
  ];
};
