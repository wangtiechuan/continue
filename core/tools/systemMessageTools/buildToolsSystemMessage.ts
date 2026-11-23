import { Tool } from "../..";
import { closeTag } from "./systemToolUtils";
import { SystemMessageToolsFramework } from "./types";

export const TOOL_INSTRUCTIONS_TAG = "<tool_use_instructions>";

export const generateToolsSystemMessage = (
  tools: Tool[],
  framework: SystemMessageToolsFramework,
): string => {
  if (tools.length === 0) {
    return "";
  }
  const withPredefinedMessage = tools.filter(
    (tool) => !!tool.systemMessageDescription,
  );

  const withDynamicMessage = tools.filter(
    (tool) => !tool.systemMessageDescription,
  );

  const instructions: string[] = [];
  instructions.push(TOOL_INSTRUCTIONS_TAG);
  instructions.push(framework.systemMessagePrefix);

  if (withPredefinedMessage.length > 0) {
    instructions.push(`\n以下工具可供你使用：`);
    for (const tool of withPredefinedMessage) {
      const definition = framework.createSystemMessageExampleCall(
        tool.function.name,
        tool.systemMessageDescription!.prefix,
        tool.systemMessageDescription!.exampleArgs,
      );
      instructions.push(`\n${definition}`);
    }
  }

  if (withDynamicMessage.length > 0) {
    instructions.push(
      `\n此外，以下额外的工具定义展示了你可以用相同语法调用的其他工具：`,
    );

    for (const tool of withDynamicMessage) {
      try {
        const definition = framework.toolToSystemToolDefinition(tool);
        instructions.push(`\n${definition}`);
      } catch (e) {
        console.error(
          "Failed to convert tool to system message tool:\n" +
            JSON.stringify(tool),
        );
      }
    }

    instructions.push(`\n例如，这个工具定义：\n`);
    instructions.push(framework.exampleDynamicToolDefinition);
    instructions.push("\n可以这样调用：\n");
    instructions.push(framework.exampleDynamicToolCall);
  }

  instructions.push("\n" + framework.systemMessageSuffix);

  instructions.push(`${closeTag(TOOL_INSTRUCTIONS_TAG)}`);
  return instructions.join("\n");
};

export function addSystemMessageToolsToSystemMessage(
  framework: SystemMessageToolsFramework,
  baseSystemMessage: string,
  systemMessageTools: Tool[],
): string {
  let systemMessage = baseSystemMessage;
  if (systemMessageTools.length > 0) {
    const toolsSystemMessage = generateToolsSystemMessage(
      systemMessageTools,
      framework,
    );
    systemMessage += `\n\n${toolsSystemMessage}`;
  }

  return systemMessage;
}
