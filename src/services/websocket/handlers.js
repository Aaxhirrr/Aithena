export function createHandlers() {
  return {
    onJoin: (room) => ({ type: 'join', room }),
    onLeave: (room) => ({ type: 'leave', room }),
    onMessage: (msg) => ({ type: 'message', msg }),
  }
}

