import React from "react";
import styles from "./menu.module.css"
import Link from "next/link";
import Image from "next/image";
import MenuPost from "../menuPost/MenuPost";
import MenuCategories from "../menuCategories/MenuCategories";
const Menu = () => {
    return (
        <div className={styles.container}>
            <h2 className={styles.subtitle}>what's hot</h2>
            <h1 className={styles.title}>Trending</h1>
            <MenuPost withImage={false} />
            <h2 className={styles.subtitle}>Discover by Topic</h2>
            <h1 className={styles.title}>Categories</h1>
            <MenuCategories/>
            <h2 className={styles.subtitle}>Chosen by Editor</h2>
            <h1 className={styles.title}>Editor's Choice</h1>
            <MenuPost withImage={true} />

        </div>
    )
}

export default Menu;

