export const sessionStore = {
  sessions: [],
  addSession(s) { this.sessions = [...this.sessions, s] },
}

export default sessionStore

