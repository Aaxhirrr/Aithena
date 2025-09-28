export async function getDoc(path) {
  return { path, data: {} }
}

export async function setDoc(path, data) {
  return { path, data }
}

