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
                    <Image src="/featured.png" alt="Featured" fill priority sizes="(max-width: 768px) 100vw, 600px" className={styles.image} />
                </div>

                <div className={styles.textContainer}>
                    <h1 className={styles.postTitle}> TeenageTheory: Your Voice, Your Story</h1>
                    <p className={styles.postDesc}>
                        A blog for teenagers to read and connect through real experiences and perspectives
                    </p>
                    <button className={styles.button}>Read More</button>
                </div>
            </div>
        </div>
    )
}

export default Featured

