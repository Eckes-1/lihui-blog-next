
"use client";

import { authenticate } from "@/app/lib/auth-actions"; // Fixed import path
import { useActionState } from "react";
import "../../admin.css";

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--theme-bg)' }}>
            <form action={formAction} className="login-card" style={{ padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '320px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>Admin Login</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="form-input"
                        placeholder="Enter admin password"
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isPending}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                >
                    {isPending ? 'Checking...' : 'Login'}
                </button>

                {errorMessage && (
                    <div style={{ marginTop: '1rem', color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>
                        {errorMessage}
                    </div>
                )}
            </form>
        </div>
    );
}
