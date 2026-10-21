import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
};

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 500,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const GAP = 6;

      let x = 0;
      let y = 0;

      switch (side) {
        case "top":
          x = rect.left + rect.width / 2;
          y = rect.top - GAP;
          break;
        case "bottom":
          x = rect.left + rect.width / 2;
          y = rect.bottom + GAP;
          break;
        case "left":
          x = rect.left - GAP;
          y = rect.top + rect.height / 2;
          break;
        case "right":
          x = rect.right + GAP;
          y = rect.top + rect.height / 2;
          break;
      }

      setCoords({ x, y });
      setVisible(true);
    }, delay);
  }

  function handleMouseLeave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const transformMap = {
    top: "translateX(-50%) translateY(-100%)",
    bottom: "translateX(-50%)",
    left: "translateX(-100%) translateY(-50%)",
    right: "translateY(-50%)",
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            className={cn(
              "fixed z-9999 pointer-events-none",
              "px-2 py-1 rounded-md text-xs font-medium",
              "bg-(--color-text-primary) text-(--color-bg)",
              "shadow-(--shadow-md)",
              "whitespace-nowrap",
            )}
            style={{
              left: coords.x,
              top: coords.y,
              transform: transformMap[side],
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
