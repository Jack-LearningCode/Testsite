export function npsCategory(score) {
  if (score <= 6) return 'detractor'
  if (score <= 8) return 'passive'
  return 'promoter'
}

export function calculateNps(responses) {
  const total = responses.length
  if (total === 0) {
    return { score: 0, total: 0, promoters: 0, passives: 0, detractors: 0 }
  }

  let promoters = 0
  let passives = 0
  let detractors = 0

  for (const response of responses) {
    const category = npsCategory(response.score)
    if (category === 'promoter') promoters += 1
    else if (category === 'passive') passives += 1
    else detractors += 1
  }

  const score = Math.round(((promoters - detractors) / total) * 100)

  return { score, total, promoters, passives, detractors }
}

function startOfWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d
}

export function bucketByWeek(responses) {
  const buckets = new Map()

  for (const response of responses) {
    const key = startOfWeek(new Date(response.created_at)).toISOString().slice(0, 10)
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(response)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, group]) => ({
      weekStart: key,
      label: new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      ...calculateNps(group),
    }))
}
