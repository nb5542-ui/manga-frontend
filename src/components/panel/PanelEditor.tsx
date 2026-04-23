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
  
  onGenerate?: (text: string) => void

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
  const [showNotes, setShowNotes] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

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
async function typeText(fullText: string) {
  setIsGenerating(true)

  let current = ""

  for (let i = 0; i < fullText.length; i++) {
    current += fullText[i]

    setLocalText(current)

    await new Promise((r) => setTimeout(r, 10)) // speed control
  }

  setIsGenerating(false)
}



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
const getNotes = () => {
  const match = panelText.match(/#notes([\s\S]*)/)
  return match ? match[1].trim() : ""
}

const setNotes = (notes: string) => {
  const cleaned = panelText.replace(/#notes([\s\S]*)/, "").trim()

  const newText =
    notes.trim().length > 0
      ? cleaned + "\n\n#notes\n" + notes
      : cleaned

  onChange(newText)
}



  return (
    <div
  className={`
    animate-fade flex flex-col h-[75vh]

    bg-gradient-to-b from-[#1a1f2b] to-[#10141c]
    rounded-2xl
    p-10

    border
    ${
  isFocused
    ? "border-accent shadow-[0_0_40px_rgba(255,107,45,0.2)]"
    : "border-borderMain shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
}
    backdrop-blur
      transition-all duration-300
      hover:scale-[1.01]

      relative overflow-hidden   // 
    `}
>
  <div
      className="
        absolute inset-0
        rounded-2xl
        pointer-events-none
        bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]
      "
    />
      {/* Header */}
      <div className="relative z-10 flex flex-col h-full">
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
        disabled={isGenerating}
        
        

        onKeyDown={handleKeyDown}
        
        className="
  w-full flex-1 resize-none bg-transparent outline-none

  text-zinc-200
  placeholder:text-zinc-600

  text-[17px]
  leading-[1.8]

  tracking-[0.01em]

  caret-white
  caret-accent

  selection:bg-white/20

  transition-colors duration-200
"
        placeholder="Write panel dialogue or narration..."
        
      />
      </div>
      {isGenerating && (
  <div className="text-accent text-sm mt-2 animate-pulse">
    AI is writing...
  </div>
)}
      
      {/* NOTES */}

<div className="mt-4 border-t border-zinc-800 pt-3">

  <button
    onClick={() => setShowNotes(!showNotes)}
    className="
      text-xs
      text-zinc-500
      hover:text-white
      mb-2
    "
  >
    {showNotes ? "Hide Notes" : "Show Notes"}
  </button>

  {showNotes && (

    <textarea
      value={getNotes()}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="Camera / Mood / Action / Notes..."
      className="
        w-full
        bg-zinc-900
        border border-zinc-800
        rounded
        p-2
        text-xs
        text-zinc-300
        outline-none
        resize-none
      "
      rows={4}
    />

  )}

</div>
{/* GENERATE BUTTON */}

<div className="mt-4 flex justify-end">

  <button
    className="
      px-4 py-2
      text-sm

      bg-white
      text-black

      rounded-md

      hover:bg-zinc-200
      active:scale-95

      transition-all
    "
    onClick={() => {
      console.log("Generate panel")
    }}
  >
    ⚡ Generate Panel
  </button>

</div>

      {/* Footer */}
      <div className="pt-4 text-xs text-zinc-600 border-t border-zinc-800 mt-6 flex justify-between">
        <span>Ctrl + Enter → Next / Auto Create</span>
        <span>Ctrl + Shift + Enter → Force New Panel</span>
      </div>
    </div>
  )
}
