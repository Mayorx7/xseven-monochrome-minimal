interface PostProps {
  item: {
    id: string;
    type: "post" | "chat";
    content: string;
    username: string;
    timestamp: Date;
  };
}

export const Post = ({ item }: PostProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-post-bg border-2 border-post-border p-4 space-y-2">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-foreground">{item.username}</span>
        <span className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</span>
      </div>
      <p className="text-base font-bold text-foreground leading-relaxed">
        {item.content}
      </p>
    </div>
  );
};