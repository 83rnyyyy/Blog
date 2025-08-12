"use client"
import React from "react";
import styles from "./pagination.module.css"
import { useRouter, useSearchParams } from "next/navigation";

const Pagination = ({page, hasPrev, hasNext}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cat = searchParams.get("cat"); // Get current category
    console.log(page);
    return (
        <div className={styles.container}>
            <button 
                disabled={!hasPrev}
                className={styles.button} 
                onClick={() => {
                    const params = new URLSearchParams();
                    params.set("page", String(Number(page) - 1));
                    if (cat) params.set("cat", cat);
                    router.push(`?${params.toString()}`);
                }}
            >
                Previous
            </button>
            <button 
                className={styles.button} 
                onClick={() => {
                    const params = new URLSearchParams();
                    params.set("page", String(Number(page) + 1));
                    if (cat) params.set("cat", cat);
                    router.push(`?${params.toString()}`);
                }}
                disabled={!hasNext}
            >
                Next
            </button>
        </div>
    )
}

export default Pagination