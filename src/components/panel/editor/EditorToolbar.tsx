interface EditorToolbarProps {
  chapterTitle?: string
  pageIndex: number
  panelCount: number
  saveStatus: "idle" | "dirty" | "saving" | "saved"
  version: number
  hasExternalUpdate: boolean
  onReload: () => void
  onOpenActivity: () => void
}

export default function EditorToolbar({
  chapterTitle,
  pageIndex,
  panelCount,
  saveStatus,
  version,
  hasExternalUpdate,
  onReload,
  onOpenActivity
}: EditorToolbarProps) {
  const saveColor =
    saveStatus === "saved"
      ? "text-green-400"
      : saveStatus === "saving"
      ? "text-yellow-400"
      : saveStatus === "dirty"
      ? "text-orange-400"
      : "text-zinc-500"

  const saveLabel =
    saveStatus === "dirty"
      ? "Unsaved changes"
      : saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
      ? "Saved"
      : ""

  return (
    <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-6 text-sm text-zinc-400">

      <div className="flex gap-6 items-center">

        <span>{chapterTitle}</span>

        <span>Page {pageIndex + 1}</span>

        <span>{panelCount} Panels</span>

        <div className="flex items-center gap-2 text-xs">

  <div
    className={`
      w-2 h-2 rounded-full

      ${
        saveStatus === "saved"
          ? "bg-green-400"
          : saveStatus === "saving"
          ? "bg-yellow-400 animate-pulse"
          : saveStatus === "dirty"
          ? "bg-orange-400"
          : "bg-zinc-500"
      }
    `}
  />

  <span
    className={`
      transition-colors duration-200

      ${
        saveStatus === "saved"
          ? "text-green-400"
          : saveStatus === "saving"
          ? "text-yellow-400"
          : saveStatus === "dirty"
          ? "text-orange-400"
          : "text-zinc-500"
      }
    `}
  >
    {saveLabel}
  </span>

</div>

        <span className="text-xs text-zinc-500 transition-opacity duration-300">
  v{version}
</span>
        {hasExternalUpdate && (
          <div className="flex items-center gap-3 ml-4">
            <span className="text-xs text-red-400">
              External changes detected
            </span>

            <button
              onClick={onReload}
              className="text-xs px-2 py-1 border border-red-400 text-red-400 rounded hover:bg-red-400 hover:text-black transition-colors"
            >
              Reload
            </button>
          </div>
        )}

      </div>

      <button
        onClick={onOpenActivity}
        className="text-xs text-zinc-500 hover:text-white transition-colors"
      >
        Activity
      </button>

    </div>
  )
}