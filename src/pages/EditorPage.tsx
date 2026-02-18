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
    const updated = [...chapters]
    updated[currentChapterIndex]
      .pages[currentPageIndex]
      .panels[currentPanelIndex].text = text
    setChapters(updated)
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

  const addPage = () => {
    setChapters(prev => {
      const updated = [...prev]
      const newPageIndex =
        updated[currentChapterIndex].pages.length

      updated[currentChapterIndex].pages.push({
        id: `page-${newPageIndex + 1}`,
        panels: [{ id: "panel-1", text: "" }],
      })

      setCurrentPageIndex(newPageIndex)
      setCurrentPanelIndex(0)

      return updated
    })
  }

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

