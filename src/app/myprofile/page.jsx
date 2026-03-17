'use client'
import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '../../../ThemeProvider'
import styles from "./myprofile.module.css"
import Link from 'next/link'

const MyProfile = () => {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { theme, toggleTheme } = useTheme()
  

  const hasRefreshed = useRef(false)

  const user = session?.user

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    
    // If authenticated and we haven't refreshed yet, do it once
    if (status === "authenticated" && !hasRefreshed.current) {
      update()
      hasRefreshed.current = true
    }
  }, [status, router, update])

  if (status === "loading") {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← Back
          </button>
          <h1 className={styles.title}>My Profile</h1>
        </div>
        <button className={styles.themeToggle} onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : ' Light Mode'}
        </button>
      </header>

      <div className={styles.profileSection}>
        <div className={styles.userCard}>
          <div className={styles.userMain}>
            <div className={styles.avatarLarge}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={styles.userInfo}>
              <h2>{user?.username || 'User'}</h2>
              <p>{user?.email || 'Email not available'}</p>
              <p>{user?.phone || 'No phone added'}</p>
              <span className={styles.badge}>{user?.role}</span>
            </div>
          </div>
          <button 
            className={styles.editProfileBtn} 
            onClick={() => router.push('/update-profile')}
          >
            Edit Profile
          </button>
        </div>

        <div className={styles.aboutSection}>
           <h3>About Me</h3>
           <p className={styles.aboutText}>
             {user?.about || "No bio added yet. Tell people about yourself!"}
           </p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.sectionCard}>
            <h3>Social links</h3>
            <div className={styles.links}>
              {user?.instagram ? (
                <Link href={user.instagram} target="_blank" className={styles.linkItem}>
                  <span>Instagram</span>
                </Link>
              ) : (
                <span className={styles.disabledLink}>Instagram (Not set)</span>
              )}
              
              {user?.tiktok ? (
                <Link href={user.tiktok} target="_blank" className={styles.linkItem}>
                  <span>TikTok</span>
                </Link>
              ) : (
                <span className={styles.disabledLink}>TikTok (Not set)</span>
              )}
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h3>Account Settings</h3>
            <div className={styles.links}>
              <button className={styles.actionRow}>Privacy & Security</button>
              <button className={styles.actionRow}>Notification Settings</button>
              <button className={styles.actionRow}>Help & Support</button>
            </div>
          </div>
        </div>

        <button 
          className={styles.logoutBtn} 
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

export default MyProfile