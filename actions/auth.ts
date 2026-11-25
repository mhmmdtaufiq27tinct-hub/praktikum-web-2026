"use server"

import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "../prisma/prisma"

type AuthState = { error?: string } | undefined

export async function registerAction(_prevState: AuthState, formData: FormData) {
    const nameValue = formData.get("name")
    const emailValue = formData.get("email")
    const passwordValue = formData.get("password")

    if (typeof nameValue !== "string" || typeof emailValue !== "string" || typeof passwordValue !== "string") {
        return { error: "Semua data harus diisi!" }
    }

    const name = nameValue.trim()
    const email = emailValue.trim().toLowerCase()
    const password = passwordValue
    if (!name || !email || !password) {
        return { error: "Semua data harus diisi!" }
    }

    if (password.length < 6) {
        return { error: "Password minimal 6 karakter!" }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
        return { error: "Email sudah terdaftar di sistem silakan login" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { name, email, password: hashedPassword } })
    redirect("/login")
}

export async function loginAction(_prevState: AuthState, formData: FormData) {
    const emailValue = formData.get("email")
    const passwordValue = formData.get("password")
    if (typeof emailValue !== "string" || typeof passwordValue !== "string") {
        return { error: "Email dan password harus diisi!" }
    }

    const email = emailValue.trim().toLowerCase()
    const password = passwordValue
    if (!email || !password) {
        return { error: "Email dan password harus diisi!" }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return { error: "Email belum terdaftar silahkan register" }
    }

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) {
        return { error: "Password salah!" }
    }

    const sessionPayload = JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginAt: new Date().toISOString(),
    })

    const cookieStore = await cookies()
    cookieStore.set("praktikum_session", sessionPayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
    })

    redirect("/dashboard")
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete("praktikum_session")
    redirect("/login")
}
