import React from "react";
import styles from "./featured.module.css"
import Image from "next/image";
const Featured = () => {
    return (

        <div className={styles.container}>
            <h1 className={styles.title}>
                <i><b>Welcome</b></i>
            </h1>
            <div className={styles.post}>
                <div className={styles.imgContainer}>
                    <Image src="/p1.jpeg" alt="Featured" fill priority sizes="(max-width: 768px) 100vw, 600px" className={styles.image} />
                </div>

                <div className={styles.textContainer}>
                    <h1 className={styles.postTitle}> asidojhaowidjaowdijasjdoaiwjd</h1>
                    <p className={styles.postDesc}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <button className={styles.button}>Read More</button>
                </div>
            </div>
        </div>
    )
}

export default Featured

