import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './card.module.css';

const Card = () => {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <Image src="/p1.jpeg" alt="Post Image" fill className={styles.image} />
            </div>
            <div className={styles.textContainer}>
                <div className={styles.detail}>
                    <span className={styles.date}>11.02.2023 - </span>
                    <span className={styles.category}>Aasdasdasd</span>
                </div>

                <Link href='/'>
                    <h1> asdasdasdawdasda w</h1>
                </Link>

                <p className={styles.desc}>
                    asdasdadawdasdawdasdawdasdawdasdawdasd
                    wadsdawdasdawdasdasd
                    awdasdawdawdw1gsfbq32ewrfsdasd
                </p>

                <Link href='/' className={styles.link}>Read More</Link>

            </div>
        </div>


    )
}

export default Card;