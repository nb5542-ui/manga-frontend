import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

type Story = {
  id: string
  title: string
}

export default function DashboardPage() {

  const navigate = useNavigate()

  const [stories, setStories] = useState<Story[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("manga-stories")

    if (saved) {
      setStories(JSON.parse(saved))
    } else {
      const initial = [
        { id: "1", title: "My First Story" }
      ]

      localStorage.setItem(
        "manga-stories",
        JSON.stringify(initial)
      )

      setStories(initial)
    }
  }, [])


  const openStory = (id: string) => {
    navigate(`/app/story/${id}/editor`)
  }


  const createStory = () => {
  const saved = localStorage.getItem("manga-stories")

  const existing = saved ? JSON.parse(saved) : []

  const newId = Date.now().toString()

  const newStory = {
    id: newId,
    title: `Story ${existing.length + 1}`
  }

  const updated = [...existing, newStory]

  localStorage.setItem(
    "manga-stories",
    JSON.stringify(updated)
  )

  setStories(updated)
}

  return (
  <div className="h-full bg-bgMain text-textMain p-8">

    <h1 className="text-2xl font-semibold mb-6">
      Your Stories
    </h1>


    <button
      onClick={createStory}
      className="mb-6 px-4 py-2 rounded-xl bg-accent hover:bg-accentSoft text-white shadow-lg shadow-black/40"
    >
      New Story
    </button>


    <div className="space-y-4">

      {stories.map(story => (

        <div
          key={story.id}
          className="
            bg-bgPanel
            border border-borderMain
            rounded-xl
            p-4
            flex
            justify-between
            items-center
            hover:bg-bgSoft
            transition
          "
        >

          <div className="text-lg">
            {story.title}
          </div>

          <button
            onClick={() => openStory(story.id)}
            className="
              px-3 py-1
              rounded-lg
              bg-bgSoft
              hover:bg-accent
              text-textMain
              transition
            "
          >
            Open
          </button>

        </div>

      ))}

    </div>

  </div>
  )
}
