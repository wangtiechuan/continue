import {
  CheckIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { MessageModes } from "core";
import { isRecommendedAgentModel } from "core/llm/toolSupport";
import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectSelectedChatModel } from "../../redux/slices/configSlice";
import { setMode } from "../../redux/slices/sessionSlice";
import { getFontSize, getMetaKeyLabel } from "../../util";
import { ToolTip } from "../gui/Tooltip";
import { useMainEditor } from "../mainInput/TipTapEditor";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "../ui";
import { ModeIcon } from "./ModeIcon";

export function ModeSelect() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((store) => store.session.mode);
  const selectedModel = useAppSelector(selectSelectedChatModel);

  const isGoodAtAgentMode = useMemo(() => {
    if (!selectedModel) {
      return undefined;
    }
    return isRecommendedAgentModel(selectedModel.model);
  }, [selectedModel]);

  const { mainEditor } = useMainEditor();
  const metaKeyLabel = useMemo(() => {
    return getMetaKeyLabel();
  }, []);

  const cycleMode = useCallback(() => {
    if (mode === "chat") {
      dispatch(setMode("plan"));
    } else if (mode === "plan") {
      dispatch(setMode("agent"));
    } else {
      dispatch(setMode("chat"));
    }
    // Only focus main editor if another one doesn't already have focus
    if (!document.activeElement?.classList?.contains("ProseMirror")) {
      mainEditor?.commands.focus();
    }
  }, [mode, mainEditor]);

  const selectMode = useCallback(
    (newMode: MessageModes) => {
      if (newMode === mode) {
        return;
      }

      dispatch(setMode(newMode));

      mainEditor?.commands.focus();
    },
    [mode, mainEditor],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "." && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void cycleMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cycleMode]);

  const notGreatAtAgent = (mode: string) => (
    <>
      <ToolTip
        style={{
          zIndex: 200001, // in front of listbox
        }}
        className="flex items-center gap-1"
        content={`${mode} 模式对这个模型可能不好用。`}
      >
        <ExclamationTriangleIcon className="text-warning h-2.5 w-2.5" />
      </ToolTip>
    </>
  );

  return (
    <Listbox value={mode} onChange={selectMode}>
      <div className="relative">
        <ListboxButton
          data-testid="mode-select-button"
          className="xs:px-2 text-description bg-lightgray/20 gap-1 rounded-full border-none px-1.5 py-0.5 transition-colors duration-200 hover:brightness-110"
        >
          <ModeIcon mode={mode} />
          <span className="hidden sm:block">
            {mode === "chat" ? "聊天" : mode === "agent" ? "助手" : "规划"}
          </span>
          <ChevronDownIcon
            className="h-2 w-2 flex-shrink-0"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions className="min-w-32 max-w-48">
          <ListboxOption value="chat">
            <div className="flex flex-row items-center gap-1.5">
              <ModeIcon mode="chat" />
              <span className="">聊天</span>
              <ToolTip
                style={{
                  zIndex: 200001,
                }}
                content="所有工具已禁用"
              >
                <InformationCircleIcon
                  data-tooltip-id="chat-tip"
                  className="h-2.5 w-2.5 flex-shrink-0"
                />
              </ToolTip>
              <span
                className={`text-description-muted text-[${getFontSize() - 3}px] mr-auto`}
              >
                {getMetaKeyLabel()}L
              </span>
            </div>
            {mode === "chat" && <CheckIcon className="ml-auto h-3 w-3" />}
          </ListboxOption>
          <ListboxOption value="plan" className={"gap-1"}>
            <div className="flex flex-row items-center gap-1.5">
              <ModeIcon mode="plan" />
              <span className="">规划</span>
              <ToolTip
                style={{
                  zIndex: 200001,
                }}
                content="只读/MCP 工具可用"
              >
                <InformationCircleIcon className="h-2.5 w-2.5 flex-shrink-0" />
              </ToolTip>
            </div>
            {!isGoodAtAgentMode && notGreatAtAgent("规划")}
            <CheckIcon
              className={`ml-auto h-3 w-3 ${mode === "plan" ? "" : "opacity-0"}`}
            />
          </ListboxOption>

          <ListboxOption value="agent" className={"gap-1"}>
            <div className="flex flex-row items-center gap-1.5">
              <ModeIcon mode="agent" />
              <span className="">助手</span>
              <ToolTip
                style={{
                  zIndex: 200001,
                }}
                content="所有工具可用"
              >
                <InformationCircleIcon className="h-2.5 w-2.5 flex-shrink-0" />
              </ToolTip>
            </div>
            {!isGoodAtAgentMode && notGreatAtAgent("助手")}
            <CheckIcon
              className={`ml-auto h-3 w-3 ${mode === "agent" ? "" : "opacity-0"}`}
            />
          </ListboxOption>

          <div className="text-description-muted px-2 py-1">
            {`${metaKeyLabel} . 切换下一个模式`}
          </div>
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
