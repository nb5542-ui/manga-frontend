import { useEffect, useRef } from "react"

interface Props {
  panelNumber: number
  panelText: string
  onChange: (text: string) => void
  onNext: () => void
  onPrev: () => void
  onCreate: () => void
  hasNext: boolean
  hasPrev: boolean
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
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus when panel changes
  useEffect(() => {
    textareaRef.current?.focus()
  }, [panelNumber])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault()

      if (e.shiftKey) {
        onCreate()
      } else if (hasNext) {
        onNext()
      } else {
        onCreate() // auto create if last panel
      }
    }
  }

  return (
    <div
      className="
        animate-fade
        flex flex-col h-[75vh]
        bg-gradient-to-br from-zinc-900 to-zinc-950
        rounded-2xl
        p-8
        border border-zinc-800
        shadow-xl

        transition-all duration-300
        focus-within:border-zinc-600
        focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]
      "
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
        value={panelText}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="
          flex-1 w-full resize-none bg-transparent
          outline-none

          text-[18px]
          leading-8
          tracking-wide
          font-light

          text-zinc-100
          placeholder:text-zinc-600
          caret-white
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
