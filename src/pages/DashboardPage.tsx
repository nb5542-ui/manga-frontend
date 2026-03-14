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
    <div className="h-full bg-black text-white p-8">

      <h1 className="text-2xl mb-6">
        Your Stories
      </h1>


      <button
        onClick={createStory}
        className="mb-6 px-4 py-2 bg-white text-black rounded"
      >
        New Story
      </button>


      <div className="space-y-4">

        {stories.map(story => (

          <div
            key={story.id}
            className="border border-zinc-800 p-4 rounded flex justify-between"
          >

            <div>{story.title}</div>

            <button
              onClick={() => openStory(story.id)}
              className="px-3 py-1 bg-white text-black rounded"
            >
              Open
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}