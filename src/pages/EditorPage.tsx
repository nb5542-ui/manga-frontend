import { useState, useRef, useEffect, useReducer } from "react"
import { useParams } from "react-router-dom"
import EditorToolbar from "../components/panel/editor/EditorToolbar"
import { buildGenerationContext } from "../engine/contextBuilder"





import PanelEditor from "../components/panel/PanelEditor"

import type {
  Panel,
  Page,
  Chapter,
  HistoryEntry,
  HistoryState
} from "./src/types/editorTypes"
const MAX_HISTORY = 100

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
  const newEntry = {
    state: state.present,
    actionType: action.actionType,
    timestamp: Date.now()
  }

  const newPast =
    state.past.length >= MAX_HISTORY
      ? [...state.past.slice(1), newEntry]
      : [...state.past, newEntry]

  return {
    past: newPast,
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
    const { storyId } = useParams()

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
  function buildPanelPrompt() {

  if (!currentPanel) return ""

  const text = currentPanel.text || ""

  const notesMatch = text.match(/#notes([\s\S]*)/)
  const notes = notesMatch ? notesMatch[1].trim() : ""

  const characterNames = characters.map(c => c.name).join(", ")

  const prompt = `
Panel Text:
${text}

Notes:
${notes}

Characters:
${characterNames}
`

  return prompt
}

  // 🔥 Restore saved chapters per chapter
const restoredChapters = initialChapters.map(chapter => {
  const saved = localStorage.getItem(
    `manga-autosave:${storyId}:${chapter.id}`
  )

  return saved ? JSON.parse(saved) : chapter
})
  

  const [history, dispatch] = useReducer(
    historyReducer<Chapter[]>,
    {
      past: [],
      present: restoredChapters,
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
const commit = (payload: Chapter[], actionType: string) => {
  setVersion(prev => prev + 1)

  dispatch({
    type: "SET_STATE",
    payload,
    actionType
  })
}

  const chapters = history.present
  // 🔥 Activity Entries (Last 200)
const activityEntries = [
  ...history.past,
  {
    state: history.present,
    actionType: "CURRENT_STATE",
    timestamp: Date.now()
  }
].slice(-200)
  // 🔥 Save lifecycle state
const [saveStatus, setSaveStatus] = useState<
  "idle" | "dirty" | "saving" | "saved"
>("idle")
const [version, setVersion] = useState(1)
// 🔥 Activity Drawer State
const [isActivityOpen, setIsActivityOpen] = useState(false)
const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false)
const [isPreview, setIsPreview] = useState(false)
const [characters, setCharacters] = useState<
  { id: string; name: string; description: string }[]
>([])
const [showCharacters, setShowCharacters] = useState(false)
  
const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
const [showGenerateMenu, setShowGenerateMenu] = useState(false)
// 🔹 Multi-tab conflict detection
const [hasExternalUpdate, setHasExternalUpdate] = useState(false)
const [activeRightTab, setActiveRightTab] = useState<"intelligence" | "characters" >("intelligence")

// 🔹 Layout resize state
const [sidebarWidth, setSidebarWidth] = useState(() => {
  const saved = localStorage.getItem("layout-sidebar-width")
  return saved ? Number(saved) : 288
})

const [intelligenceWidth, setIntelligenceWidth] = useState(() => {
  const saved = localStorage.getItem("layout-intelligence-width")
  return saved ? Number(saved) : 320
})

const [isDragging, setIsDragging] = useState<null | "sidebar" | "intelligence">(null)
useEffect(() => {
  const chapter = history.present[currentChapterIndex]
  if (!chapter) return

  const savedVersion = localStorage.getItem(`manga-version:${storyId}:${chapter.id}`)

  if (savedVersion) {
    const parsed = Number(savedVersion)

    if (parsed > version) {
      setShowRecoveryPrompt(true)
    }

    setVersion(parsed)
  }
}, [])

// 🔹 Listen for external tab updates
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (!e.key) return

    const chapter = history.present[currentChapterIndex]
    if (!chapter) return

    const versionKey = `manga-version:${storyId}:${chapter.id}`

    if (e.key === versionKey && e.newValue) {
      const externalVersion = Number(e.newValue)

      if (externalVersion > version) {
        setHasExternalUpdate(true)
      }
    }
  }
  

  window.addEventListener("storage", handleStorageChange)

  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
  
}, [version, currentChapterIndex, history.present])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0)

  const currentChapter = chapters[currentChapterIndex]
  const currentPage = currentChapter?.pages[currentPageIndex]
  const currentPanels = currentPage?.panels ?? []

  const currentPanel =
    currentPanels[currentPanelIndex] || currentPanels[0]
    // ===============================
// 🔥 GENERATION HANDLER (NEW)
// ===============================
async function handleGenerate(panel: any) {
  try {
    const context = buildGenerationContext({
      story: { id: storyId }, // minimal for now
      chapter: currentChapter,
      page: currentPage,
      panel,
      characters,
      intelligence: {
        tone: emotionalTone,
        intensity,
        drift: driftState,
        chapter_health: chapterHealth
      }
    })

    console.log("GEN CONTEXT:", context)

    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(context)
    })

    const data = await res.json()

    console.log("GEN RESULT:", data)

  } catch (err) {
    console.error("Generation failed:", err)
  }
}

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
// ===============================
// CHAPTER HEALTH CALCULATOR
// ===============================

const calculateChapterHealth = () => {
  if (!currentChapter) return 0

  const panels = currentChapter.pages.flatMap(page => page.panels)
  if (panels.length === 0) return 0
  const emptyPanels = panels.filter(p => !p.text.trim()).length
  const emptyRatio = emptyPanels / panels.length

  // ---- Density Score ----
  const densities = panels.map(p => detectDensity(p.text))
  const heavyCount = densities.filter(d => d === "Heavy").length
  const emptyCount = densities.filter(d => d === "Empty").length

  let densityScore = 25
  if (heavyCount > panels.length * 0.5) densityScore -= 10
  if (emptyCount > panels.length * 0.5) densityScore -= 10

  // ---- Tone Diversity ----
  const tones = panels.map(p => detectTone(p.text))
  const uniqueTones = new Set(tones).size

  let toneScore = uniqueTones >= 3 ? 25 : uniqueTones === 2 ? 18 : 10

  // ---- Intensity Spread ----
  const intensities = panels.map(p => detectIntensity(p.text))
  const uniqueIntensity = new Set(intensities).size

  let intensityScore = uniqueIntensity >= 3 ? 25 : uniqueIntensity === 2 ? 18 : 10

  // ---- Drift Stability ----
  let driftShifts = 0

  for (let i = 1; i < panels.length; i++) {
    const prevTone = detectTone(panels[i - 1].text)
    const currTone = detectTone(panels[i].text)
    if (prevTone !== currTone) driftShifts++
  }

  let driftScore =
    driftShifts <= panels.length * 0.3 ? 25 :
    driftShifts <= panels.length * 0.6 ? 18 :
    10

  let total = densityScore + toneScore + intensityScore + driftScore

// 🚨 Hard penalty for mostly empty chapters
if (emptyRatio > 0.7) {
  total = Math.min(total, 30)
}

return Math.max(0, Math.min(100, total))
}
const chapterHealth = calculateChapterHealth()

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
  localStorage.setItem("layout-sidebar-width", sidebarWidth.toString())
}, [sidebarWidth])

useEffect(() => {
  localStorage.setItem("layout-intelligence-width", intelligenceWidth.toString())
}, [intelligenceWidth])
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    if (isDragging === "sidebar") {
      const newWidth = Math.min(Math.max(e.clientX, 220), 500)
      setSidebarWidth(newWidth)
    }

    if (isDragging === "intelligence") {
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 260), 500)
      setIntelligenceWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("mouseup", handleMouseUp)

  return () => {
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
  }
}, [isDragging])

  // 🔥 Toggle Activity Drawer (Ctrl+Shift+L)
useEffect(() => {
  const handleToggle = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC")
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey

    if (ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
      e.preventDefault()
      setIsActivityOpen(prev => !prev)
    }
  }

  window.addEventListener("keydown", handleToggle)
  return () => window.removeEventListener("keydown", handleToggle)
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
  // 🔥 Mark chapter dirty when it changes
const [pendingSaveData, setPendingSaveData] = useState<Chapter | null>(null)

useEffect(() => {
  const chapter = history.present[currentChapterIndex]
  if (!chapter) return

  setPendingSaveData(chapter)
  setSaveStatus("dirty")
}, [history.present[currentChapterIndex]])

// 🔥 Debounced autosave per chapter
useEffect(() => {
  if (history.past.length === 0) return

  setSaveStatus("saving")

  const timeout = setTimeout(() => {
    try {
      const chapter = history.present[currentChapterIndex]
      if (!chapter) return

      const key = `manga-autosave:${storyId}:${chapter.id}`
      localStorage.setItem(key, JSON.stringify(chapter))
      localStorage.setItem(`manga-version:${storyId}:${chapter.id}`, version.toString())

      setSaveStatus("saved")
    } catch (err) {
      console.error("Autosave failed:", err)
      setSaveStatus("idle")
    }
  }, 1500)

  return () => clearTimeout(timeout)

}, [history.past.length])

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

commit(updated, "UPDATE_PANEL_TEXT")
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

  commit(updated, "CREATE_PANEL")

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

  commit(updated, "ADD_PAGE")

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

  commit(updated, "ADD_CHAPTER")
}


  const renameChapter = (index: number, title: string) => {
  const updated = chapters.map((chapter, i) =>
    i === index ? { ...chapter, title } : chapter
  )

  commit(updated, "RENAME_CHAPTER")
}
const reloadFromStorage = () => {
  const chapter = history.present[currentChapterIndex]
  if (!chapter) return

  const key = `manga-autosave:${chapter.id}`
  const saved = localStorage.getItem(key)

  if (!saved) return

  const parsedChapter = JSON.parse(saved)

  const updated = chapters.map((c, index) =>
    index === currentChapterIndex ? parsedChapter : c
  )

  // update version from storage
  const savedVersion = localStorage.getItem(
    `manga-version:${storyId}:${chapter.id}`
  )

  if (savedVersion) {
    setVersion(Number(savedVersion))
  }

  commit(updated, "RELOAD_FROM_STORAGE")
  setHasExternalUpdate(false)
}


  /* ===============================
     UI
  =============================== */

  return (
    <div className="h-screen bg-[#050505] flex text-white">

      {/* SIDEBAR */}
      <div
  className="border-r border-borderMain bg-[#11151d] p-5 overflow-y-auto scroll-smooth"
>
        <div className="text-xs text-textDim uppercase mb-4 tracking-wider">
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
              className={`
  w-full
  bg-transparent
  outline-none
  text-sm

  px-2 py-1
  rounded-md

  transition-all duration-200

  ${
    cIndex === currentChapterIndex
     ? "text-textMain bg-bgSoft"
      : "text-textDim hover:text-textMain hover:bg-bgHover"
  }
`}
            />
            {cIndex === currentChapterIndex && (
              <div className="ml-4 mt-3">
                <div className="text-xs text-textDim uppercase mb-2 tracking-wider">
                  Pages
                </div>

                {chapter.pages.map((_, pIndex) => (
                  <button
                    key={pIndex}
                    onClick={() => {
                      setCurrentPageIndex(pIndex)
                      setCurrentPanelIndex(0)
                    }}
                    className={`
  block text-sm mb-1

  px-2 py-1
  rounded-md

  transition-all duration-200

  ${
    pIndex === currentPageIndex
      ? "text-textMain bg-bgSoft"
      : "text-textDim hover:text-textMain hover:bg-bgHover"
  }
`}
                  >
                    Page {pIndex + 1}
                  </button>
                ))}

                <button
  onClick={addPage}
  className="
    mt-2 text-xs

    text-textDim

    hover:text-textMain

    px-2 py-1
    rounded

    transition-all duration-200

    hover:bg-bgHover
    active:scale-95
  "
>
  + Add Page
</button>
              </div>
            )}
          </div>
        ))}

        <button
  onClick={addChapter}
  className="
    text-xs

    text-zinc-500
    hover:text-white

    px-2 py-1
    rounded

    transition-all duration-200

    bg-borderMain hover:bg-accent
    active:scale-95
  "
>
  + Add Chapter
</button>
      </div>
      <div
  onMouseDown={() => setIsDragging("sidebar")}
  className="w-1 cursor-col-resize bg-borderMain hover:bg-accent transition-colors"
/>

      {/* CENTER COLUMN */}
      

      <div className="
flex-1 flex flex-col
bg-bgMain
relative
overflow-hidden
">
  <div className="
absolute inset-0
pointer-events-none
bg-[radial-gradient(circle_at_30%_20%,rgba(255,107,45,0.08),transparent_40%)]
" />
<div className="
absolute inset-0
pointer-events-none
bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.03),transparent_50%)]
" />

      <EditorToolbar
  chapterTitle={currentChapter?.title}
  pageIndex={currentPageIndex}
  panelCount={currentPanels.length}
  saveStatus={saveStatus}
  version={version}
  hasExternalUpdate={hasExternalUpdate}
  onReload={reloadFromStorage}
  onOpenActivity={() => setIsActivityOpen(true)}
/>
{/* CHARACTERS BUTTON */}

<div className="px-6 pt-2">

  <button
    onClick={() => setShowCharacters(!showCharacters)}
    className="
      text-xs
      text-zinc-400
      hover:text-white
    "
  >
    Characters
  </button>

</div>


<div className="px-6 pt-2 flex gap-4">

  <button
    onClick={() => setIsPreview(!isPreview)}
    className="text-xs text-zinc-400 hover:text-white"
  >
    {isPreview ? "Editor" : "Preview"}
  </button>

</div>
<div className="relative">

  <button
    onClick={() => setShowGenerateMenu(!showGenerateMenu)}
    className="text-xs text-zinc-400 hover:text-white"
  >
    Generate
  </button>

  {showGenerateMenu && (

    <div
      className="
        absolute
        mt-2
        bg-zinc-900
        border border-zinc-800
        rounded
        text-xs
        flex flex-col
        z-50
      "
    >

      <button
        onClick={() => {
          const prompt = buildPanelPrompt()

          console.log(prompt)

          alert(prompt)
          setShowGenerateMenu(false)
}}
        className="px-3 py-2 hover:bg-zinc-800 text-left"
      >
        Generate Panel
      </button>

      <button
        onClick={() => {
          alert("Generate Page clicked")
          setShowGenerateMenu(false)
}}
        className="px-3 py-2 hover:bg-zinc-800 text-left"
      >
        Generate Page
      </button>

      <button
        onClick={() => {
          alert("Generate Scene clicked")
          setShowGenerateMenu(false)
        }}
        className="px-3 py-2 hover:bg-zinc-800 text-left"
      >
        Generate Scene
      </button>

      <button
        onClick={() => {
          alert("Generate Chapter clicked")
          setShowGenerateMenu(false)
        }}
        className="px-3 py-2 hover:bg-zinc-800 text-left"
      >
        Generate Chapter
      </button>

    </div>

  )}

</div>

        <div className="flex-1 px-10 py-10 overflow-auto">

          {/* PANEL STRIP */}
          <div className="relative mb-10">
            <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800 -translate-y-1/2" />
            <div
              className="absolute bottom-0 h-[2px] bg-white/90 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.6)]"
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
                const isSceneBreak = panel.text.trim().startsWith("#scene")

                return (
                  <div className="flex items-center gap-3">

    {isSceneBreak && (
      <div className="flex flex-col items-center">

        <div className="text-[9px] text-zinc-500 uppercase">
          Scene
        </div>

        <div className="w-6 h-[2px] bg-white/60 my-1" />

      </div>
    )}
                  <button
                    key={index}
                    ref={(el) => {
                      panelRefs.current[index] = el
                    }}
                    onClick={() => setCurrentPanelIndex(index)}
                    className="
  flex flex-col items-center group

  transition-all duration-200
  cursor-pointer

  hover:scale-105
"
                  >
                    <div className="flex flex-col items-center gap-2">

                      {/* DOT */}
                      {/* DOT — manga style */}

<div
  className={`
    relative

    w-5 h-5
    rounded-full

    transition-all duration-300

    ${isActive ? "scale-125" : "scale-100"}

    ${
      tone === "Positive"
        ? "bg-green-500"
        : tone === "Dark"
        ? "bg-red-500"
        : tone === "Aggressive"
        ? "bg-orange-500"
        : "bg-zinc-500"
    }

    ${
      isActive
        ? "ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
        : ""
    }

    group-hover:scale-110
  `}
>

  {/* bubble tail */}
  <div
    className={`
      absolute
      -bottom-1
      left-1/2
      -translate-x-1/2

      w-2 h-2
      rotate-45

      ${
        tone === "Positive"
          ? "bg-green-500"
          : tone === "Dark"
          ? "bg-red-500"
          : tone === "Aggressive"
          ? "bg-orange-500"
          : "bg-zinc-500"
      }

      ${isActive ? "opacity-100" : "opacity-60"}
    `}
  />

</div>

                      {/* DENSITY BAR */}
                      {/* DENSITY MARKERS — manga pacing */}

<div className="flex flex-col items-center gap-[2px]">

  {density === "Heavy" && (
    <>
      <div className="w-[2px] h-3 bg-white rounded" />
      <div className="w-[2px] h-3 bg-white rounded" />
      <div className="w-[2px] h-3 bg-white rounded" />
    </>
  )}

  {density === "Dense" && (
    <>
      <div className="w-[2px] h-3 bg-white/80 rounded" />
      <div className="w-[2px] h-3 bg-white/80 rounded" />
    </>
  )}

  {density === "Light" && (
    <div className="w-[2px] h-2 bg-white/60 rounded" />
  )}

</div>

                      <span
  className={`
    text-xs

    transition-all duration-200

    ${
      isActive
        ? "text-white"
        : "text-zinc-500 group-hover:text-zinc-300"
    }
  `}
>
                        {index + 1}
                      </span>

                    </div>
                  </button>
                  </div>
                )
              })}

              <button
  onClick={createNewPanel}
  className="
    ml-6 text-sm

    text-zinc-500
    hover:text-white

    px-3 py-1
    rounded-md

    transition-all duration-200

    hover:bg-zinc-800
    active:scale-95
    active:bg-zinc-700
  "
>
  + Add Panel
</button>
            </div>
          </div>

          {/* PANEL EDITOR */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              {!isPreview && currentPanel && (
                <PanelEditor
                
                  key={`${currentChapterIndex}-${currentPageIndex}-${currentPanelIndex}`}
                  panelNumber={currentPanelIndex + 1}
                  panelText={currentPanel.text}
                  onChange={updatePanelText}
                  onNext={goNext}
                  onPrev={goPrev}
                  onCreate={createNewPanel}
                  onGenerate={() => handleGenerate(currentPanel)} 
                  hasNext={currentPanelIndex < currentPanels.length - 1}
                  hasPrev={currentPanelIndex > 0}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  
                />
                
                
              )}
              {isPreview && (

  <div className="max-w-4xl mx-auto flex flex-col gap-6">

    {currentPanels.map((panel, i) => (

      <div
        key={i}
        className="
          bg-white
          text-black
          p-6
          rounded
          shadow
        "
      >

        <div className="text-xs text-zinc-500 mb-2">
          Panel {i + 1}
        </div>

        <div className="whitespace-pre-wrap">
          {panel.text}
        </div>

      </div>

    ))}

  </div>

)}
            </div>
          </div>

        </div>
      </div>
      <div
  onMouseDown={() => setIsDragging("intelligence")}
  className="w-1 cursor-col-resize bg-zinc-800 hover:bg-white transition-colors"
/>


      {/* INTELLIGENCE PANEL (unchanged) */}
      {/* RIGHT PANEL */}

<div
  className="
  border-l border-zinc-800
  bg-[#060606]
  w-[320px]
  flex flex-col
"
>
  {/* TABS */}

<div className="flex border-b border-zinc-800 text-xs">

  <button
    onClick={() => setActiveRightTab("intelligence")}
    className={`flex-1 p-2 ${
      activeRightTab === "intelligence"
        ? "bg-zinc-900 text-white"
        : "text-zinc-500"
    }`}
  >
    Intelligence
  </button>

  <button
    onClick={() => setActiveRightTab("characters")}
    className={`flex-1 p-2 ${
      activeRightTab === "characters"
        ? "bg-zinc-900 text-white"
        : "text-zinc-500"
    }`}
  >
    Characters
  </button>

 

</div>
{activeRightTab === "intelligence" && (

<div className="p-6 flex flex-col gap-6">


        <div className="flex items-center justify-between">

  <div className="uppercase text-xs text-zinc-500 tracking-wider">
    Intelligence
  </div>

  <div className="text-[10px] text-zinc-600">
    AI Panel
  </div>

</div>



        {currentPanel && (
          <div className="flex flex-col gap-6 text-zinc-300">
            <div className="flex flex-col gap-2">

  <div className="text-[11px] uppercase text-zinc-500">
    Chapter Health
  </div>

  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">

    <div
      className={`
        h-full transition-all duration-500

        ${
          chapterHealth > 75
            ? "bg-green-500"
            : chapterHealth > 50
            ? "bg-yellow-500"
            : "bg-red-500"
        }
      `}
      style={{ width: `${chapterHealth}%` }}
    />
    <div className="text-[11px] text-zinc-500">
    {chapterHealth}% health
  </div>

  </div>
  
  {/* TIMELINE GRAPH */}

<div className="mt-4 flex flex-col gap-2">

  <div className="text-xs uppercase text-zinc-600">
    Timeline
  </div>

  <div className="flex items-end gap-1 h-10 bg-zinc-900/40 px-2 py-2 rounded">

    {currentPanels.map((panel, i) => {

      const tone = detectTone(panel.text)
      const density = detectDensity(panel.text)

      let height = 4

      if (density === "Light") height = 8
      if (density === "Dense") height = 14
      if (density === "Heavy") height = 20

      let color = "bg-zinc-500"

      if (tone === "Positive") color = "bg-green-500"
      if (tone === "Dark") color = "bg-red-500"
      if (tone === "Aggressive") color = "bg-orange-500"

      return (

        <div
          key={i}
          className={`w-2 rounded ${color}`}
          style={{ height }}
        />

      )

    })}

  </div>

</div>

  

</div>
          
            <div className="flex flex-col gap-1">

  <div className="text-[11px] uppercase text-zinc-500">
    Emotional Tone
  </div>

  <div
    className={`
      px-2 py-1
      rounded-full
      text-xs
      w-fit

      ${
        emotionalTone === "Positive"
          ? "bg-green-900/40 text-green-400"
          : emotionalTone === "Dark"
          ? "bg-red-900/40 text-red-400"
          : emotionalTone === "Aggressive"
          ? "bg-orange-900/40 text-orange-400"
          : "bg-zinc-800 text-zinc-400"
      }
    `}
  >
    {emotionalTone}
  </div>

</div>

            <div className="flex flex-col gap-1">

  <div className="text-[11px] uppercase text-zinc-500">
    Intensity
  </div>

  <div
    className={`
      px-2 py-1
      rounded-full
      text-xs
      w-fit

      ${
        intensity === "High"
          ? "bg-red-900/40 text-red-400"
          : intensity === "Medium"
          ? "bg-yellow-900/40 text-yellow-400"
          : "bg-zinc-800 text-zinc-400"
      }
    `}
  >
    {intensity}
  </div>

</div>

            <div>
              <div className="text-[11px] uppercase text-zinc-500 mb-1 tracking-wide">
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
              <div className="flex flex-col gap-1">

  <div className="text-[11px] uppercase text-zinc-500">
    Narrative Drift
  </div>

  <div
    className={`
      px-2 py-1
      rounded-full
      text-xs
      w-fit

      ${
        driftState === "Stable"
          ? "bg-green-900/40 text-green-400"
          : driftState === "Gradual Shift"
          ? "bg-yellow-900/40 text-yellow-400"
          : driftState === "Sharp Shift"
          ? "bg-red-900/40 text-red-400"
          : "bg-zinc-800 text-zinc-400"
      }
    `}
  >
    {driftState}
  </div>

</div>

             
            </div>
            </div>
)}

            <div className="flex flex-col gap-1">

  <div className="text-[11px] uppercase text-zinc-500">
    Text Metrics
  </div>
  
  {/* AI SUGGESTIONS */}

<div className="flex flex-col gap-2">

  <div className="text-[11px] uppercase text-zinc-500">
    Suggestions
  </div>
  

  <div className="flex flex-col gap-2 text-xs">

    {wordCount < 5 && (
      <div className="px-2 py-1 bg-zinc-900 rounded text-zinc-400">
        • Add more dialogue or narration
      </div>
    )}

    {intensity === "Low" && (
      <div className="px-2 py-1 bg-zinc-900 rounded text-zinc-400">
        • Increase emotional intensity
      </div>
    )}

    {driftState === "Sharp Shift" && (
      <div className="px-2 py-1 bg-zinc-900 rounded text-zinc-400">
        • Reduce narrative drift
      </div>
    )}

    {narrativeState === "Light" && (
      <div className="px-2 py-1 bg-zinc-900 rounded text-zinc-400">
        • Add more detail to this panel
      </div>
    )}

    {narrativeState === "Dense" && (
      <div className="px-2 py-1 bg-zinc-900 rounded text-zinc-400">
        • Reduce dialogue density
      </div>
    )}

  </div>
  

</div>

  <div className="text-xs text-zinc-400">
    Words: {wordCount}
  </div>

  <div className="text-xs text-zinc-400">
    Characters: {charCount}
  </div>

</div>
          </div>
        )}
      </div>
      
      {/* CHARACTER PANEL */}

{activeRightTab === "characters" && (

  <div className="p-4 flex flex-col gap-4 overflow-auto">

    <div className="text-xs uppercase text-zinc-500">
      Characters
    </div>

    <button
      onClick={() => {
        setCharacters([
          ...characters,
          {
            id: crypto.randomUUID(),
            name: "",
            description: "",
          },
        ])
      }}
      className="text-xs text-zinc-400 hover:text-white"
    >
      + Add Character
    </button>

    <div className="flex flex-col gap-3 overflow-auto">

      {characters.map((c, i) => (

        <div
          key={c.id}
          className="bg-zinc-900 p-2 rounded flex flex-col gap-2"
        >

          <input
            value={c.name}
            placeholder="Name"
            onChange={(e) => {
              const copy = [...characters]
              copy[i].name = e.target.value
              setCharacters(copy)
            }}
            className="bg-zinc-800 text-xs p-1 rounded"
          />

          <textarea
            value={c.description}
            placeholder="Description"
            onChange={(e) => {
              const copy = [...characters]
              copy[i].description = e.target.value
              setCharacters(copy)
            }}
            className="bg-zinc-800 text-xs p-1 rounded"
          />

        </div>

      ))}

    </div>

  </div>

)}




      {/* 🔥 ACTIVITY DRAWER */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-72 bg-zinc-950 border-t border-zinc-800 transform transition-transform duration-300 z-50 ${
          isActivityOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="h-full flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
            <span className="text-sm text-zinc-400 uppercase">
              Activity Log
            </span>

            <button
  onClick={() => setIsActivityOpen(false)}
  className="
    text-xs

    text-zinc-500
    hover:text-white

    px-3 py-1
    rounded-md

    transition-all duration-200

    hover:bg-zinc-800
    active:scale-95
  "
>
  Close
</button>
          </div>

          {/* Log Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 text-xs text-zinc-400 space-y-2">
            {activityEntries.map((entry, index) => (
              <div key={index} className="flex justify-between">
                <span>{entry.actionType}</span>
                <span>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                {showRecoveryPrompt && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-96">
      <h2 className="text-sm uppercase text-zinc-400 mb-4">
        Recovery Available
      </h2>

      <p className="text-sm text-zinc-300 mb-6">
        We found a newer autosaved version of this chapter.
        Would you like to restore it?
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowRecoveryPrompt(false)}
          className="text-sm text-zinc-400 hover:text-white"
        >
          Ignore
        </button>

        <button
          onClick={reloadFromStorage}
          className="text-sm px-4 py-2 bg-white text-black rounded-md"
        >
          Restore
        </button>
      </div>
    </div>
  </div>
)}
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}
