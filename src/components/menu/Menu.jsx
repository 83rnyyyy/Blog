"use client";
import React from "react";
import styles from "./menu.module.css";
import MenuPost from "../menuPost/MenuPost";
import MenuCategories from "../menuCategories/MenuCategories";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then(res => res.json());

const Menu = () => {
    // Fetch only top 5 trending posts
    const { data: trendingPosts, isLoading } = useSWR(
        '/api/posts/trending', 
        fetcher
    );

    return (
        <div className={styles.container}>
            <h2 className={styles.subtitle}>What&apos;s Hot</h2>
            <h1 className={styles.title}>Trending</h1>
            {isLoading ? (
                <div>Loading trending posts...</div>
            ) : (
                <MenuPost withImage={false} posts={trendingPosts || []} />
            )}

            <h2 className={styles.subtitle}>Discover by Topic</h2>
            <h1 className={styles.title}>Categories</h1>
            <MenuCategories/>

            <h2 className={styles.subtitle}>Chosen by Editor</h2>
            <h1 className={styles.title}>Editor&apos;s Choice</h1>
            <MenuPost withImage={true} posts={[]} />
        </div>
    );
};

export default Menu;