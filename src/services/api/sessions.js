export async function createSession(payload) {
  return { id: 'session_1', ...payload }
}

export async function listSessions() {
  return []
}

