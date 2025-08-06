'use client';
import { useState } from "react";
import Image from "next/image";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';
import styles from "./writePage.module.css";

import { useSession } from "next-auth/react"
import {useRouter} from "next/navigation"
import { useEffect} from "react";


const WritePage = () => {
    
    const {status} = useSession();
    const router = useRouter();
    const [open,setOpen] = useState(false);
    const [value,setValue] = useState("");
    useEffect(() => {
        if (status === "authenticated") {
        router.push("/")
        }
    }, [status, router])

    if (status === "loading") {
        return <div className={styles.loading}>Loading...</div>
    }
    return (
        <div className={styles.container}>
            <input type="text" placeholder="Title" className={styles.input}/>
            <div className={styles.editor}>
                <button className={styles.button}>
                    <Image src="/plus.png"  alt="" width={16} height={16} onClick ={()=>setOpen(!open)}/>
                </button>
                {open && (
                    <div className={styles.add}>
                        <button className={styles.addButton}>
                            <Image src="/image.png" alt="" width={16} height={16}/>
                        </button>
                        <button className={styles.addButton}>
                            <Image src="/external.png" alt="" width={16} height={16}/>
                        </button>
                        <button className={styles.addButton}>
                            <Image src="/video.png" alt="" width={16} height={16}/>
                        </button>
                    </div>
                )}
                <ReactQuill className={styles.textArea} theme="bubble" value={value} onChange={setValue} placeholder="Tell your story..."/>
            </div>
            <button className={styles.publish}>Publish</button>
        </div>
    )
}

export default WritePage
