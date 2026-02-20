import { useState, useRef, useEffect, useReducer } from "react"

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

interface HistoryEntry<T> {
  state: T
  actionType: string
  timestamp: number
}

interface HistoryState<T> {
  past: HistoryEntry<T>[]
  present: T
  future: HistoryEntry<T>[]
}

type HistoryAction<T> =
  | { type: "SET_STATE"; payload: T; actionType: string }
  | { type: "UNDO" }
  | { type: "REDO" }

function historyReducer<T>(
  state: HistoryState<T>,
  action: HistoryAction<T>
): HistoryState<T> {

  switch (action.type) {

    case "SET_STATE": {
      console.log("SET_STATE called")
      return {
        past: [
          ...state.past,
          {
            state: state.present,
            actionType: action.actionType,
            timestamp: Date.now()
          }
        ],
        present: action.payload,
        future: []
      }
    }

    case "UNDO": {
      console.log("UNDO", state)
  if (state.past.length === 0) return state

  const previousEntry = state.past[state.past.length - 1]

  return {
    past: state.past.slice(0, -1),
    present: previousEntry.state,
    future: [
      {
        state: state.present,
        actionType: previousEntry.actionType,
        timestamp: previousEntry.timestamp
      },
      ...state.future
    ]
  }
}

    case "REDO": {
      console.log("REDO", state.future.length)
  if (state.future.length === 0) return state

  const nextEntry = state.future[0]

  return {
    past: [
      ...state.past,
      {
        state: state.present,
        actionType: nextEntry.actionType,
        timestamp: nextEntry.timestamp
      }
    ],
    present: nextEntry.state,
    future: state.future.slice(1)
  }
}

    default:
      return state
  }
}

export default function EditorPage() {

  /* ===============================
     STATE (NOW USING REDUCER)
  =============================== */

  const initialChapters: Chapter[] = [
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
  ]

  const [history, dispatch] = useReducer(
    historyReducer<Chapter[]>,
    {
      past: [],
      present: initialChapters,
      future: []
    }
  )
  const isRestoringRef = useRef(false)

const handleUndo = () => {
  isRestoringRef.current = true
  dispatch({ type: "UNDO" })
}

const handleRedo = () => {
  isRestoringRef.current = true
  dispatch({ type: "REDO" })
}

  const chapters = history.present

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0)

  const currentChapter = chapters[currentChapterIndex]
  const currentPage = currentChapter?.pages[currentPageIndex]
  const currentPanels = currentPage?.panels ?? []

  const currentPanel =
    currentPanels[currentPanelIndex] || currentPanels[0]

  /* ===============================
     LOCAL INTELLIGENCE
  =============================== */

  const text = currentPanel?.text || ""

  const wordCount = text.trim()
    ? text.trim().split(/\s+/).length
    : 0

  const charCount = text.length

  const lowerText = text.toLowerCase()

  const positiveWords = [
    "love", "hope", "trust", "peace", "smile",
    "happy", "grateful", "kind", "thank you"
  ]

  const negativeWords = [
    "hate", "fear", "death", "pain", "anger",
    "sad", "cry", "lonely"
  ]

  const aggressionWords = [
    "kill", "destroy", "hurt", "attack",
    "shut up", "idiot", "stupid", "dumb",
    "die", "fool", "loser"
  ]

  let emotionalTone = "Neutral"

  if (aggressionWords.some(word => lowerText.includes(word))) {
    emotionalTone = "Aggressive"
  } else if (negativeWords.some(word => lowerText.includes(word))) {
    emotionalTone = "Dark"
  } else if (positiveWords.some(word => lowerText.includes(word))) {
    emotionalTone = "Positive"
  }

  const exclamations = (text.match(/!/g) || []).length
  const questionMarks = (text.match(/\?/g) || []).length
  const intensityScore = exclamations + questionMarks

  let intensity = "Low"
  if (intensityScore > 3) intensity = "High"
  else if (intensityScore > 1) intensity = "Medium"

  let narrativeState = "Empty"
  if (wordCount > 0) narrativeState = "Light"
  if (wordCount > 40) narrativeState = "Dense"
  if (wordCount > 80) narrativeState = "Heavy"

  /* ===============================
     STRIP DETECTORS
  =============================== */

  const detectTone = (panelText: string) => {
    const lower = panelText.toLowerCase()

    if (aggressionWords.some(word => lower.includes(word)))
      return "Aggressive"
    if (negativeWords.some(word => lower.includes(word)))
      return "Dark"
    if (positiveWords.some(word => lower.includes(word)))
      return "Positive"

    return "Neutral"
  }

  const detectIntensity = (panelText: string) => {
    const ex = (panelText.match(/!/g) || []).length
    const qm = (panelText.match(/\?/g) || []).length
    const score = ex + qm

    if (score > 3) return "High"
    if (score > 1) return "Medium"
    return "Low"
  }

  const detectDensity = (panelText: string) => {
    const words = panelText.trim()
      ? panelText.trim().split(/\s+/).length
      : 0

    if (words === 0) return "Empty"
    if (words > 80) return "Heavy"
    if (words > 40) return "Dense"
    return "Light"
  }
  /* ===============================
   DRIFT DETECTOR
=============================== */

const detectDrift = () => {
  if (currentPanelIndex === 0) return "Start"

  const previousPanel = currentPanels[currentPanelIndex - 1]
  if (!previousPanel) return "Stable"

  const prevTone = detectTone(previousPanel.text)
  const prevIntensity = detectIntensity(previousPanel.text)
  const prevDensity = detectDensity(previousPanel.text)

  const currentTone = detectTone(currentPanel.text)
  const currentIntensity = detectIntensity(currentPanel.text)
  const currentDensity = detectDensity(currentPanel.text)

  let driftScore = 0

  if (prevTone !== currentTone) driftScore += 2
  if (prevIntensity !== currentIntensity) driftScore += 1
  if (prevDensity !== currentDensity) driftScore += 1

  if (driftScore === 0) return "Stable"
  if (driftScore <= 2) return "Gradual Shift"
  return "Sharp Shift"
}
const driftState = detectDrift()


  /* ===============================
     PANEL STRIP REFS
  =============================== */

  const stripRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  })

  useEffect(() => {
    panelRefs.current = []
  }, [currentChapterIndex, currentPageIndex])
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC")
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey

    if (!ctrlKey) return

    const key = e.key.toLowerCase()

    if (key === "z" && !e.shiftKey) {
      e.preventDefault()
      handleUndo()
    }

    if (key === "z" && e.shiftKey) {
      e.preventDefault()
      handleRedo()
    }

    if (key === "y") {
      e.preventDefault()
      handleRedo()
    }
  }

  window.addEventListener("keydown", handleKeyDown)
  return () => window.removeEventListener("keydown", handleKeyDown)
}, [])


  useEffect(() => {
    const activeButton = panelRefs.current[currentPanelIndex]
    const strip = stripRef.current
    if (!activeButton || !strip) return

    const buttonRect = activeButton.getBoundingClientRect()
    const stripRect = strip.getBoundingClientRect()

    const offset =
      buttonRect.left -
      stripRect.left -
      stripRect.width / 2 +
      buttonRect.width / 2

    strip.scrollBy({ left: offset, behavior: "smooth" })

    setIndicatorStyle({
      left:
        activeButton.offsetLeft +
        activeButton.offsetWidth / 2 -
        12,
      width: 24,
    })
  }, [currentPanelIndex, currentPageIndex])

  /* ===============================
     PANEL ACTIONS
  =============================== */

  const updatePanelText = (text: string) => {
  const updated = chapters.map((chapter, cIndex) => {
    if (cIndex !== currentChapterIndex) return chapter

    return {
      ...chapter,
      pages: chapter.pages.map((page, pIndex) => {
        if (pIndex !== currentPageIndex) return page

        return {
          ...page,
          panels: page.panels.map((panel, panelIndex) => {
            if (panelIndex !== currentPanelIndex) return panel

            return {
              ...panel,
              text
            }
          })
        }
      })
    }
  })

  if (isRestoringRef.current) {
  isRestoringRef.current = false
  return
}

dispatch({
  type: "SET_STATE",
  payload: updated,
  actionType: "UPDATE_PANEL_TEXT"
})
}


  const goNext = () => {
    if (currentPanelIndex < currentPanels.length - 1)
      setCurrentPanelIndex(currentPanelIndex + 1)
  }

  const goPrev = () => {
    if (currentPanelIndex > 0)
      setCurrentPanelIndex(currentPanelIndex - 1)
  }

  const createNewPanel = () => {
  const updated = chapters.map((chapter, cIndex) => {
    if (cIndex !== currentChapterIndex) return chapter

    return {
      ...chapter,
      pages: chapter.pages.map((page, pIndex) => {
        if (pIndex !== currentPageIndex) return page

        return {
          ...page,
          panels: [
            ...page.panels,
            {
              id: `panel-${page.panels.length + 1}`,
              text: ""
            }
          ]
        }
      })
    }
  })

  dispatch({
    type: "SET_STATE",
    payload: updated,
    actionType: "CREATE_PANEL"
  })

  setCurrentPanelIndex(currentPanels.length)
}


  const addPage = () => {
  const updated = chapters.map((chapter, cIndex) => {
    if (cIndex !== currentChapterIndex) return chapter

    return {
      ...chapter,
      pages: [
        ...chapter.pages,
        {
          id: `page-${chapter.pages.length + 1}`,
          panels: [{ id: "panel-1", text: "" }]
        }
      ]
    }
  })

  const newPageIndex = currentChapter.pages.length

  dispatch({
    type: "SET_STATE",
    payload: updated,
    actionType: "CREATE_PAGE"
  })

  setCurrentPageIndex(newPageIndex)
  setCurrentPanelIndex(0)
}


  const addChapter = () => {
  const updated = [
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
  ]

  dispatch({
    type: "SET_STATE",
    payload: updated,
    actionType: "CREATE_CHAPTER"
  })
}


  const renameChapter = (index: number, title: string) => {
  const updated = chapters.map((chapter, i) =>
    i === index ? { ...chapter, title } : chapter
  )

  dispatch({
    type: "SET_STATE",
    payload: updated,
    actionType: "RENAME_CHAPTER"
  })
}


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

      {/* CENTER COLUMN */}
      <div className="flex-1 flex flex-col">

        <div className="h-12 border-b border-zinc-800 flex items-center px-6 text-sm text-zinc-400">
          <div className="flex gap-6">
            <span>{currentChapter?.title}</span>
            <span>Page {currentPageIndex + 1}</span>
            <span>{currentPanels.length} Panels</span>
          </div>
        </div>

        <div className="flex-1 px-10 py-10 overflow-auto">

          {/* PANEL STRIP */}
          <div className="relative mb-10">
            <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800 -translate-y-1/2" />
            <div
              className="absolute bottom-0 h-[2px] bg-white transition-all duration-300"
              style={indicatorStyle}
            />

            <div
              ref={stripRef}
              className="relative flex items-center gap-6 overflow-x-auto py-4 scroll-smooth"
            >
              {currentPanels.map((panel, index) => {
                const isActive = index === currentPanelIndex
                const tone = detectTone(panel.text)
                const intensityLevel = detectIntensity(panel.text)
                const density = detectDensity(panel.text)

                return (
                  <button
                    key={index}
                    ref={(el) => (panelRefs.current[index] = el)}
                    onClick={() => setCurrentPanelIndex(index)}
                    className="flex flex-col items-center group"
                  >
                    <div className="flex flex-col items-center gap-2">

                      {/* DOT */}
                      <div
                        className={`w-4 h-4 rounded-full transition-all duration-200 ${
                          isActive ? "scale-110" : ""
                        } ${
                          tone === "Positive"
                            ? "bg-green-500"
                            : tone === "Dark"
                            ? "bg-red-500"
                            : tone === "Aggressive"
                            ? "bg-orange-500"
                            : "bg-zinc-600"
                        } ${
                          intensityLevel === "High"
                            ? "ring-2 ring-white"
                            : intensityLevel === "Medium"
                            ? "ring-1 ring-white/70"
                            : ""
                        } group-hover:brightness-125`}
                      />

                      {/* DENSITY BAR */}
                      <div
                        className={`w-1 rounded-full transition-all duration-200 ${
                          density === "Heavy"
                            ? "h-6 bg-white"
                            : density === "Dense"
                            ? "h-4 bg-white/80"
                            : density === "Light"
                            ? "h-2 bg-white/60"
                            : "h-0"
                        }`}
                      />

                      <span
                        className={`text-xs transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-zinc-500 group-hover:text-zinc-300"
                        }`}
                      >
                        {index + 1}
                      </span>

                    </div>
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
              {currentPanel && (
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
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* INTELLIGENCE PANEL (unchanged) */}
      <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-6 text-sm">
        <div className="uppercase text-xs mb-6 text-zinc-600">
          Intelligence
        </div>

        {currentPanel && (
          <div className="space-y-8 text-zinc-300">
            <div>
              <div className="text-xs uppercase text-zinc-600 mb-2">
                Emotional Tone
              </div>
              <div>{emotionalTone}</div>
            </div>

            <div>
              <div className="text-xs uppercase text-zinc-600 mb-2">
                Intensity
              </div>
              <div>{intensity}</div>
            </div>

            <div>
  <div className="text-xs uppercase text-zinc-600 mb-2">
    Panel State
  </div>

  <div
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      narrativeState === "Empty"
        ? "bg-zinc-800 text-zinc-400"
        : narrativeState === "Light"
        ? "bg-blue-900/40 text-blue-400"
        : narrativeState === "Dense"
        ? "bg-purple-900/40 text-purple-400"
        : "bg-red-900/40 text-red-400"
    }`}
  >
    {narrativeState}
  </div>
</div>
{/* DRIFT ANALYSIS */}
<div>
  <div className="text-xs uppercase text-zinc-600 mb-2">
    Narrative Drift
  </div>

  <div
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      driftState === "Start"
        ? "bg-zinc-800 text-zinc-400"
        : driftState === "Stable"
        ? "bg-green-900/40 text-green-400"
        : driftState === "Gradual Shift"
        ? "bg-yellow-900/40 text-yellow-400"
        : "bg-red-900/40 text-red-400"
    }`}
  >
    {driftState}
  </div>
</div>



            <div>
              <div className="text-xs uppercase text-zinc-600 mb-2">
                Text Metrics
              </div>
              <div>Words: {wordCount}</div>
              <div>Characters: {charCount}</div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

