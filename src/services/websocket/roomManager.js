export class RoomManager {
  constructor() { this.rooms = new Map() }
  join(room, user) {
    const set = this.rooms.get(room) || new Set(); set.add(user); this.rooms.set(room, set); return set.size
  }
  leave(room, user) {
    const set = this.rooms.get(room); if (set) { set.delete(user); if (!set.size) this.rooms.delete(room) }
  }
}

export default new RoomManager()

