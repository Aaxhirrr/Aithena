import React from 'react'
import ImmediateRecommendations from './ImmediateRecommendations.jsx'

// Backwards-compatible wrapper: we no longer do course study plans.
// Render the Instant Match people recommender instead.
export default function CourseRecommendations() {
  return <ImmediateRecommendations />
}

