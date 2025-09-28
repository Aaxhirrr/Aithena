export async function login(email, password) {
  return { token: 'mock', user: { email } }
}

export async function signup(email, password) {
  return { token: 'mock', user: { email } }
}

export async function me() {
  return { email: 'demo@example.com' }
}

