import { useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { saveCurrentSession } from "../../redux/thunks/session";
import { useCompactConversation } from "../../util/compactConversation";
import { ToolTip } from "../gui/Tooltip";

const ContextStatus = () => {
  const dispatch = useAppDispatch();
  const contextPercentage = useAppSelector(
    (state) => state.session.contextPercentage,
  );
  const selectedChatModel = useAppSelector(
    (state) => state.config.config.selectedModelByRole.chat?.model,
  );
  const previousHistoryLength = useRef<number | null>(null);
  const previousSelectedChatModel = useRef<string | null>(null);
  const history = useAppSelector((state) => state.session.history);
  const percent = Math.round((contextPercentage ?? 0) * 100);
  const isPruned = useAppSelector((state) => state.session.isPruned);

  const isDifferentModelAndSameHistory = useMemo(() => {
    if (!selectedChatModel) return false;
    // only reset if history changes
    if (previousHistoryLength.current !== history.length) {
      previousHistoryLength.current = history.length;
      previousSelectedChatModel.current = selectedChatModel;
      return false;
    }
    return previousSelectedChatModel.current !== selectedChatModel;
  }, [history.length, selectedChatModel]);

  const compactConversation = useCompactConversation();

  // if user changed to a different model, we shouldn't show the context status until the user sends a new message
  if (isDifferentModelAndSameHistory) {
    return null;
  }

  const barColorClass = isPruned ? "bg-error" : "bg-yellow-400";
  // 用量低时低透明度常驻显示，不再整块隐藏
  const dimClass = !isPruned && percent < 60 ? "opacity-30" : "opacity-100";

  return (
    <div className={`flex items-center gap-1.5 ${dimClass}`}>
      <ToolTip
        closeEvents={{
          // blur: false,
          mouseleave: true,
          click: true,
          mouseup: false,
        }}
        clickable
        content={
          <div className="flex flex-col gap-0 text-left text-xs">
            <span className="inline-block">上下文已用 {percent}%</span>
            {isPruned && (
              <span className="inline-block">最早的几条消息已被自动裁剪。</span>
            )}
            {history.length > 0 && (
              <div className="flex flex-col gap-1 whitespace-pre">
                <div>
                  <span
                    className="hover:text-link inline-block cursor-pointer underline"
                    onClick={() => compactConversation(history.length - 1)}
                  >
                    压缩当前对话
                  </span>
                  {"\n"}
                  <span
                    className="hover:text-link inline-block cursor-pointer underline"
                    onClick={() => {
                      void dispatch(
                        saveCurrentSession({
                          openNewSession: true,
                          generateTitle: false,
                        }),
                      );
                    }}
                  >
                    新建会话
                  </span>
                </div>
              </div>
            )}
          </div>
        }
      >
        <div className="flex items-center gap-1.5">
          <div
            className="bg-bg-200 relative h-[3px] w-16 overflow-hidden rounded-full md:w-20"
            role="progressbar"
            aria-label="上下文用量"
            aria-valuenow={percent}
          >
            <div
              className={`${barColorClass} absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-in-out`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-description shrink-0 text-[10px] leading-none">
            {percent}%
          </span>
        </div>
      </ToolTip>
    </div>
  );
};

export default ContextStatus;
