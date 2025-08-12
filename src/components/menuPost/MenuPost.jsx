import React from "react";
import styles from "./menuPost.module.css";
import Link from "next/link";
import Image from "next/image";

const MenuPost = ({ withImage, posts = [] }) => {
    // If no posts provided, show your original static data
    if (!posts || posts.length === 0) {
        return (
            <div className={styles.items}>
                <Link href="/" className={styles.item}>
                    {withImage && (
                        <div className={styles.imageContainer}>
                            <Image src="/p1.jpeg" alt="Trending Image 1" fill priority className={styles.image} />
                        </div>
                    )}
                    <div className={styles.textContainer}>
                        <span className={`${styles.category} ${styles.travel}`}>Travel</span>
                        <h3 className={styles.postTitle}>No posts available</h3>
                        <div className={styles.detail}>
                            <span className={styles.username}>By Admin</span>
                            <span className={styles.date}>Today</span>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.items}>
            {posts.slice(0, 5).map((post, index) => ( // Ensure max 5 posts
                <Link href={`/posts/${post.slug}`} className={styles.item} key={post.id}>
                    {withImage && post.img && (
                        <div className={styles.imageContainer}>
                            <Image 
                                src={post.img} 
                                alt={post.title} 
                                fill 
                                priority={index < 2} // Only first 2 images get priority
                                className={styles.image} 
                            />
                        </div>
                    )}
                    <div className={styles.textContainer}>
                        <span className={`${styles.category} ${styles[post.catSlug]}`}>
                            {post.cat?.title || post.catSlug}
                        </span>
                        <h3 className={styles.postTitle}>
                            {post.title?.length > 50 
                                ? post.title.substring(0, 50) + "..." 
                                : post.title
                            }
                        </h3>
                        <div className={styles.detail}>
                            <span className={styles.username}>
                                By {post.user?.name} 
                            </span>
                             <span> • </span>
                            <span className={styles.date}>
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                             <span> • </span>
                            <span className={styles.views}>
                                {post.views || 0} views
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default MenuPost;