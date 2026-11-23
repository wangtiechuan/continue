import {
  MCPServer,
  mergeConfigYamlRequestOptions,
  RequestOptions,
  Rule,
} from "@continuedev/config-yaml";
import {
  InternalMcpOptions,
  InternalSseMcpOptions,
  InternalStdioMcpOptions,
  InternalStreamableHttpMcpOptions,
  RuleWithSource,
} from "../..";

export function convertYamlRuleToContinueRule(rule: Rule): RuleWithSource {
  if (typeof rule === "string") {
    // 字符串规则原本没有 name，导致设置页 Rules 的 on/off 开关失效
    // （toggle 需要 name 才触发，且空 name 会让所有匿名规则共用同一 policy key）。
    // 取内容前 20 字符做展示名，让每条规则可被单独开关。
    return {
      rule: rule,
      source: "rules-block",
      name: rule.replace(/\s+/g, " ").trim().slice(0, 20),
    };
  } else {
    return {
      source: "rules-block",
      rule: rule.rule,
      globs: rule.globs,
      name: rule.name,
      description: rule.description,
      sourceFile: rule.sourceFile,
      alwaysApply: rule.alwaysApply,
      invokable: rule.invokable ?? false,
    };
  }
}

export function convertYamlMcpConfigToInternalMcpOptions(
  config: MCPServer,
  globalRequestOptions?: RequestOptions,
): InternalMcpOptions {
  const { connectionTimeout, faviconUrl, name, sourceFile } = config;
  const shared = {
    id: name,
    name,
    faviconUrl: faviconUrl,
    timeout: connectionTimeout,
    sourceFile,
  };
  // Stdio
  if ("command" in config) {
    const { args, command, cwd, env, type } = config;
    const stdioOptions: InternalStdioMcpOptions = {
      ...shared,
      type,
      command,
      args,
      cwd,
      env,
    };
    return stdioOptions;
  }
  // HTTP/SSE
  const { type, url, apiKey, requestOptions } = config;
  const httpSseConfig:
    | InternalStreamableHttpMcpOptions
    | InternalSseMcpOptions = {
    ...shared,
    type,
    url,
    apiKey,
    requestOptions: mergeConfigYamlRequestOptions(
      requestOptions,
      globalRequestOptions,
    ),
  };
  return httpSseConfig;
}
