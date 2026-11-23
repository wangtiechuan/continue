import {
  SharedConfigSchema,
  modifyAnyConfigWithSharedConfig,
} from "core/config/sharedConfig";
import { useContext, useEffect, useState } from "react";
import { Card, Toggle, useFontSize } from "../../../components/ui";
import { IdeMessengerContext } from "../../../context/IdeMessenger";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { updateConfig } from "../../../redux/slices/configSlice";
import { setLocalStorage } from "../../../util/localStorage";
import { ConfigHeader } from "../components/ConfigHeader";
import { UserSetting } from "../components/UserSetting";

export function UserSettingsSection() {
  /////// User settings section //////
  const dispatch = useAppDispatch();
  const ideMessenger = useContext(IdeMessengerContext);
  const config = useAppSelector((state) => state.config.config);

  const [showExperimental, setShowExperimental] = useState(false);

  function handleUpdate(sharedConfig: SharedConfigSchema) {
    // Optimistic update
    const updatedConfig = modifyAnyConfigWithSharedConfig(config, sharedConfig);
    dispatch(updateConfig(updatedConfig));
    // IMPORTANT no need for model role updates (separate logic for selected model roles)
    // simply because this function won't be used to update model roles

    // Actual update to core which propagates back with config update event
    ideMessenger.post("config/updateSharedConfig", sharedConfig);
  }

  // Disable autocomplete
  const disableAutocompleteInFiles = (
    config.tabAutocompleteOptions?.disableInFiles ?? []
  ).join(", ");
  const [formDisableAutocomplete, setFormDisableAutocomplete] = useState(
    disableAutocompleteInFiles,
  );

  useEffect(() => {
    // Necessary so that reformatted/trimmed values don't cause dirty state
    setFormDisableAutocomplete(disableAutocompleteInFiles);
  }, [disableAutocompleteInFiles]);

  // Workspace prompts
  const promptPath = config.experimental?.promptPath || "";

  // TODO defaults are in multiple places, should be consolidated and probably not explicit here
  const showSessionTabs = config.ui?.showSessionTabs ?? false;
  const continueAfterToolRejection =
    config.ui?.continueAfterToolRejection ?? false;
  const codeWrap = config.ui?.codeWrap ?? false;
  const showChatScrollbar = config.ui?.showChatScrollbar ?? false;
  const readResponseTTS = config.experimental?.readResponseTTS ?? false;
  const displayRawMarkdown = config.ui?.displayRawMarkdown ?? false;
  const disableSessionTitles = config.disableSessionTitles ?? false;
  const useCurrentFileAsContext =
    config.experimental?.useCurrentFileAsContext ?? false;
  const enableExperimentalTools =
    config.experimental?.enableExperimentalTools ?? false;
  const onlyUseSystemMessageTools =
    config.experimental?.onlyUseSystemMessageTools ?? false;
  const disableAgentFiles = config.experimental?.disableAgentFiles ?? false;
  const codebaseToolCallingOnly =
    config.experimental?.codebaseToolCallingOnly ?? false;
  const allowAnonymousTelemetry = config.allowAnonymousTelemetry ?? true;

  const useAutocompleteMultilineCompletions =
    config.tabAutocompleteOptions?.multilineCompletions ?? "auto";
  const modelTimeout = config.tabAutocompleteOptions?.modelTimeout ?? 150;
  const debounceDelay = config.tabAutocompleteOptions?.debounceDelay ?? 250;
  const fontSize = useFontSize();

  const cancelChangeDisableAutocomplete = () => {
    setFormDisableAutocomplete(disableAutocompleteInFiles);
  };
  const handleDisableAutocompleteSubmit = () => {
    handleUpdate({
      disableAutocompleteInFiles: formDisableAutocomplete
        .split(",")
        .map((val) => val.trim())
        .filter((val) => !!val),
    });
  };

  const disableTelemetryToggle = false;

  return (
    <div>
      <div className="flex flex-col">
        <ConfigHeader title="用户设置" />
        <div className="space-y-6">
          {/* Chat Interface Settings */}
          <div>
            <ConfigHeader title="聊天" variant="sm" />
            <Card>
              <div className="flex flex-col gap-4">
                <UserSetting
                  type="toggle"
                  title="显示会话标签页"
                  description="在聊天区上方显示标签页，用于组织和切换多个会话。"
                  value={showSessionTabs}
                  onChange={(value) => handleUpdate({ showSessionTabs: value })}
                />
                <UserSetting
                  type="toggle"
                  title="代码块自动换行"
                  description="代码块中的长行自动换行，而不是显示横向滚动条。"
                  value={codeWrap}
                  onChange={(value) => handleUpdate({ codeWrap: value })}
                />
                <UserSetting
                  type="toggle"
                  title="显示聊天滚动条"
                  description="在聊天窗口中显示滚动条。"
                  value={showChatScrollbar}
                  onChange={(value) =>
                    handleUpdate({ showChatScrollbar: value })
                  }
                />
                <UserSetting
                  type="toggle"
                  title="语音朗读回复"
                  description="用语音合成朗读模型的回复。"
                  value={readResponseTTS}
                  onChange={(value) => handleUpdate({ readResponseTTS: value })}
                />
                <UserSetting
                  type="toggle"
                  title="自动生成会话标题"
                  description="第一条消息后，由当前聊天模型自动为每个会话生成摘要标题。"
                  value={!disableSessionTitles}
                  onChange={(value) =>
                    handleUpdate({ disableSessionTitles: !value })
                  }
                />
                <UserSetting
                  type="toggle"
                  title="渲染 Markdown"
                  description="关闭后，回复以纯文本原始内容显示。"
                  value={!displayRawMarkdown}
                  onChange={(value) =>
                    handleUpdate({ displayRawMarkdown: !value })
                  }
                />
              </div>
            </Card>
          </div>

          {/* Appearance Settings */}
          <div>
            <ConfigHeader title="外观" variant="sm" />
            <Card>
              <div className="flex flex-col gap-4">
                <UserSetting
                  type="number"
                  title="字体大小"
                  description="界面元素的基础字体大小。"
                  value={fontSize}
                  onChange={(val) => {
                    setLocalStorage("fontSize", val);
                    handleUpdate({ fontSize: val });
                  }}
                  min={7}
                  max={50}
                />
              </div>
            </Card>
          </div>

          {/* Autocomplete Settings */}
          <div>
            <ConfigHeader title="自动补全" variant="sm" />
            <Card>
              <div className="flex flex-col gap-4">
                <UserSetting
                  type="select"
                  title="多行自动补全"
                  description="控制自动补全是否生成多行内容。"
                  value={useAutocompleteMultilineCompletions}
                  onChange={(value) =>
                    handleUpdate({
                      useAutocompleteMultilineCompletions: value as
                        | "auto"
                        | "always"
                        | "never",
                    })
                  }
                  options={[
                    { label: "自动", value: "auto" },
                    { label: "总是", value: "always" },
                    { label: "从不", value: "never" },
                  ]}
                />
                <UserSetting
                  type="number"
                  title="自动补全超时（毫秒）"
                  description="自动补全请求的最大等待时间，单位毫秒。"
                  value={modelTimeout}
                  onChange={(val) => handleUpdate({ modelTimeout: val })}
                  min={100}
                  max={5000}
                />
                <UserSetting
                  type="number"
                  title="自动补全防抖（毫秒）"
                  description="代码变更后触发自动补全请求的最小间隔时间，单位毫秒。"
                  value={debounceDelay}
                  onChange={(val) => handleUpdate({ debounceDelay: val })}
                  min={0}
                  max={2500}
                />
                <UserSetting
                  type="input"
                  title="在指定文件中禁用自动补全"
                  description="逗号分隔的 glob 匹配模式列表，匹配的文件不触发自动补全。"
                  placeholder="**/*.(txt,md)"
                  value={formDisableAutocomplete}
                  onChange={setFormDisableAutocomplete}
                  onSubmit={handleDisableAutocompleteSubmit}
                  onCancel={cancelChangeDisableAutocomplete}
                  isDirty={
                    formDisableAutocomplete !== disableAutocompleteInFiles
                  }
                  isValid={formDisableAutocomplete.trim() !== ""}
                />
              </div>
            </Card>
          </div>

          {/* Experimental Settings */}
          <div>
            <ConfigHeader title="实验功能" variant="sm" />
            <Card>
              <Toggle
                isOpen={showExperimental}
                onToggle={() => setShowExperimental(!showExperimental)}
                title="显示实验功能设置"
              >
                <div className="flex flex-col gap-x-1 gap-y-4">
                  <UserSetting
                    type="toggle"
                    title="默认添加当前文件"
                    description="每次新对话自动将当前打开的文件加入上下文。"
                    value={useCurrentFileAsContext}
                    onChange={(value) =>
                      handleUpdate({ useCurrentFileAsContext: value })
                    }
                  />
                  <UserSetting
                    type="toggle"
                    title="启用实验工具"
                    description="允许使用仍在开发中的实验性工具。"
                    value={enableExperimentalTools}
                    onChange={(value) =>
                      handleUpdate({ enableExperimentalTools: value })
                    }
                  />
                  <UserSetting
                    type="toggle"
                    title="仅使用系统消息工具"
                    description="Continue 不尝试使用原生函数调用，只通过系统消息方式调用工具。"
                    value={onlyUseSystemMessageTools}
                    onChange={(value) =>
                      handleUpdate({ onlyUseSystemMessageTools: value })
                    }
                  />
                  <UserSetting
                    type="toggle"
                    title="关闭 AGENTS.md/CLAUDE.md 自动加载"
                    description="不自动将工作区根目录的 agent 文件（AGENTS.md/AGENT.md/CLAUDE.md）作为常驻规则注入，为本地小模型节省上下文。"
                    value={disableAgentFiles}
                    onChange={(value) =>
                      handleUpdate({ disableAgentFiles: value })
                    }
                  />
                  <UserSetting
                    type="toggle"
                    title="@codebase：仅用工具调用检索"
                    description=" @codebase 上下文提供器只通过工具调用来检索代码。"
                    value={codebaseToolCallingOnly}
                    onChange={(value) =>
                      handleUpdate({ codebaseToolCallingOnly: value })
                    }
                  />
                  <UserSetting
                    type="toggle"
                    title="工具被拒绝后继续输出"
                    description="工具调用被拒绝后，继续输出模型回复。"
                    value={continueAfterToolRejection}
                    onChange={(value) =>
                      handleUpdate({ continueAfterToolRejection: value })
                    }
                  />
                </div>
              </Toggle>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
