'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';
import styles from "./writePage.module.css";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { app } from "@/utils/firebase"
import useSWR from 'swr';

const storage = getStorage(app);
const fetcher = (url) => fetch(url).then(res => res.json());
const ADMIN_MODE = true; 

const ADMIN_EMAILS = [
  "bernieliu2@gmail.com",
  "teenagetheoryblog@gmail.com",
];

const WritePage = () => {
    const { status, data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Check if we're editing or working with a draft
    const editSlug = searchParams.get('edit');
    const draftId = searchParams.get('draft');
    const isEditing = Boolean(editSlug);
    const isDraftMode = Boolean(draftId);
    
    // State
    const [file, setFile] = useState(null)
    const [media, setMedia] = useState("")
    const [title, setTitle] = useState("")
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [catSlug, setCatSlug] = useState("academics");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);
    const [uploading, setUploading] = useState(false); // New: Track upload progress
    const [currentDraftId, setCurrentDraftId] = useState(draftId);

    // Fetch post data for editing
    const { data: postData, isLoading: postLoading } = useSWR(
        isEditing ? `/api/posts/${editSlug}` : null,
        fetcher
    );

    // Fetch draft data when in draft mode
    const { data: draftData, isLoading: draftLoading } = useSWR(
        isDraftMode ? `/api/drafts/${draftId}` : null,
        fetcher
    );
    
    // Populate form logic
    useEffect(() => {
        if (isEditing && postData && session?.user?.email) {
            if (postData.userEmail !== session?.user?.email) {
                router.push('/');
                return;
            }
            setTitle(postData.title || '');
            setValue(postData.desc || '');
            setCatSlug(postData.catSlug || 'academics');
            setMedia(postData.img || '');
            setIsDataReady(true);
        } else if (isDraftMode && draftData && session?.user?.email) {
             if (draftData.userEmail !== session?.user?.email) {
                router.push('/');
                return;
            }
            setTitle(draftData.title || '');
            setValue(draftData.content || '');
            setCatSlug(draftData.catSlug || 'academics');
            setMedia(draftData.img || '');
            setIsDataReady(true);
        } else if (!isEditing && !isDraftMode) {
            setIsDataReady(true);
        }
    }, [postData, draftData, isEditing, isDraftMode, session, router]);

    // Auth Guard
    useEffect(() => {
        if (status === "unauthenticated" || (ADMIN_MODE && status === "authenticated" && !ADMIN_EMAILS.includes(session?.user?.email))) {
            router.push("/");
        }
    }, [status, session, router]);

    // File upload effect
    useEffect(() => {
        const upload = () => {
            setUploading(true);
            const name = new Date().getTime() + "_" + file.name;
            const storageRef = ref(storage, 'images/' + name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    console.error("Upload error:", error);
                    setUploading(false);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setMedia(downloadURL);
                        setUploading(false);
                    });
                }
            );
        };
        file && upload();
    }, [file]);

    const slugify = (str) =>
        str.toLowerCase().trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

    // SAVE DRAFT FUNCTION
    const saveDraft = async () => {
        if (!title.trim()) {
            alert("Please add a title before saving as draft");
            return;
        }
        setIsSavingDraft(true);
        try {
            const res = await fetch("/api/drafts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: currentDraftId,
                    title,
                    desc: value.replace(/<[^>]*>/g, '').slice(0, 200),
                    img: media,
                    catSlug: catSlug || "academics",
                }),
            });
            if (res.ok) {
                const saved = await res.json();
                setCurrentDraftId(saved.id);
                if (!currentDraftId) window.history.replaceState(null, '', `/write?draft=${saved.id}`);
                return saved;
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingDraft(false);
        }
    };

    // SUBMIT / UPDATE FUNCTION
    const handleSubmit = async () => {
        if (!title || !value) {
            alert('Please fill in title and content');
            return;
        }
        setIsSubmitting(true);

        try {
            // Case 1: Publishing a Draft
            if (isDraftMode && currentDraftId) {
                const res = await fetch(`/api/drafts/${currentDraftId}/publish`, { method: 'POST' });
                if (res.ok) {
                    const post = await res.json();
                    router.push(`/posts/${post.slug}`);
                    return;
                }
            }

            // Case 2: Creating new or Updating existing post
            const url = isEditing ? `/api/posts/${editSlug}` : '/api/posts';
            const method = isEditing ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    desc: value,
                    img: media,
                    catSlug: catSlug || "academics",
                    ...( !isEditing && { slug: slugify(title) })
                })
            });

            if (res.ok) {
                const result = await res.json();
                // Clean up draft if it existed
                if (currentDraftId && !isDraftMode) {
                    await fetch(`/api/drafts/${currentDraftId}`, { method: 'DELETE' });
                }
                router.push(`/posts/${result.slug || editSlug}`);
            } else {
                const error = await res.json();
                alert(`Error: ${error.message || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // DELETE LOGIC
    const handleDelete = async () => {
        if (!confirm('Are you sure?')) return;
        const url = isEditing ? `/api/posts/${editSlug}` : `/api/drafts/${currentDraftId}`;
        const res = await fetch(url, { method: 'DELETE' });
        if (res.ok) router.push('/');
    }

    if (status === "loading" || !isDataReady) return <div className={styles.loading}>Loading...</div>

    return (
        <div className={styles.container}>
            {isDraftMode && <div className={styles.draftHeader}><span className={styles.draftBadge}>Draft Mode</span></div>}
            
            <input 
                type="text" 
                placeholder="Title" 
                className={styles.input} 
                value={title}
                onChange={e => setTitle(e.target.value)} 
            />
            
            <select className={styles.select} value={catSlug} onChange={(e) => setCatSlug(e.target.value)}>
                <option value="academics">Academics</option>
                <option value="social">Social</option>
                <option value="mentalHealth">Mental Health</option>
                <option value="findYourFocus">Find Your Focus</option>
            </select>
            
            <div className={styles.editor}>
                <button className={styles.button} type="button" onClick={() => setOpen(!open)}>
                    <Image src="/plus.png" alt="" width={16} height={16} />
                </button>
                {open && (
                    <div className={styles.add}>
                        <input type="file" id="image" onChange={e => setFile(e.target.files[0])} style={{ display: "none" }} />
                        <button className={styles.addButton} type="button">
                            <label htmlFor="image">
                                <Image src="/image.png" alt="" width={16} height={16} />
                            </label>
                        </button>
                    </div>
                )}
                {uploading && <p className={styles.uploadingText}>Image uploading...</p>}
                
                <ReactQuill 
                    key={`editor-${isEditing ? editSlug : (isDraftMode ? draftId : 'new')}`}
                    className={styles.textArea} 
                    theme="bubble" 
                    value={value} 
                    onChange={setValue} 
                    placeholder="Tell your story..." 
                />
            </div>
            
            <div className={styles.buttonContainer}>
                {!isEditing && (
                    <button className={styles.draftButton} onClick={saveDraft} disabled={isSavingDraft || isSubmitting || uploading}>
                        {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                    </button>
                )}
                
                <button className={styles.publish} onClick={handleSubmit} disabled={isSubmitting || isSavingDraft || uploading}>
                    {isSubmitting ? 'Publishing...' : isEditing ? 'Update Post' : 'Publish'}
                </button>
                
                <button className={styles.cancelButton} onClick={() => router.back()}>Cancel</button>
                
                {(isEditing || isDraftMode) && (
                    <button className={styles.deleteButton} onClick={handleDelete}>Delete</button>
                )}
            </div>
        </div>
    )
}

export default WritePage;