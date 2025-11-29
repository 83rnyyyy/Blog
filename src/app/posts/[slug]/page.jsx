import styles from "./singlePage.module.css"
import Image from 'next/image';
import Menu from "@/components/menu/Menu";
import Comment from "@/components/comments/Comments";


const getData = async (slug) =>{
    const res = await fetch(`https://www.teenagetheory.com/api/posts/${slug}`,
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

const SinglePage = async ({params}) =>{
    const {slug} = await params
    const data = await getData(slug);
    console.log("Description preview:", data?.desc?.substring(0, 200));
    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>{data.title}</h1>
               
                <div className={styles.user}>

                    {data?.user?.image && (<div className={styles.userImageContainer}>
                        <Image src={data.user.image} alt="" fill className={styles.avatar}/>
                        
                    </div>
                    )}
                    <div className={styles.userTextContainer}>
                        <span className={styles.username}>{data?.user?.name}</span>
                        <span className={styles.date}>1.01.2025</span>
                    </div>
                </div>

                {data?.img && (<div className={styles.imageContainer}>
                    <Image src={data.img} alt="" fill className={styles.image}/>
       
                    </div>
                )}           
                 </div>
                
            </div>
            <div className={styles.content}>
                <div className={styles.post}>
                    <div className={styles.description} dangerouslySetInnerHTML={{__html:data?.desc}}>
                        
                       
                    </div>
                    <div className={styles.comment}>
                        <Comment postSlug={slug}/>
                    </div>
                </div>
                
                <Menu/>
                
            </div>
                
        </div>
    )
}

export default SinglePage