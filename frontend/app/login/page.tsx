"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function HomePage() {

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <a href="/login" className="text-blue-600 underline">
          Go to Login
        </a>
      </div>
    )
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">CoreInventory Dashboard</h1>

      <p className="mt-4">Logged in as:</p>
      <p className="font-semibold">{user.email}</p>

      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  )
}