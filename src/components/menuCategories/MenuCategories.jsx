



"use client";
import React from 'react';
import styles from './menuCategories.module.css';
import Link from 'next/link';
import Image from 'next/image'; 
import useSWR from "swr";

const fetcher = (url) => fetch(url).then(res => res.json());

const MenuCategories = () => {
    const { data: categories, isLoading } = useSWR('/api/categories', fetcher);

    if (isLoading) {
        return <div>Loading categories...</div>;
    }

    // Fallback to static categories if API fails
    const staticCategories = [
        { slug: 'academics', title: 'Academics' },
        { slug: 'fashion', title: 'Fashion' },
        { slug: 'food', title: 'Food' },
        { slug: 'sports', title: 'Sports' },
        { slug: 'travel', title: 'Travel' },
        { slug: 'random', title: 'Random' }
    ];

    const categoriesToShow = categories && categories.length > 0 ? categories : staticCategories;

    return(
        <div className={styles.categoryList}>
            {categoriesToShow.map((category) => (
                <Link 
                    href={`/blog?cat=${category.slug}`} 
                    className={`${styles.categoryItem} ${styles[category.slug]}`}
                    key={category.id || category.slug}
                >
                    
                    {category.title}
                </Link>
            ))}
        </div>
    );
};

export default MenuCategories;


