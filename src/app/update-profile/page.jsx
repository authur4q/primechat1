'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import styles from "./updateprofile.module.css"

function UpdateProfile() {
  const router = useRouter()
  const { data: session, update, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    about: '',
    phone: '',
    instagram: '',
    tiktok: ''
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    
    if (session?.user) {
      setFormData({
        username: session.user.username || '',
        about: session.user.about || '',
        phone: session.user.phone || '',
        instagram: session.user.instagram || '',
        tiktok: session.user.tiktok || ''
      })
    }
  }, [session, status, router])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          oldUsername: session?.user?.username 
        }),
      })

      const data = await res.json()

      if (res.ok) {
        await update({
          ...formData
        })
        
        router.push('/myprofile')
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") return <div className={styles.container}>Loading...</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          Cancel
        </button>
        <h1 className={styles.title}>Update Profile</h1>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.section}>
          <label className={styles.label}>Username</label>
          <input
            type="text"
            name="username"
            className={styles.input}
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>About Me</label>
          <textarea
            name="about"
            className={styles.textarea}
            placeholder="Write something about yourself..."
            value={formData.about}
            onChange={handleChange}
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Phone Number</label>
          <input
            type="text"
            name="phone"
            className={styles.input}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Social Channels</label>
          <div className={styles.socialInputs}>
            <div className={styles.inputGroup}>
              <span className={styles.prefix}>ig/</span>
              <input
                type="text"
                name="instagram"
                className={styles.input}
                placeholder="Instagram URL"
                value={formData.instagram}
                onChange={handleChange}
              />
            </div>
            <div className={styles.inputGroup}>
              <span className={styles.prefix}>tk/</span>
              <input
                type="text"
                name="tiktok"
                className={styles.input}
                placeholder="TikTok URL"
                value={formData.tiktok}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.actionArea}>
          <button 
            type="submit" 
            className={styles.saveBtn}
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Update Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateProfile