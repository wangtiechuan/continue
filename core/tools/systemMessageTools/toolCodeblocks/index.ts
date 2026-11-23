import { Tool, ToolCallState } from "../../..";
import { SystemMessageToolsFramework } from "../types";
import { handleToolCallBuffer } from "./parseSystemToolCall";

export class SystemMessageToolCodeblocksFramework
  implements SystemMessageToolsFramework
{
  // Poor models are really bad at following instructions, alternate starts allowed:
  acceptedToolCallStarts: [string, string][] = [
    ["```tool\n", "```tool\n"],
    ["tool_name:", "```tool\nTOOL_NAME:"],
  ];

  toolCallStateToSystemToolCall(state: ToolCallState): string {
    let parts = ["```tool"];
    parts.push(`TOOL_NAME: ${state.toolCall.function.name}`);
    try {
      for (const arg in state.parsedArgs) {
        parts.push(`BEGIN_ARG: ${arg}`);
        parts.push(JSON.stringify(state.parsedArgs[arg]));
        parts.push(`END_ARG`);
      }
    } catch (e) {
      console.log("Failed to stringify json args", state.parsedArgs);
    }
    // TODO - include tool call id for parallel. Confuses dumb models
    parts.push("```");
    return parts.join("\n");
  }

  handleToolCallBuffer = handleToolCallBuffer;

  toolToSystemToolDefinition(tool: Tool): string {
    let toolDefinition = `\`\`\`tool_definition\nTOOL_NAME: ${tool.function.name}\n`;

    if (tool.function.description) {
      toolDefinition += `TOOL_DESCRIPTION:\n${tool.function.description}\n`;
    }

    if (tool.function.parameters && "properties" in tool.function.parameters) {
      for (const [key, value] of Object.entries(
        tool.function.parameters.properties as object,
      )) {
        const isRequired = tool.function.parameters.required?.includes(key);
        const requiredText = isRequired ? "required" : "optional";

        let argType = "string";
        if ("type" in value) {
          argType = value.type;
        }
        let argDescription = "";
        if ("description" in value) {
          argDescription = value.description;
        }

        toolDefinition += `TOOL_ARG: ${key} (${argType}, ${requiredText})\n`;
        if (argDescription) {
          toolDefinition += argDescription + "\n";
        }
        toolDefinition += `END_ARG\n`;
      }
    }

    toolDefinition += `\`\`\``;
    return toolDefinition.trim();
  }

  systemMessagePrefix = `你可以使用工具。要调用工具，你必须严格按照下方展示的工具代码块格式回复。

关键：请严格遵循此语法。不要使用 XML 标签、JSON 对象或任何其他格式来调用工具。`;

  systemMessageSuffix = `工具使用规则：
1. 调用工具时，严格按照上方展示的格式输出工具代码块。
2. 代码块必须从新行开始。
3. 每次只能调用一个工具。
4. 工具代码块必须是回复中的最后内容。输出闭合标记后立即停止。
5. 不要用 XML 标签（如 <tool_call> 或 <function=...>）包装工具调用。
6. 不要用 JSON 格式调用工具。
7. 不要编造上方未列出的工具。
8. 如果用户的需求可以用已列出的工具解决，请使用工具，不要凭空猜测。
9. 不要对假设存在的文件执行操作。使用工具来查找相关文件。`;

  exampleDynamicToolDefinition = `
\`\`\`tool_definition
TOOL_NAME: example_tool
TOOL_ARG: arg_1 (string, required)
Description of the first argument
END_ARG
TOOL_ARG: arg_2 (number, optional)
END_ARG
\`\`\``.trim();

  exampleDynamicToolCall = `
\`\`\`tool
TOOL_NAME: example_tool
BEGIN_ARG: arg_1
The value
of arg 1
END_ARG
BEGIN_ARG: arg_2
3
END_ARG
\`\`\``.trim();

  createSystemMessageExampleCall(
    toolName: string,
    prefix: string,
    exampleArgs: Array<[string, string | number]> = [],
  ) {
    let callExample = `\`\`\`tool
TOOL_NAME: ${toolName}`;

    // Add each argument dynamically
    for (const [argName, argValue] of exampleArgs) {
      callExample += `
BEGIN_ARG: ${argName}
${argValue}
END_ARG`;
    }

    callExample += `
\`\`\``;

    return `${prefix.trim()}
${callExample}`;
  }
}
