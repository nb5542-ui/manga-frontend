import { useEffect, useRef, useState } from "react"

interface Props {
  panelNumber: number
  panelText: string
  onChange: (text: string) => void
  onNext: () => void
  onPrev: () => void
  onCreate: () => void
  hasNext: boolean
  hasPrev: boolean
  onUndo?: () => void
  onRedo?: () => void

}


export default function PanelEditor({
  panelNumber,
  panelText,
  onChange,
  onNext,
  onPrev,
  onCreate,
  hasNext,
  hasPrev,
  onUndo,
  onRedo,
}: Props) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localText, setLocalText] = useState(panelText)

  useEffect(() => {
  setLocalText(panelText)
}, [panelNumber, panelText])
useEffect(() => {
  const timeout = setTimeout(() => {
    if (localText !== panelText) {
      onChange(localText)
    }
  }, 500)

  return () => clearTimeout(timeout)
}, [localText])



  // Auto-focus when panel changes
  useEffect(() => {
    textareaRef.current?.focus()
  }, [panelNumber])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  const isMac = navigator.platform.toUpperCase().includes("MAC")
  const ctrlKey = isMac ? e.metaKey : e.ctrlKey

  if (ctrlKey && e.key === "z") {
    e.preventDefault()

    if (e.shiftKey) {
      onRedo?.()
    } else {
      onUndo?.()
    }

    return
  }

  // existing logic
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault()

    if (e.shiftKey) {
      onCreate()
    } else if (hasNext) {
      onNext()
    } else {
      onCreate()
    }
  }
}



  return (
    <div
  className={`
    animate-fade flex flex-col h-[75vh]

    bg-gradient-to-br from-zinc-900 via-zinc-900 to-black
    rounded-2xl
    p-10

    border
    ${
      isFocused
        ? "border-zinc-500 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_20px_60px_rgba(0,0,0,0.9)]"
        : "border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
    }

    backdrop-blur-sm
    transition-all duration-300
  `}
>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-zinc-500">
          Panel {panelNumber}
        </div>

        <div className="flex gap-4 text-xs text-zinc-600">
          {hasPrev && (
            <button
              onClick={onPrev}
              className="hover:text-zinc-300 transition"
            >
              ← Prev
            </button>
          )}

          {hasNext && (
            <button
              onClick={onNext}
              className="hover:text-zinc-300 transition"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Writing Area */}
      <textarea
        ref={textareaRef}
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        

        onKeyDown={handleKeyDown}
        className="
  w-full flex-1 resize-none bg-transparent outline-none

  text-zinc-200
  placeholder:text-zinc-600

  text-[17px]
  leading-[1.8]

  tracking-[0.01em]

  caret-white

  selection:bg-white/20

  transition-colors duration-200
"
        placeholder="Write panel dialogue or narration..."
      />

      {/* Footer */}
      <div className="pt-4 text-xs text-zinc-600 border-t border-zinc-800 mt-6 flex justify-between">
        <span>Ctrl + Enter → Next / Auto Create</span>
        <span>Ctrl + Shift + Enter → Force New Panel</span>
      </div>
    </div>
  )
}
