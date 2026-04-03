// src/lib/contextBuilder.ts

type BuildContextInput = {
  story: any
  chapter: any
  page: any
  panel: any
  characters: any[]
  intelligence?: any
}

export function buildGenerationContext({
  story,
  chapter,
  page,
  panel,
  characters,
  intelligence
}: BuildContextInput) {
  return {
    meta: {
      story_id: story?.id,
      chapter_id: chapter?.id,
      page_id: page?.id,
      panel_id: panel?.id,
      generation_mode: "panel",
      timestamp: new Date().toISOString()
    },

    story_context: {
      title: story?.title || "",
      genre: story?.genre || [],
      themes: story?.themes || [],
      tone: story?.tone || "neutral",
      world_rules: story?.world_rules || []
    },

    scene_context: {
      scene_id: page?.scene_id || null,
      location: page?.location || "",
      time: page?.time || "",
      atmosphere: page?.atmosphere || "",
      scene_goal: page?.scene_goal || "",
      scene_stage: page?.scene_stage || "build-up"
    },

    panel_context: {
      panel_number: panel?.number,
      panel_goal: panel?.goal || "",
      panel_type: panel?.type || "dialogue",
      continuity_from_previous: true
    },

    character_context: (characters || []).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      appearance: c.appearance,
      personality: c.personality,
      current_emotion: c.current_emotion,
      goal: c.goal,
      state: c.state
    })),

    narrative_state: {
      previous_panels_summary: extractPreviousPanels(page, panel),
      emotional_drift: intelligence?.emotional_drift || {},
      relationship_drift: intelligence?.relationship_drift || {},
      tension_curve: intelligence?.tension || 0.5,
      pacing: intelligence?.pacing || "medium"
    },

    generation_config: {
      output_format: "strict_json",
      creativity_level: 0.6,
      visual_detail_level: "high",
      dialogue_density: "medium"
    }
  }
}
function extractPreviousPanels(page: any, currentPanel: any) {
  if (!page?.panels) return []

  return page.panels
    .filter((p: any) => p.number < currentPanel.number)
    .slice(-3) // last 3 panels only
    .map((p: any) => p.text || "")
}