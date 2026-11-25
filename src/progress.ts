export type PlanTask = { title: string; done: boolean }
export type PlanPhase = { title: string; tasks: PlanTask[] }

export function parseMarkdownPlan(markdown: string): PlanPhase[] {
  const phases: PlanPhase[] = []
  let current: PlanPhase = { title: 'Tasks', tasks: [] }
  const lines = markdown.split(/\r?\n/)
  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.+)$/)
    if (heading) {
      if (current.tasks.length || current.title !== 'Tasks') phases.push(current)
      current = { title: heading[1].trim(), tasks: [] }
      continue
    }
    const task = line.match(/^\s*[-*+]\s*\[(x|X| )\]\s+(.+)$/)
    if (task) current.tasks.push({ title: task[2].trim(), done: task[1].toLowerCase() === 'x' })
  }
  if (current.tasks.length) phases.push(current)
  return phases.filter(phase => phase.tasks.length)
}

export function progressFromPhases(phases: PlanPhase[]) {
  const all = phases.flatMap(phase => phase.tasks)
  const total = all.length
  const done = all.filter(task => task.done).length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
}

export function parseLogbook(markdown: string, maxEntries = 5) {
  return markdown.split(/\r?\n/).filter(line => /^\s*[-*+]\s+/.test(line))
    .map(line => line.replace(/^\s*[-*+]\s+/, '').trim()).slice(0, maxEntries)
}