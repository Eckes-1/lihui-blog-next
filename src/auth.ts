
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const pw = process.env.ADMIN_PASSWORD
                if (!pw) throw new Error("ADMIN_PASSWORD not set")

                if (credentials.password === pw) {
                    // Return a user object
                    return { id: "1", name: "Admin", email: "admin@example.com" }
                }
                return null
            },
        }),
    ],
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnAdmin = nextUrl.pathname.startsWith("/admin")
            const isOnLogin = nextUrl.pathname.startsWith("/admin/login")

            if (isOnAdmin) {
                if (isOnLogin) return true // Allow access to login page
                if (isLoggedIn) return true // Allow access to admin if logged in
                return false // Redirect unauthenticated users to login page
            }
            return true
        },
    },
})
