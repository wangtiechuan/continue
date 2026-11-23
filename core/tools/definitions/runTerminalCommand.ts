import os from "os";
import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import {
  evaluateTerminalCommandSecurity,
  ToolPolicy,
} from "@continuedev/terminal-security";

/**
 * Get the preferred shell for the current platform
 * @returns The preferred shell command or path
 */
function getPreferredShell(): string {
  const platform = os.platform();

  if (platform === "win32") {
    return "powershell.exe";
  } else if (platform === "darwin") {
    return process.env.SHELL || "/bin/zsh";
  } else {
    // Linux and other Unix-like systems
    return process.env.SHELL || "/bin/bash";
  }
}

const PLATFORM_INFO = `请选择适配 ${os.platform()}/${os.arch()} 平台和 ${getPreferredShell()} shell 的终端命令。`;

const RUN_COMMAND_NOTES = `shell 不保存状态，不会记住之前的命令。\
      命令在后台运行时，务必建议用 shell 命令停止，不要建议 Ctrl+C。\
      后续 shell 命令务必放在 shell 命令代码块里。\
      不要执行需要特殊/管理员权限的操作。\
      重要：编辑文件请用 Edit/MultiEdit 工具，不要用 sed、awk 等 bash 命令。\
      ${PLATFORM_INFO}`;

export const runTerminalCommandTool: Tool = {
  type: "function",
  displayTitle: "运行终端命令",
  wouldLikeTo: "运行以下终端命令：",
  isCurrently: "正在运行以下终端命令：",
  hasAlready: "已运行以下终端命令：",
  readonly: false,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.RunTerminalCommand,
    description: `在当前工作区根目录下运行终端命令。\n${RUN_COMMAND_NOTES}`,
    parameters: {
      type: "object",
      required: ["command"],
      properties: {
        command: {
          type: "string",
          description:
            "要运行的命令，会直接交给 IDE shell 执行。",
        },
        waitForCompletion: {
          type: "boolean",
          description:
            "是否等待命令完成后再返回，默认 true。设为 false 在后台运行，设为 true 在前台运行并等待输出。",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  evaluateToolCallPolicy: (
    basePolicy: ToolPolicy,
    parsedArgs: Record<string, unknown>,
  ): ToolPolicy => {
    return evaluateTerminalCommandSecurity(
      basePolicy,
      parsedArgs.command as string,
    );
  },
  systemMessageDescription: {
    prefix: `要运行终端命令，请使用 ${BuiltInToolNames.RunTerminalCommand} 工具
${RUN_COMMAND_NOTES}
也可选传 waitForCompletion 参数并设为 false，让命令在后台运行。
例如，查看 git 日志可以这样回复：`,
    exampleArgs: [["command", "git log"]],
  },
};
