
'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return '密码错误。'
                default:
                    return '发生错误，请重试。'
            }
        }
        throw error
    }
}
