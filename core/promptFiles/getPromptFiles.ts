import path from "path";
import {
  DEFAULT_PROMPTS_FOLDER_V1,
  DEFAULT_PROMPTS_FOLDER_V2,
  DEFAULT_RULES_FOLDER,
  RULES_DIR_NAME,
} from ".";
import { IDE } from "..";
import { walkDir } from "../indexing/walkDir";
import { getContinueGlobalPath, readAllGlobalPromptFiles } from "../util/paths";
import { joinPathsToUri } from "../util/uri";

export async function getPromptFilesFromDir(
  ide: IDE,
  dir: string,
): Promise<{ path: string; content: string }[]> {
  try {
    const exists = await ide.fileExists(dir);

    if (!exists) {
      return [];
    }

    const uris = await walkDir(dir, ide, {
      source: "get dir prompt files",
    });
    const promptFilePaths = uris.filter(
      (p) => p.endsWith(".prompt") || p.endsWith(".md"),
    );
    const results = promptFilePaths.map(async (uri) => {
      const content = await ide.readFile(uri); // make a try catch
      return { path: uri, content };
    });
    return Promise.all(results);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getAllPromptFiles(
  ide: IDE,
  overridePromptFolder?: string,
  checkV1DefaultFolder: boolean = false,
): Promise<
  { path: string; content: string; workspaceScoped?: boolean }[]
> {
  const workspaceDirs = await ide.getWorkspaceDirs();
  let promptFiles: {
    path: string;
    content: string;
    workspaceScoped: boolean;
  }[] = [];

  let dirsToCheck = [DEFAULT_PROMPTS_FOLDER_V2, DEFAULT_RULES_FOLDER];
  if (checkV1DefaultFolder) {
    dirsToCheck.push(DEFAULT_PROMPTS_FOLDER_V1);
  }
  if (overridePromptFolder) {
    dirsToCheck = [overridePromptFolder];
  }

  const fullDirs = workspaceDirs
    .map((dir) => dirsToCheck.map((d) => joinPathsToUri(dir, d)))
    .flat();

  // fullDirs 全部来自工作区目录，属于项目级提示词
  promptFiles = (
    await Promise.all(
      fullDirs.map(async (dir) => {
        const files = await getPromptFilesFromDir(ide, dir);
        return files.map((file) => ({
          path: file.path,
          content: file.content,
          workspaceScoped: true,
        }));
      }),
    )
  ).flat();

  // 全局 ~/.continue/prompts 和 ~/.continue/rules 不属于项目级
  promptFiles.push(
    ...readAllGlobalPromptFiles().map((file) => ({
      path: file.path,
      content: file.content,
      workspaceScoped: false,
    })),
  );

  const promptFilesFromRulesDirectory = readAllGlobalPromptFiles(
    path.join(getContinueGlobalPath(), RULES_DIR_NAME),
  );
  promptFiles.push(
    ...promptFilesFromRulesDirectory.map((file) => ({
      path: file.path,
      content: file.content,
      workspaceScoped: false,
    })),
  );

  const result = await Promise.all(
    promptFiles.map(async (file) => {
      const content = await ide.readFile(file.path);
      return {
        path: file.path,
        content,
        workspaceScoped: (file as { workspaceScoped?: boolean }).workspaceScoped,
      };
    }),
  );
  return result;
}
