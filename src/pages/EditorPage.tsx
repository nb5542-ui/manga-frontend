import { useState, useRef, useEffect } from "react"
import PanelEditor from "../components/panel/PanelEditor"

interface Panel {
  id: string
  text: string
}

interface Page {
  id: string
  panels: Panel[]
}

interface Chapter {
  id: string
  title: string
  pages: Page[]
}

export default function EditorPage() {
  /* ===============================
     STATE
  =============================== */

  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "chapter-1",
      title: "Chapter 1",
      pages: [
        {
          id: "page-1",
          panels: [{ id: "panel-1", text: "" }],
        },
      ],
    },
  ])

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0)

  const currentChapter = chapters[currentChapterIndex]
  const currentPage = currentChapter.pages[currentPageIndex]
  const currentPanels = currentPage.panels
  const currentPanel = currentPanels[currentPanelIndex]

  /* ===============================
     PANEL STRIP REFS
  =============================== */

  const stripRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  /* ===============================
     PANEL ACTIONS
  =============================== */

  const updatePanelText = (text: string) => {
    const updated = [...chapters]
    updated[currentChapterIndex]
      .pages[currentPageIndex]
      .panels[currentPanelIndex].text = text

    setChapters(updated)
  }

  const goNext = () => {
    if (currentPanelIndex < currentPanels.length - 1) {
      setCurrentPanelIndex(currentPanelIndex + 1)
    }
  }

  const goPrev = () => {
    if (currentPanelIndex > 0) {
      setCurrentPanelIndex(currentPanelIndex - 1)
    }
  }

  const createNewPanel = () => {
    const updated = [...chapters]

    updated[currentChapterIndex]
      .pages[currentPageIndex]
      .panels.push({
        id: `panel-${currentPanels.length + 1}`,
        text: "",
      })

    setChapters(updated)
    setCurrentPanelIndex(currentPanels.length)
  }

  /* ===============================
     PAGE ACTIONS
  =============================== */

  const addPage = () => {
  setChapters((prevChapters) => {
    const updated = [...prevChapters]

    const newPageIndex =
      updated[currentChapterIndex].pages.length

    updated[currentChapterIndex].pages.push({
      id: `page-${newPageIndex + 1}`,
      panels: [{ id: "panel-1", text: "" }],
    })

    // After safely mutating
    setCurrentPageIndex(newPageIndex)
    setCurrentPanelIndex(0)

    return updated
  })
}


  /* ===============================
     CHAPTER ACTIONS
  =============================== */

  const addChapter = () => {
    setChapters([
      ...chapters,
      {
        id: `chapter-${chapters.length + 1}`,
        title: `Chapter ${chapters.length + 1}`,
        pages: [
          {
            id: "page-1",
            panels: [{ id: "panel-1", text: "" }],
          },
        ],
      },
    ])
  }

  const renameChapter = (index: number, title: string) => {
    const updated = [...chapters]
    updated[index].title = title
    setChapters(updated)
  }

  /* ===============================
     STRIP INDICATOR
  =============================== */

  useEffect(() => {
    const activeButton = panelRefs.current[currentPanelIndex]
    const strip = stripRef.current

    if (activeButton && strip) {
      const left =
        activeButton.offsetLeft +
        activeButton.offsetWidth / 2 -
        12

      setIndicatorStyle({
        left,
        width: 24,
      })
    }
  }, [currentPanelIndex, currentPageIndex])

  /* ===============================
     UI
  =============================== */

  return (
    <div className="h-screen bg-black flex text-white">

      {/* SIDEBAR */}
      <div className="w-72 border-r border-zinc-800 bg-zinc-950 p-5 overflow-y-auto">

        <div className="text-xs text-zinc-500 uppercase mb-4">
          Chapters
        </div>

        {chapters.map((chapter, cIndex) => (
          <div key={chapter.id} className="mb-4">

            <input
              value={chapter.title}
              onChange={(e) => renameChapter(cIndex, e.target.value)}
              onClick={() => {
                setCurrentChapterIndex(cIndex)
                setCurrentPageIndex(0)
                setCurrentPanelIndex(0)
              }}
              className={`w-full bg-transparent outline-none text-sm ${
                cIndex === currentChapterIndex
                  ? "text-white"
                  : "text-zinc-500"
              }`}
            />

            {cIndex === currentChapterIndex && (
              <div className="ml-4 mt-3">

                <div className="text-xs text-zinc-500 uppercase mb-2">
                  Pages
                </div>

                {chapter.pages.map((_, pIndex) => (
                  <button
                    key={pIndex}
                    onClick={() => {
                      setCurrentPageIndex(pIndex)
                      setCurrentPanelIndex(0)
                    }}
                    className={`block text-sm mb-1 ${
                      pIndex === currentPageIndex
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Page {pIndex + 1}
                  </button>
                ))}

                <button
                  onClick={addPage}
                  className="text-xs text-zinc-500 hover:text-white mt-2"
                >
                  + Add Page
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addChapter}
          className="text-xs text-zinc-500 hover:text-white"
        >
          + Add Chapter
        </button>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col px-10 py-10 overflow-auto">

        {/* PANEL STRIP */}
        <div className="relative mb-10">

          <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800 -translate-y-1/2" />

          <div
            className="absolute bottom-0 h-[2px] bg-white transition-all duration-300"
            style={indicatorStyle}
          />

          <div
            ref={stripRef}
            className="relative flex items-center gap-6 overflow-x-auto py-4"
          >
            {currentPanels.map((_, index) => {
              const isActive = index === currentPanelIndex

              return (
                <button
                  key={index}
                  ref={(el) => (panelRefs.current[index] = el)}
                  onClick={() => setCurrentPanelIndex(index)}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isActive
                        ? "bg-white scale-110"
                        : "bg-zinc-600 group-hover:bg-zinc-400"
                    }`}
                  />
                  <span
                    className={`mt-2 text-xs ${
                      isActive
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {index + 1}
                  </span>
                </button>
              )
            })}

            <button
              onClick={createNewPanel}
              className="ml-6 text-zinc-500 hover:text-white text-sm"
            >
              + Add Panel
            </button>
          </div>
        </div>

        {/* PANEL EDITOR */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <PanelEditor
              key={`${currentChapterIndex}-${currentPageIndex}-${currentPanelIndex}`}
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
    </div>
  )
}
