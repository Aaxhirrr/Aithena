export async function signInWithEmail(email, password) {
  return { user: { email } }
}

export async function signOut() {
  return { ok: true }
}

