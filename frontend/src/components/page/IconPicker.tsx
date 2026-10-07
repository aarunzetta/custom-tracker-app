import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// temporary only hehe
const ICONS = [
  "📄",
  "📋",
  "📊",
  "📈",
  "📉",
  "📁",
  "🗂️",
  "✅",
  "🎯",
  "💡",
  "🔥",
  "⭐",
  "🏆",
  "🎨",
  "💰",
  "📅",
  "🕐",
  "🔖",
  "📌",
  "🧩",
  "🚀",
  "💼",
  "🛒",
  "🏋️",
  "📚",
  "🎵",
  "🌱",
  "❤️",
  "🔑",
  "🧪",
  "🌍",
  "💻",
  "🎮",
  "🏠",
  "✈️",
];

type IconPickerProps = {
  value: string | null;
  onChange: (icon: string) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "text-3xl w-12 h-12 flex items-center justify-center rounded-xl",
          "hover:bg-gray-100 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-gray-200",
        )}
        title="Change icon"
      >
        {value ?? "📄"}
      </button>

      {/* Picker dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full mt-2 z-50",
            "bg-white border border-gray-200 rounded-xl shadow-lg p-3",
            "w-64",
          )}
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 px-1">
            Choose icon
          </p>
          <div className="grid grid-cols-7 gap-1">
            {ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => {
                  onChange(icon);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg text-lg",
                  "hover:bg-gray-100 transition-colors",
                  value === icon && "bg-gray-100 ring-2 ring-gray-300",
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
