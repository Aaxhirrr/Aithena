export async function getNearby(lat, lng) {
  return { lat, lng, results: [] }
}

export async function checkIn(lat, lng) {
  return { ok: true, lat, lng }
}

