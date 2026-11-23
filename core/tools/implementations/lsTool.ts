import ignore from "ignore";

import { ToolImpl } from ".";
import { walkDir } from "../../indexing/walkDir";
import { ContinueError, ContinueErrorReason } from "../../util/errors";
import { resolveInputPath } from "../../util/pathResolver";

export function resolveLsToolDirPath(dirPath: string | undefined) {
  if (!dirPath || dirPath === ".") {
    return ".";
  }
  return dirPath.replace(/\\/g, "/");
}

const MAX_LS_TOOL_LINES = 200;

export const lsToolImpl: ToolImpl = async (args, extras) => {
  const dirPath = resolveLsToolDirPath(args?.dirPath);
  const resolvedPath = await resolveInputPath(extras.ide, dirPath);
  if (!resolvedPath) {
    throw new ContinueError(
      ContinueErrorReason.DirectoryNotFound,
      `目录 ${args.dirPath} 不存在或无法访问。可使用绝对路径、相对路径或以 ~ 开头的路径`,
    );
  }

  const entries = await walkDir(resolvedPath.uri, extras.ide, {
    returnRelativeUrisPaths: true,
    include: "both",
    recursive: args?.recursive ?? false,
    overrideDefaultIgnores: ignore(), // Show all directories including dist/, build/, etc.
  });

  const lines = entries.slice(0, MAX_LS_TOOL_LINES);

  let content =
    lines.length > 0
      ? lines.join("\n")
      : `${resolvedPath.displayPath} 中未找到文件/文件夹`;

  const contextItems = [
    {
      name: "文件/文件夹列表",
      description: `${resolvedPath.displayPath} 中的文件/文件夹`,
      content,
    },
  ];

  if (entries.length > MAX_LS_TOOL_LINES) {
    let warningContent = `${entries.length - MAX_LS_TOOL_LINES} 个 ls 条目被截断`;
    if (args?.recursive) {
      warningContent += "。请尝试使用非递归搜索";
    }
    contextItems.push({
      name: "截断提示",
      description: "",
      content: warningContent,
    });
  }

  return contextItems;
};
