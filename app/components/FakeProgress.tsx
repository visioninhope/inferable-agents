import React from "react";
import { useNProgress } from "@tanem/react-nprogress";
import { useDebounce } from "@uidotdev/usehooks";

export function FakeProgress({
  status,
  timeConstant = 10000,
}: {
  status: string;
  timeConstant?: number;
}) {
  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating: status !== "Ready",
  });

  return (
    <div>
      <div
        className="bg-gray-300 h-[1px] shadow-lg"
        style={{
          width: `${Math.floor(progress * 100)}%`,
          transition: `width ${animationDuration}ms ease-in-out`,
        }}
      ></div>
    </div>
  );
}
