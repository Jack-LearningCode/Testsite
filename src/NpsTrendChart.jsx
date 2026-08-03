export function NpsTrendChart({ buckets }) {
  if (buckets.length < 2) {
    return (
      <p className="field-hint">
        Not enough data yet for a trend — check back after a few weeks of responses.
      </p>
    )
  }

  const width = 640
  const height = 200
  const paddingX = 8
  const paddingTop = 16
  const paddingBottom = 24
  const zeroY = paddingTop + (height - paddingTop - paddingBottom) / 2
  const halfHeight = (height - paddingTop - paddingBottom) / 2
  const scaleY = halfHeight / 100

  const slotWidth = (width - paddingX * 2) / buckets.length
  const barWidth = Math.min(slotWidth * 0.5, 36)

  const showEveryLabel = buckets.length <= 8

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart" role="img">
      <line x1={paddingX} y1={zeroY} x2={width - paddingX} y2={zeroY} className="trend-chart-baseline" />
      {buckets.map((bucket, i) => {
        const slotX = paddingX + i * slotWidth
        const barX = slotX + (slotWidth - barWidth) / 2
        const barHeight = Math.max(Math.abs(bucket.score) * scaleY, bucket.total ? 2 : 0)
        const barY = bucket.score >= 0 ? zeroY - barHeight : zeroY
        const showLabel = showEveryLabel || i === 0 || i === buckets.length - 1 || i % 2 === 0

        return (
          <g key={bucket.weekStart}>
            <rect
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              rx={3}
              className={bucket.score >= 0 ? 'trend-bar positive' : 'trend-bar negative'}
            >
              <title>{`Week of ${bucket.label}: ${bucket.score > 0 ? '+' : ''}${bucket.score} NPS (${bucket.total} response${bucket.total === 1 ? '' : 's'})`}</title>
            </rect>
            {showLabel && (
              <text x={slotX + slotWidth / 2} y={height - 6} textAnchor="middle" className="trend-chart-label">
                {bucket.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
