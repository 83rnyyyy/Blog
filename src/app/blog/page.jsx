import styles from "./blogPage.module.css"
import CardList from "@/components/cardList/CardList";
import Menu from "@/components/menu/Menu";



const blogPage = async ({searchParams}) => {
    const { page: pageParam, cat } = await searchParams;
    const page = parseInt(pageParam) || 1;
    
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{cat} blog</h1>
            <div className={styles.content}>
                <CardList page={page} cat={cat}/>
                <Menu/>
            </div>
        </div>
    )
}

export default blogPage;
