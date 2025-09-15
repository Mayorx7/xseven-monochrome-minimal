interface ChatProps {
  item: {
    id: string;
    type: "post" | "chat";
    content: string;
    username: string;
    timestamp: Date;
  };
}

export const Chat = ({ item }: ChatProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-chat-bg border border-border rounded p-3 space-y-1">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-foreground">{item.username}</span>
        <span className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        {item.content}
      </p>
    </div>
  );
};