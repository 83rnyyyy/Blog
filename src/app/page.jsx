import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/Footer";
import styles from "./homepage.module.css";
import Link from "next/link";
import Featured from "@/components/featured/featured";
import CategoryList from "@/components/categoryList/CategoryList";
import CardList from "@/components/cardList/CardList";
import Menu from "@/components/menu/Menu";
//
export default async function Home({searchParams}) {
  
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page || 1; // ✅ This works
  return(
    <div className={styles.container}>
      <Featured/>
      <CategoryList/>
      <div className={styles.content}>
        <CardList page = {page}/> 
        
        <Menu/>
      </div>
    </div>
  ); 
}
