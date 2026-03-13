import { Outlet, Link } from "react-router-dom"

export default function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-black text-white">

      {/* Header */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 gap-4">

        <Link to="/" className="text-sm text-zinc-400">
          Home
        </Link>

        <Link to="/app" className="text-sm text-zinc-400">
          Dashboard
        </Link>

        <Link to="/app/editor" className="text-sm text-zinc-400">
          Editor
        </Link>

      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

    </div>
  )
}