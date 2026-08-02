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
