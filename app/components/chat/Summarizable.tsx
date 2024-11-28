import React from "react";

export function Summarizable({
  text,
  createdAt,
  children,
}: {
  text: string;
  createdAt: Date;
  children: React.ReactNode;
}) {
  const fifteenSecondsAgo = new Date(Date.now() - 15000);

  if (new Date(createdAt) < fifteenSecondsAgo) {
    return <p className="text-xs text-muted-foreground pl-6">{text}</p>;
  }

  return children;
}
