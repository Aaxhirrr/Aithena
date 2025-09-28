import { db } from './config.js'
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot, collection, query, where } from 'firebase/firestore'

export async function upsertPresence(uid, data = {}) {
  const ref = doc(db, 'presence', uid)
  await setDoc(ref, { updatedAt: serverTimestamp(), ...data }, { merge: true })
}

export async function setDiscoverable(uid, value) {
  const ref = doc(db, 'presence', uid)
  await setDoc(ref, { discoverable: !!value, updatedAt: serverTimestamp() }, { merge: true })
}

export function subscribeDiscoverable(callback) {
  const q = query(collection(db, 'presence'), where('discoverable', '==', true))
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(list)
  })
}

export function startBroadcastLocation(uid, getExtra = () => ({})) {
  if (!navigator.geolocation) return () => {}
  const watchId = navigator.geolocation.watchPosition(async (pos) => {
    const { latitude: lat, longitude: lng } = pos.coords
    await upsertPresence(uid, { lat, lng, ...getExtra(), discoverable: true })
  })
  return () => navigator.geolocation.clearWatch(watchId)
}

