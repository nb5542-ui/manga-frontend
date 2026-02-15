import { useState, useRef, useEffect } from "react"
import PanelEditor from "../components/panel/PanelEditor"

interface Panel {
  id: string
  text: string
}

interface Chapter {
  id: string
  title: string
  panels: Panel[]
}

export default function EditorPage() {
  /* -----------------------------
     STATE
  ----------------------------- */

  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "chapter-1",
      title: "Chapter 1",
      panels: [{ id: "panel-1", text: "" }],
    },
  ])

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0)

  const currentChapter = chapters[currentChapterIndex]
  const currentPanels = currentChapter?.panels ?? []
  const currentPanel = currentPanels[currentPanelIndex]

  /* -----------------------------
     SAFE GUARD
  ----------------------------- */

  useEffect(() => {
    if (currentPanelIndex >= currentPanels.length) {
      setCurrentPanelIndex(currentPanels.length - 1)
    }
  }, [currentPanels.length])

  /* -----------------------------
     PANEL ACTIONS (IMMUTABLE)
  ----------------------------- */

  const updatePanelText = (text: string) => {
    setChapters((prev) =>
      prev.map((chapter, cIndex) =>
        cIndex === currentChapterIndex
          ? {
              ...chapter,
              panels: chapter.panels.map((panel, pIndex) =>
                pIndex === currentPanelIndex
                  ? { ...panel, text }
                  : panel
              ),
            }
          : chapter
      )
    )
  }

  const goNext = () => {
    if (currentPanelIndex < currentPanels.length - 1) {
      setCurrentPanelIndex((prev) => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex((prev) => prev - 1)
    }
  }

  const createNewPanel = () => {
    setChapters((prev) =>
      prev.map((chapter, cIndex) =>
        cIndex === currentChapterIndex
          ? {
              ...chapter,
              panels: [
                ...chapter.panels,
                {
                  id: `panel-${chapter.panels.length + 1}`,
                  text: "",
                },
              ],
            }
          : chapter
      )
    )

    setCurrentPanelIndex(currentPanels.length)
  }

  /* -----------------------------
     CHAPTER ACTIONS
  ----------------------------- */

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        id: `chapter-${prev.length + 1}`,
        title: `Chapter ${prev.length + 1}`,
        panels: [{ id: "panel-1", text: "" }],
      },
    ])
  }

  const renameChapter = (index: number, title: string) => {
    setChapters((prev) =>
      prev.map((chapter, i) =>
        i === index ? { ...chapter, title } : chapter
      )
    )
  }

  /* -----------------------------
     RENDER
  ----------------------------- */

  if (!currentPanel) return null

  return (
    <div className="h-screen bg-black flex text-white">

      {/* SIDEBAR */}
      <div className="w-72 border-r border-zinc-800 bg-zinc-950 p-5 overflow-y-auto">

        <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-6">
          Story Navigator
        </h2>

        {/* Chapters */}
        <div className="mb-8">
          <div className="text-xs text-zinc-500 mb-3 uppercase">
            Chapters
          </div>

          {chapters.map((chapter, index) => (
            <input
              key={chapter.id}
              value={chapter.title}
              onChange={(e) =>
                renameChapter(index, e.target.value)
              }
              onClick={() => {
                setCurrentChapterIndex(index)
                setCurrentPanelIndex(0)
              }}
              className={`w-full bg-transparent outline-none text-sm mb-2 ${
                index === currentChapterIndex
                  ? "text-white"
                  : "text-zinc-500"
              }`}
            />
          ))}

          <button
            onClick={addChapter}
            className="text-xs text-zinc-500 hover:text-white mt-2"
          >
            + Add Chapter
          </button>
        </div>

        {/* Panels */}
        <div>
          <div className="text-xs text-zinc-500 mb-3 uppercase">
            Panels
          </div>

          {currentPanels.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPanelIndex(index)}
              className={`block text-left w-full text-sm mb-1 ${
                index === currentPanelIndex
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Panel {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex justify-center px-8 py-10 overflow-auto">
        <div className="w-full max-w-4xl">

          <PanelEditor
            key={currentPanelIndex}
            panelNumber={currentPanelIndex + 1}
            panelText={currentPanel.text}
            onChange={updatePanelText}
            onNext={goNext}
            onPrev={goPrev}
            onCreate={createNewPanel}
            hasNext={currentPanelIndex < currentPanels.length - 1}
            hasPrev={currentPanelIndex > 0}
          />

        </div>
      </div>
    </div>
  )
}
