"use client";
import { useState } from "react";
import styles from "./authlinks.module.css"
import Link from 'next/link';
import { signOut, useSession } from "next-auth/react"
const AuthLinks = () => {
    const [open,setOpen] = useState(false);
    const {status} = useSession(); // Example status, replace with actual logic
    return (
    <>
    
        {status === "unauthenticated" ? (
            <Link href="/login">Login</Link>
        ) : (
            <>
                <Link href="/write">Write</Link>
                <span className={styles.link} onClick={signOut}>Logout</span>

            </>
        )}
        <div className={styles.burger} onClick={() => setOpen(!open)}>
            <div className={styles.line} ></div>
            <div className={styles.line} ></div>
            <div className={styles.line} ></div>
        </div>
        {open && (
            <div className={styles.responsiveMenu}> 
                <Link href="/" >Homepage</Link>
                <Link href="/" >Contact</Link>
                <Link href="/">About</Link>
                {status === "notauthenticated" ? (
                    <Link href="/login">Login</Link>
                ) : (
                    <>
                        <Link href="/write">Write</Link>
                        <span className={styles.link}>Logout</span>

                    </>
                )}
            </div>
        )}
    </>
    );
};

export default AuthLinks

