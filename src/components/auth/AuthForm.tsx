"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login, signup } from "@/app/actions/auth"
import Link from "next/link"

type AuthFormProps = {
  mode: "login" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    const password = formData.get("password") as string
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (mode === "signup") {
      const confirmPassword = formData.get("confirmPassword") as string
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }
    }

    startTransition(async () => {
      try {
        if (mode === "signup") {
          const result = await signup(formData)
          if (result.error) {
            setError(result.error)
          } else {
            setSuccess(result.message || "Account created! Check your email to verify.")
          }
        } else {
          const result = await login(formData)
          if (result?.error) {
            setError(result.error)
          }
          // No success message on login - redirect happens automatically
        }
      } catch {
        setError("An unexpected error occurred")
      }
    })
  }

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#001a1a" }}
      className="w-full flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <div style={{ maxWidth: "448px" }} className="w-full">
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{ fontSize: "36px", lineHeight: "40px", color: "#FFC300", marginBottom: "8px" }}
            className="font-bold tracking-tight"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p style={{ fontSize: "16px", lineHeight: "24px", color: "rgba(168, 240, 240, 0.7)" }}>
            {mode === "login" ? "Enter your credentials to access your account" : "Fill in your details to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: "32px" }}>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="email"
                style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
                className="font-medium block"
              >
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={isPending}
                style={{ height: "48px", backgroundColor: "#002929", borderColor: "#004d4d", color: "#A8F0F0" }}
                className="w-full placeholder:text-[#004d4d] focus:border-[#FFC300] focus:ring-[#FFC300]/20"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="password"
                style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
                className="font-medium block"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                style={{ height: "48px", backgroundColor: "#002929", borderColor: "#004d4d", color: "#A8F0F0" }}
                className="w-full placeholder:text-[#004d4d] focus:border-[#FFC300] focus:ring-[#FFC300]/20"
              />
            </div>

            {mode === "signup" && (
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="confirmPassword"
                  style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
                  className="font-medium block"
                >
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isPending}
                  style={{ height: "48px", backgroundColor: "#002929", borderColor: "#004d4d", color: "#A8F0F0" }}
                  className="w-full placeholder:text-[#004d4d] focus:border-[#FFC300] focus:ring-[#FFC300]/20"
                />
              </div>
            )}
          </div>

          {error && (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderColor: "rgba(239, 68, 68, 0.5)",
                borderWidth: "1px",
                borderRadius: "8px",
                color: "#fca5a5",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                borderColor: "rgba(34, 197, 94, 0.5)",
                borderWidth: "1px",
                borderRadius: "8px",
                color: "#86efac",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          )}

          <Button
            type="submit"
            style={{ height: "48px", fontSize: "16px", backgroundColor: "#FFC300", color: "#001a1a" }}
            className="w-full font-semibold hover:bg-[#ffcd1a] transition-all"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="text-center">
          <div
            style={{ fontSize: "14px", lineHeight: "20px", color: "rgba(168, 240, 240, 0.6)" }}
          >
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              style={{ color: "#FFC300" }}
              className="hover:text-[#ffcd1a] font-semibold transition-colors"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
