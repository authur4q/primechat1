'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import styles from "./userprofile.module.css"
import Link from "next/link"

function UserProfile() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id 

  const [targetUser, setTargetUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return

      try {
        setLoading(true)
        const res = await fetch(`/api/register/${userId}`)
        const data = await res.json()
        
        if (res.ok) {
          setTargetUser(data)
        } else {
          console.error("User fetch failed:", data.error)
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  if (loading) return <div className={styles.loading}>Loading Profile...</div>
  if (!targetUser) return <div className={styles.error}>User not found</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← Back
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.topSection}>
          <div className={styles.avatarExtraLarge}>
            {targetUser.username?.[0].toUpperCase() || 'U'}
          </div>
          <h1 className={styles.username}>{targetUser.username}</h1>
          <p className={styles.status}>{targetUser.role}</p>
        </div>

        <div className={styles.aboutSection}>
          <h3>About</h3>
          <p className={styles.aboutText}>
            {targetUser.about || `Hey there! I am using PrimeChat.`}
          </p>
        </div>

        <div className={styles.detailsCard}>
          <div className={styles.detailItem}>
            <label>Phone Number</label>
            <span>{targetUser.phone || 'Private'}</span>
          </div>
        </div>

        <div className={styles.socialSection}>
          <h3>Social links</h3>
          <div className={styles.socialGrid}>

                        <Link href={targetUser.instagram} className={styles.socialItem}>
              <span className={styles.socialLabel}>Instagram</span>

            </Link>

            <Link href={targetUser.tiktok} className={styles.socialItem}>
              <span className={styles.socialLabel}>TikTok</span>

            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile