export function getPanelText(panel: any): string {
  if (!panel) return ""

  if (panel.panel && panel.panel.dialogue) {
    return panel.panel.dialogue.map((d: any) => d.text).join(" ")
  }

  if (panel.text) {
    return panel.text
  }

  return ""
}