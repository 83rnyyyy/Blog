import React from 'react';
import styles from './menuCategories.module.css';
import Link from 'next/link';
import Image from 'next/image'; 

const MenuCategories = () => {
    return(
        <div className={styles.categoryList}>
            <Link href="/blog?cat=style" className={`${styles.categoryItem} ${styles.academics}`}>
                Academics
            </Link>

            <Link href="/blog?cat=style" className={`${styles.categoryItem} ${styles.fashion}`}>
                Fashion
            </Link>

            <Link href="/blog?cat=style" className={`${styles.categoryItem} ${styles.food}`}>
                Food
            </Link>

            <Link href="/blog?cat=style" className={`${styles.categoryItem} ${styles.sports}`}>
                Sports
            </Link>

            <Link href="/blog?cat=style" className={`${styles.categoryItem} ${styles.travel}`}>
                Travel
            </Link>

            <Link href="/blog?cat=style" className={`${styles.categoryItem} ${styles.random}`}>
                Random
            </Link>



        </div>

    )
}

export default MenuCategories;


