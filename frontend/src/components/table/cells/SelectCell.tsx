import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type SelectCellProps = {
  value: string | null
  choices: string[]
  onSave: (value: string | null) => void
}

export function SelectCell({ value, choices, onSave }: SelectCellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const openDropdown = useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      minWidth: Math.max(rect.width, 140),
      zIndex: 9999,
    })
    setIsOpen(true)
  }, [])

  // Use mousedown on document but check both button AND dropdown refs
  useEffect(() => {
    if (!isOpen) return
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node
      const clickedButton = buttonRef.current?.contains(target)
      const clickedDropdown = dropdownRef.current?.contains(target)
      // Only close if clicked completely outside both
      if (!clickedButton && !clickedDropdown) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  function handleToggle() {
    if (isOpen) {
      setIsOpen(false)
    } else {
      openDropdown()
    }
  }

  function handleSelect(choice: string) {
    onSave(choice === value ? null : choice)
    setIsOpen(false)
  }

  function handleClear() {
    onSave(null)
    setIsOpen(false)
  }

  const dropdown = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-lg shadow-lg py-1"
        >
          {value && (
            <>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClear}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50"
              >
                Clear
              </button>
              <div className="border-t border-gray-100 my-1" />
            </>
          )}
          {choices.map((choice) => (
            <button
              key={choice}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(choice)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  value === choice
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700'
                )}
              >
                {choice}
              </span>
            </button>
          ))}
        </div>,
        document.body
      )
    : null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-1 px-1.5 py-0.5 rounded text-sm',
          'hover:bg-gray-100 transition-colors min-w-20 min-h-7',
          'focus:outline-none w-full'
        )}
      >
        {value ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {value}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
        <ChevronDown className="w-3 h-3 text-gray-400 ml-auto shrink-0" />
      </button>

      {dropdown}
    </div>
  )
}