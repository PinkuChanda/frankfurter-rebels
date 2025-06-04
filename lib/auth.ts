// Simple password storage - no bcrypt, just plain text for now
const ADMIN_EMAIL = "admin@frankfurterrebels.de"
let ADMIN_PASSWORD = "admin123" // Default password

export async function verifyAdminCredentials(email: string, password: string) {
  // Simple check - no database needed for now
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export async function changeAdminPassword(email: string, currentPassword: string, newPassword: string) {
  // Verify current password
  if (email !== ADMIN_EMAIL || currentPassword !== ADMIN_PASSWORD) {
    throw new Error("Current password is incorrect")
  }

  // Update password in memory
  ADMIN_PASSWORD = newPassword

  return { success: true, message: "Password changed successfully" }
}

export async function createAdminSession(email: string) {
  const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString("base64")
  return sessionToken
}

export async function verifyAdminSession(token: string | null): Promise<boolean> {
  if (!token) return false

  try {
    const decoded = Buffer.from(token, "base64").toString()
    const [email, timestamp] = decoded.split(":")

    const sessionAge = Date.now() - Number.parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    return email === ADMIN_EMAIL && sessionAge < maxAge
  } catch {
    return false
  }
}
