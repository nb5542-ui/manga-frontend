import { BrowserRouter, Routes, Route } from "react-router-dom"

import AppShell from "./AppShell"
import EditorPage from "../pages/EditorPage"
import DashboardPage from "../pages/DashboardPage"
<Route path="/app" element={<DashboardPage />} />

export default function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        <Route element={<AppShell />}>

          <Route path="/" element={<div>Landing</div>} />

          <Route path="/app" element={<DashboardPage />} />

          <Route path="/app/story/:storyId/editor" element={<EditorPage />} />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}