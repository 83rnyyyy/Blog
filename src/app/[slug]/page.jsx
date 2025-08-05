import styles from "./singlePage.module.css"
import Image from 'next/image';
import Link from 'next/link';
import CardList from "@/components/cardList/CardList";
import Menu from "@/components/menu/Menu";
import Comment from "@/components/comments/Comments";

const SinglePage = () =>{
    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>asdawdawd awdadasdawdawd adadaw</h1>
               
                <div className={styles.user}>
                    <div className={styles.userImageContainer}>
                        <Image src="/p1.jpeg" alt="" fill className={styles.avatar}/>
                    </div>
                    <div className={styles.userTextContainer}>
                        <span className={styles.username}> Bernie Liu</span>
                        <span className={styles.date}>1.01.2025</span>
                    </div>
                </div>
                <div className={styles.imageContainer}>
                    <Image src="/p1.jpeg" alt="" fill className={styles.image}/>
                </div>
                 </div>
                
            </div>
            <div className={styles.content}>
                <div className={styles.post}>
                    <div className={styles.description}>
                        
                        <p>uijbhhoihopi nhoipuh uhihuihiuhuihiuhuihiuhiuhiuhuihiu
                            
                            uilgiugouigiogho;jkj
                            jopjpjpo
                            jp;j;oihoihiougiul
                        </p>
                        <h2>aspdijapwdjapwd</h2>
                        <p>uijbhhoihopi nhoipuh uh
                            
                            uilgiugouigiogho;jkj
                            jopjpjpo
                            jp;j;oihoihiougiul
                        </p>


                        <p>uijbhhoihopi nhoipuh uh
                            
                            uilgiugouigiogho;jkj
                            jopjpjpo
                            jp;j;oihoihiougiul
                        </p>


                        <p>uijbhhoihopi nhoipuh uh
                            
                            uilgiugouigiogho;jkj
                            jopjpjpo
                            jp;j;oihoihiougiul
                        </p>

                    </div>
                    <div className={styles.comment}>
                        <Comment/>
                    </div>
                </div>
                
                <Menu/>
                
            </div>
                
        </div>
    )
}

export default SinglePage