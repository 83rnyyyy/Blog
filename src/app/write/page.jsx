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

const WritePage = () => {
    const { status } = useSession();
    const { data: session } = useSession();
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
    const [catSlug, setCatSlug] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);
    const [currentDraftId, setCurrentDraftId] = useState(draftId);
    
    // Fetch post data for editing
    const { data: postData, isLoading: postLoading, error } = useSWR(
        isEditing ? `/api/posts/${editSlug}` : null,
        fetcher
    );

    // Fetch draft data when in draft mode
    const { data: draftData, isLoading: draftLoading } = useSWR(
        isDraftMode ? `/api/drafts/${draftId}` : null,
        fetcher
    );
    
    // Populate form when editing a post
    useEffect(() => {
        if (isEditing && postData && !postLoading && session?.user?.email) {
            // Check if user owns the post
            if (postData.userEmail !== session?.user?.email) {
                alert('You are not authorized to edit this post');
                router.push('/');
                return;
            }
            
            setTitle(postData.title || '');
            setValue(postData.desc || '');
            setCatSlug(postData.catSlug || '');
            setMedia(postData.img || '');
            setIsDataReady(true);
        }
    }, [postData, postLoading, isEditing, session?.user?.email, router]);

    // Populate form when editing a draft
    useEffect(() => {
        if (isDraftMode && draftData && !draftLoading && session?.user?.email) {
            // Check if user owns the draft
            if (draftData.userEmail !== session?.user?.email) {
                alert('You are not authorized to edit this draft');
                router.push('/');
                return;
            }
            
            setTitle(draftData.title || '');
            setValue(draftData.content || '');
            setCatSlug(draftData.catSlug || '');
            setMedia(draftData.img || '');
            setIsDataReady(true);
        }
    }, [draftData, draftLoading, isDraftMode, session?.user?.email, router]);

    // Reset form when creating new content
    useEffect(() => {
        if (!isEditing && !isDraftMode) {
            setTitle('');
            setValue('');
            setCatSlug('');
            setMedia('');
            setIsDataReady(true);
        } else if (isEditing || isDraftMode) {
            setIsDataReady(false);
        }
    }, [isEditing, isDraftMode]);

    // Redirect if unauthenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/")
        }
    }, [status, router])

    // File upload effect
    useEffect(() => {
        const upload = () => {
            const name = new Date().getTime() + file.name
            const storageRef = ref(storage, 'images/' + file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                },
                (error) => {
                    switch (error.code) {
                        case 'storage/unauthorized':
                            console.log('Storage unauthorized');
                            break;
                        case 'storage/canceled':
                            console.log('Storage canceled');
                            break;
                        case 'storage/unknown':
                            console.log('Unknown storage error');
                            break;
                    }
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setMedia(downloadURL)
                    });
                }
            );
        };
        file && upload()
    }, [file])

    if (status === "loading" || (isEditing && postLoading) || (isDraftMode && draftLoading) || !isDataReady) {
        return <div className={styles.loading}>Loading...</div>
    }

    if (status !== "authenticated") {
        return null;
    }

    const slugify = (str) =>
        str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    };

    const saveDraft = async () => {
        if (!title.trim()) {
            alert("Please add a title before saving as draft");
            return;
        }

        setIsSavingDraft(true);

        try {
            const slug = generateSlug(title);
            const desc = value.replace(/<[^>]*>/g, '').slice(0, 200);

            const response = await fetch("/api/drafts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: currentDraftId, // Include ID if updating existing draft
                    title,
                    desc,
                    img: media,
                    slug: currentDraftId ? undefined : slug, // Don't update slug for existing drafts
                    catSlug: catSlug || "random",
                }),
            });

            if (response.ok) {
                const savedDraft = await response.json();
                alert("Draft saved successfully!");
                
                // Update URL to include draft ID for future saves
                if (!currentDraftId) {
                    setCurrentDraftId(savedDraft.id);
                    // Update the URL without causing a page reload
                    const newUrl = `/write?draft=${savedDraft.id}`;
                    window.history.replaceState(null, '', newUrl);
                }
            } else {
                const error = await response.json();
                alert(`Failed to save draft: ${error.message}`);
            }
        } catch (error) {
            console.error("Save draft error:", error);
            alert("Failed to save draft. Please try again.");
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleSubmit = async () => {
        if (!title || !value) {
            alert('Please fill in title and content');
            return;
        }

        setIsSubmitting(true);

        try {
            // If we're in draft mode, publish the draft
            if (isDraftMode && currentDraftId) {
                const response = await fetch(`/api/drafts/${currentDraftId}/publish`, {
                    method: 'POST',
                });

                if (response.ok) {
                    const post = await response.json();
                    router.push(`/posts/${post.slug}`);
                    return;
                } else {
                    const error = await response.json();
                    alert(`Failed to publish draft: ${error.message}`);
                    return;
                }
            }

            // Regular post creation/editing
            const url = isEditing ? `/api/posts/${editSlug}` : '/api/posts';
            const method = isEditing ? 'PUT' : 'POST';
            
            const body = {
                title,
                desc: value,
                img: media,
                catSlug: catSlug || "random",
            };

            // Only add slug for new posts
            if (!isEditing) {
                body.slug = slugify(title);
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const result = await res.json();
                
                // If this was created from a draft, clean up the draft
                if (currentDraftId && !isDraftMode) {
                    await fetch(`/api/drafts/${currentDraftId}`, {
                        method: 'DELETE',
                    });
                }
                
                router.push(`/posts/${result.slug || editSlug}`);
            } else {
                const error = await res.json();
                alert(`Error: ${error.message || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Something went wrong!');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = async () => {
        if (!isEditing) return;
        
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/posts/${editSlug}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Post deleted successfully');
                router.push('/');
            } else {
                const error = await res.json();
                alert(`Error: ${error.message || 'Failed to delete post'}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Something went wrong while deleting!');
        }
    }

    const handleDeleteDraft = async () => {
        if (!currentDraftId) return;
        
        if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/drafts/${currentDraftId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Draft deleted successfully');
                router.push('/');
            } else {
                const error = await res.json();
                alert(`Error: ${error.message || 'Failed to delete draft'}`);
            }
        } catch (error) {
            console.error('Delete draft error:', error);
            alert('Something went wrong while deleting!');
        }
    }

    return (
        <div className={styles.container}>
            {/* Header indicating mode */}
            {isDraftMode && (
                <div className={styles.draftHeader}>
                    <span className={styles.draftBadge}>Draft Mode</span>
                    
                </div>
            )}
            
            <input 
                type="text" 
                placeholder="Title" 
                className={styles.input} 
                value={title}
                onChange={e => setTitle(e.target.value)} 
            />
            
            <select 
                className={styles.select} 
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
            >
                <option value="academics">academics</option>
                <option value="fashion">fashion</option>
                <option value="food">food</option>
                <option value="sports">sports</option>
                <option value="travel">travel</option>
                <option value="random">random</option>
            </select>
            
            <div className={styles.editor}>
                <button className={styles.button} type="button">
                    <Image 
                        src="/plus.png" 
                        alt="" 
                        width={16} 
                        height={16} 
                        onClick={() => setOpen(!open)} 
                    />
                </button>
                {open && (
                    <div className={styles.add}>
                        <input 
                            type="file" 
                            id="image" 
                            onChange={e => setFile(e.target.files[0])} 
                            style={{ display: "none" }} 
                        />
                        
                        <button className={styles.addButton} type="button">
                            <label htmlFor="image">
                                <Image src="/image.png" alt="" width={16} height={16} />
                            </label>
                        </button>
                        <button className={styles.addButton} type="button">
                            <Image src="/external.png" alt="" width={16} height={16} />
                        </button>
                        <button className={styles.addButton} type="button">
                            <Image src="/video.png" alt="" width={16} height={16} />
                        </button>
                    </div>
                )}
                {isDataReady && (
                    <ReactQuill 
                        key={`editor-${isEditing ? editSlug : isDraftMode ? draftId : 'new'}`}
                        className={styles.textArea} 
                        theme="bubble" 
                        value={value} 
                        onChange={setValue} 
                        placeholder="Tell your story..." 
                    />
                )}
            </div>
            
            <div className={styles.buttonContainer}>
                {/* Draft Save Button - only show when not editing existing post */}
                {!isEditing && (
                    <button 
                        className={styles.draftButton} 
                        onClick={saveDraft}
                        disabled={isSavingDraft || isSubmitting}
                        type="button"
                    >
                        {isSavingDraft ? 'Saving Draft...' : 'Save as Draft'}
                    </button>
                )}
                
                {/* Main Action Button */}
                <button 
                    className={styles.publish} 
                    onClick={handleSubmit}
                    disabled={isSubmitting || isSavingDraft}
                >
                    {isSubmitting ? 'Publishing...' : 
                     isEditing ? 'Update Post' : 
                     isDraftMode ? 'Publish Draft' : 'Publish'}
                </button>
                
                {/* Cancel Button */}
                <button 
                    className={styles.cancelButton} 
                    onClick={() => router.back()}
                    type="button"
                    disabled={isSubmitting || isSavingDraft}
                >
                    Cancel
                </button>
                
                {/* Delete Buttons */}
                {isEditing && (
                    <button 
                        className={styles.deleteButton} 
                        onClick={handleDelete}
                        type="button"
                        disabled={isSubmitting || isSavingDraft}
                    >
                        Delete Post
                    </button>
                )}
                
                {isDraftMode && (
                    <button 
                        className={styles.deleteButton} 
                        onClick={handleDeleteDraft}
                        type="button"
                        disabled={isSubmitting || isSavingDraft}
                    >
                        Delete Draft
                    </button>
                )}
            </div>
        </div>
    )
}

export default WritePage