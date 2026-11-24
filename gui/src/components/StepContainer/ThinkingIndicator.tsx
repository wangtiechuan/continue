import { ChatHistoryItem } from "core";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectSelectedChatModel } from "../../redux/slices/configSlice";

interface ThinkingIndicatorProps {
  historyItem: ChatHistoryItem;
}
/*
    Thinking animation
    Shows for O1-family models, or when reasoning is explicitly enabled
*/
const ThinkingIndicator = ({ historyItem }: ThinkingIndicatorProps) => {
  // Animation for thinking ellipsis
  const [animation, setAnimation] = useState(2);
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimation((prevState) => (prevState === 2 ? 0 : prevState + 1));
    }, 600);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const selectedModel = useAppSelector(selectSelectedChatModel);
  const isStreaming = useAppSelector((state) => state.session.isStreaming);
  const hasReasoningEnabled = useAppSelector(
    (state) => state.session.hasReasoningEnabled,
  );

  const hasContent = Array.isArray(historyItem.message.content)
    ? !!historyItem.message.content.length
    : !!historyItem.message.content;
  const isO1 = selectedModel?.model.startsWith("o1");
  const isReasoningEnabled = hasReasoningEnabled ?? false;
  const isThinking =
    isStreaming && !historyItem.isGatheringContext && !hasContent;
  // O1 模型始终显示；普通模型在用户显式开启思考时显示
  if (!isThinking || (!isO1 && !isReasoningEnabled)) {
    return null;
  }

  return (
    <div className="px-2 py-2">
      <span className="text-lightgray">{`思考中${".".repeat(animation)}`}</span>
    </div>
  );
};

export default ThinkingIndicator;
