import React from "react";
import styles from "./categoryList.module.css"
import Image from "next/image";
import Link from "next/link";
const CategoryList = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Popular Categories</h1>
            <div className={styles.categories}>
                
                <Link href="/blog?cat=academics" className={`${styles.category} ${styles.academics}`}>
                    <Image 
                        src="/academic.jpg"
                        alt=""
                        width={32}
                        height={32}
                        className={styles.image}                        
                    />
                    Academics
                </Link>

                 <Link href="/blog?cat=food" className={`${styles.category} ${styles.food}`}>
                    <Image 
                        src="/food.png"
                        alt=""
                        width={32}
                        height={32}
                        className={styles.image}                        
                    />
                    Food
                </Link>
                 <Link href="/blog?cat=fashion" className={`${styles.category} ${styles.fashion}`}>
                    <Image 
                        src="/fashion.png"
                        alt=""
                        width={32}
                        height={32}
                        className={styles.image}                        
                    />
                    Fashion
                </Link>
                 <Link href="/blog?cat=travel" className={`${styles.category} ${styles.travel}`}>
                    <Image 
                        src="/travel.png"
                        alt=""
                        width={32}
                        height={32}
                        className={styles.image}                        
                    />
                    Travel
                </Link>
                <Link href="/blog?cat=sports" className={`${styles.category} ${styles.sports}`}>
                    <Image 
                        src="/sports.jpg"
                        alt=""
                        width={32}
                        height={32}
                        className={styles.image}                        
                    />
                    Sports
                </Link>
                <Link href="/blog?cat=random" className={`${styles.category} ${styles.random}`}>
                    <Image 
                        src="/random.png"
                        alt=""
                        width={32}
                        height={32}
                        className={styles.image}                        
                    />
                    Random
                </Link>
                
                
            </div>
        </div>
    )
}

export default CategoryList

