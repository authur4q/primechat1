"use client"
import { useState } from "react"
import styles from "./login.module.css"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    })

    if (res.ok) {
      router.push("/") 
    } else {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) return alert("Please enter your email first.")

    try {
      const res = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        alert("Check your inbox for a reset link!")
      } else {
        setError("Could not send reset email.")
      }
    } catch (err) {
      setError("Network error. Try again later.")
    }
  }

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.formSection}>
          <div className={styles.logoArea}>
           
            <h1 className={styles.logoText}>PrimeChat</h1>
          </div>
          
          <form onSubmit={handleLogin} className={styles.form}>
            <input 
              type="email" 
              placeholder='Email' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
            <input 
              type="password" 
              placeholder='Password' 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            
            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            
            <button type="button" onClick={handleForgotPassword} className={styles.forgotBtn}>
              Forgot Password?
            </button>

            <div className={styles.divider}>
              <span>Or</span>
            </div>

            <Link href="/register">
              <button type="button" className={styles.registerBtn}>
                New to PrimeChats? Sign Up
              </button>
            </Link>
          </form>
        </div>

        <div className={styles.infoSection}>
          <h1>Connect with the world on PrimeChat.</h1>
          <p>Experience the next generation of real-time communication.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
