import { BrowserRouter, Routes, Route } from "react-router-dom"

import AppShell from "./AppShell"
import EditorPage from "../pages/EditorPage"

export default function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        <Route element={<AppShell />}>

          <Route path="/" element={<div>Landing</div>} />

          <Route path="/app" element={<div>Dashboard</div>} />

          <Route path="/app/editor" element={<EditorPage />} />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}