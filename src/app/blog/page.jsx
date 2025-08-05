import styles from "./blogPage.module.css"
import CardList from "@/components/cardList/CardList";
import Menu from "@/components/menu/Menu";



const blogPage = () =>{
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Academics Blog</h1>
            <div className={styles.content}>
                <CardList/>
                <Menu/>
                
            </div>
        </div>
    )
}

export default blogPage;
