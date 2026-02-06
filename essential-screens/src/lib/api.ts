const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function resizeImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
  // Load image
  const imgBitmap = await createImageBitmap(file)

  const ratio = imgBitmap.width / imgBitmap.height
  const width = Math.min(maxWidth, imgBitmap.width)
  const height = Math.round(width / ratio)

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(imgBitmap, 0, 0, width, height)

  // Convert to JPEG blob (smaller than PNG)
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality })
  return blob
}

export async function analyzeImage(file: File, userId = 'demo_user') {
  // Resize/compress on the client to reduce upload latency
  let uploadBlob: Blob
  try {
    uploadBlob = await resizeImage(file, 1200, 0.7)
  } catch (e) {
    // Fallback to original file if resizing fails
    uploadBlob = file
  }

  const form = new FormData()
  // Ensure filename and type are preserved
  form.append('file', uploadBlob, file.name.replace(/\.[^.]+$/, '.jpg'))
  form.append('user_id', userId)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s

  const res = await fetch(`${BACKEND_URL}/analyze?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: form,
    signal: controller.signal,
  })
  clearTimeout(timeout)

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getHistory(userId: string) {
  const res = await fetch(`${BACKEND_URL}/history/${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getCoach(userId: string) {
  const res = await fetch(`${BACKEND_URL}/coach/${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function chat(userId: string, message: string) {
  const res = await fetch(`${BACKEND_URL}/chat/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getChats(userId: string) {
  const res = await fetch(`${BACKEND_URL}/chats/${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function voiceChat(userId: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BACKEND_URL}/voice_chat/${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function register(userData: any) {
  const res = await fetch(`${BACKEND_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function login(credentials: any) {
  const res = await fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
