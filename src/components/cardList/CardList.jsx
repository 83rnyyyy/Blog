import React from "react";
import styles from "./cardList.module.css"
import Pagination from "../pagination/Pagination";
import Card from "../card/Card";


const getData = async (page, cat) =>{
    const res = await fetch(`http://localhost:3000/api/posts?page=${page}&cat=${cat || ""}`,
        {
        cache: "no-store",
        }
    );

    if(!res.ok){
        const errText = await res.text();
        console.error("Fetch failed:", res.status, errText);
        throw new Error("failed")
    }

    return res.json()
}
const CardList = async({page, cat}) => {
    const pageNum = Number(page) || 1;
    const {posts, count} = await getData(pageNum, cat);
    const POST_PER_PAGE = 2
    const hasPrev = POST_PER_PAGE * (page-1)>0
    const hasNext = POST_PER_PAGE * (page-1) + POST_PER_PAGE < count;
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Feed</h1>
            <div className={styles.post}> 
                {posts?.map(item=>(
                    <Card item ={item} key = {item.id}/>
                ))}
                
                


            </div>



        <Pagination page = {page} hasNext={hasNext} hasPrev={hasPrev}/>
        </div>
    )
}

export default CardList

