import { Outlet, Link, useParams, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

export default function AppShell() {
   const location = useLocation()

  const [storyTitle, setStoryTitle] = useState<string | null>(null)

  useEffect(() => {

    const match = location.pathname.match(
      /\/app\/story\/(.+?)\//
    )

    if (!match) {
      setStoryTitle(null)
      return
    }

    const storyId = match[1]

    const saved = localStorage.getItem("manga-stories")

    if (!saved) return

    const stories = JSON.parse(saved)

    const story = stories.find(
      (s: any) => s.id === storyId
    )

    setStoryTitle(story?.title || null)

  }, [location.pathname])
  return (
    <div className="h-screen flex flex-col bg-black text-white">

      {/* Header */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between">

  {/* Left */}
  <div className="flex items-center gap-4">

  <div className="font-semibold text-white">
    AI Manga Studio
  </div>

  <span className="text-zinc-600">/</span>

  <Link
    to="/app"
    className="text-sm text-zinc-400 hover:text-white"
  >
    Dashboard
  </Link>

  {storyTitle && (
    <>
      <span className="text-zinc-600">/</span>

      <span className="text-sm text-white">
        {storyTitle}
      </span>
    </>
  )}

</div>


  {/* Right */}
  <div className="flex items-center gap-4">

  {storyTitle && (
    <Link
      to="/app"
      className="text-xs text-zinc-400 hover:text-white"
    >
      ← Back
    </Link>
  )}

  <div className="text-xs text-zinc-500">
    v0.3
  </div>

</div>

</div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

    </div>
  )
}