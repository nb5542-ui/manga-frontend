import { Outlet, Link } from "react-router-dom"

export default function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-black text-white">

      {/* Header */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 justify-between">

  {/* Left */}
  <div className="flex items-center gap-6">

    <div className="font-semibold text-white">
      AI Manga Studio
    </div>

    <Link
      to="/app"
      className="text-sm text-zinc-400 hover:text-white"
    >
      Dashboard
    </Link>

  </div>


  {/* Right */}
  <div className="text-xs text-zinc-500">
    v0.3
  </div>

</div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

    </div>
  )
}