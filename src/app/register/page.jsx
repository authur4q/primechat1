'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './register.module.css'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password,phone }),
      })

      if (res.ok) {
        router.push('/login')
      } else {
        const data = await res.json()
        setError(data.message || 'Registration failed. Try a different username or email.')
      }
    } catch (err) {
      setError('Network error. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.register}>
      <div className={styles.container1}>
        <div className={styles.logoArea}>
          
          <h1 className={styles.logoText}>PrimeChat</h1>
        </div>

        <form className={styles.epp} onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.signup}>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <h2>Or</h2>
            <Link href="/login">
              <button type="button" className={styles.loginLinkBtn}>
                Already have an account? Login
              </button>
            </Link>
          </div>
        </form>
      </div>

      <div className={styles.container2}>
        <h1>Join the Prime Community.</h1>
        <p>The fastest way to connect, share, and chat.</p>
      </div>
    </div>
  )
}