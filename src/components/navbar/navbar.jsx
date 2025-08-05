import React from "react";
import Image from "next/image";
import styles from "./navbar.module.css"
import AuthLinks from "../authLinks/AuthLinks";
import Link from "next/link"; 
import ThemeToggle from "../themetoggle/ThemeToggle";
const Navbar = () => {
    return (
        <div className={styles.container2}>
            {/* <div className={styles.media}>
                <div className={styles.social}>
                        <Image src="/instagram.png" alt ="instagram" width={24} height={24}/>
                        <Image src="/youtube.png" alt ="youtube" width={24} height={24}/>
                        <Image src="/tiktok.png" alt ="tiktok" width={24} height={24}/>
                        <Image src="/facebook.png" alt ="facebook" width={24} height={24}/>
                </div>
            </div> */}
            <div className={styles.container}>
                <div className={styles.logo}>TeenageTheory</div>
                <div className={styles.social}>
                    {/* <Image src="/instagram.png" alt ="instagram" width={24} height={24}/>
                    <Image src="/youtube.png" alt ="youtube" width={24} height={24}/>
                    <Image src="/tiktok.png" alt ="tiktok" width={24} height={24}/>
                    <Image src="/facebook.png" alt ="facebook" width={24} height={24}/> */}
                </div>
                
                <div className={styles.links}>
                    <ThemeToggle/>
                    <Link href="/" className={styles.link}>Homepage</Link>
                    <Link href="/" className={styles.link}>Contact</Link>
                    <Link href="/"className={styles.link}>About</Link>
                    <AuthLinks/>

                </div>
            </div>
        </div>
    )
}

export default Navbar

