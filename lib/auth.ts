import { createServerSupabaseClient } from "./supabase"

export async function verifyAdminCredentials(email: string, password: string) {
  try {
    console.log("Attempting login with:", { email, password })

    const supabase = createServerSupabaseClient()

    // Get admin user from database
    const { data: adminUser, error } = await supabase.from("admin_users").select("*").eq("email", email).single()

    console.log("Database query result:", { adminUser, error })

    if (error || !adminUser) {
      console.log("Admin user not found:", error)
      return false
    }

    // Direct password comparison (no hashing for now)
    const isValidPassword = password === adminUser.password_hash
    console.log("Password comparison:", {
      provided: password,
      stored: adminUser.password_hash,
      match: isValidPassword,
    })

    return isValidPassword
  } catch (error) {
    console.error("Error in verifyAdminCredentials:", error)
    return false
  }
}

export async function changeAdminPassword(email: string, currentPassword: string, newPassword: string) {
  try {
    console.log("Changing password for:", email)

    // First verify current password
    const isCurrentPasswordValid = await verifyAdminCredentials(email, currentPassword)
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect")
    }

    const supabase = createServerSupabaseClient()

    // Update password in database (plain text for now)
    const { data, error } = await supabase
      .from("admin_users")
      .update({
        password_hash: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select()

    console.log("Password update result:", { data, error })

    if (error) {
      console.error("Database update error:", error)
      throw new Error("Failed to update password in database")
    }

    console.log("Password updated successfully in database")
    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
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

    const supabase = createServerSupabaseClient()
    const { data: adminUser, error } = await supabase.from("admin_users").select("email").eq("email", email).single()

    return !error && adminUser && sessionAge < maxAge
  } catch {
    return false
  }
}
