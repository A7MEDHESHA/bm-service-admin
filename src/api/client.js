const BASE_URL = import.meta.env.VITE_API_URL

// Every other file in /api calls this. It attaches the auth token and turns
// a non-200 response into a thrown Error with the backend's error message.
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // TEMPORARY: Don't send auth header for now since backend doesn't use it
      // ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const error = new Error(data?.message || data?.error || 'Something went wrong, please try again.')
    error.status = res.status
    throw error
  }

  return data
}