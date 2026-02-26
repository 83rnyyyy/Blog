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
    const { status } = useSession();
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const editSlug = searchParams.get('edit');
    const draftId = searchParams.get('draft');
    const isEditing = Boolean(editSlug);
    const isDraftMode = Boolean(draftId);
    
    const [file, setFile] = useState(null);
    const [media, setMedia] = useState("");
    const [title, setTitle] = useState("");
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [catSlug, setCatSlug] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);
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

    // Initialize form on mount only
    useEffect(() => {
        if (!isEditing && !draftId) {
            setTitle('');
            setValue('');
            setCatSlug('');
            setMedia('');
            setIsDataReady(true);
        }
    }, []);

    // Populate form when editing a post
    useEffect(() => {
        if (isEditing && postData && !postLoading && session?.user?.email) {
            if (postData.userEmail !== session.user.email) {
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
            if (draftData.userEmail !== session.user.email) {
                alert('You are not authorized to edit this draft');
                router.push('/');
                return;
            }
            setTitle(draftData.title || '');
            setValue(draftData.desc || '');
            setCatSlug(draftData.catSlug || '');
            setMedia(draftData.img || '');
            setIsDataReady(true);
        }
    }, [draftData, draftLoading, isDraftMode, session?.user?.email, router]);

    // Redirect if unauthenticated or not admin
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            alert("You must be signed in to access this page.");
            router.push("/");
            return;
        }

        if (
            ADMIN_MODE &&
            status === "authenticated" &&
            session?.user?.email &&
            !ADMIN_EMAILS.includes(session.user.email)
        ) {
            alert("You are not authorized to access this page.");
            router.push("/");
        }
    }, [status, session, router]);

    // File upload effect
    useEffect(() => {
        const upload = () => {
            const storageRef = ref(storage, 'images/' + file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    console.log('Upload error:', error.code);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setMedia(downloadURL);
                    });
                }
            );
        };
        if (file) upload();
    }, [file]);

    if (
        status === "loading" ||
        (isEditing && postLoading) ||
        (isDraftMode && draftLoading) ||
        !isDataReady
    ) {
        return <div className={styles.loading}>Loading...</div>;
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

    const saveDraft = async () => {
        if (!title.trim()) {
            alert("Please add a title before saving as draft");
            return;
        }

        setIsSavingDraft(true);

        try {
            const slug = slugify(title);

            const response = await fetch("/api/drafts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: currentDraftId,
                    title,
                    desc: value,
                    img: media,
                    slug: currentDraftId ? undefined : slug,
                    catSlug: catSlug || "academics",
                }),
            });

            if (response.ok) {
                const savedDraft = await response.json();
                alert("Draft saved successfully!");

                if (!currentDraftId) {
                    setCurrentDraftId(savedDraft.id);
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
            // Save/update draft first
            await saveDraft();

            // If we're in draft mode, publish via the draft publish endpoint
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

            // Regular post creation or editing
            const url = isEditing ? `/api/posts/${editSlug}` : '/api/posts';
            const method = isEditing ? 'PUT' : 'POST';

            const body = {
                title,
                desc: value,
                img: media,
                catSlug: catSlug || "academics",
            };

            if (!isEditing) {
                body.slug = slugify(title);
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const result = await res.json();

                // Clean up draft if one was created along the way
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
            alert('Something went wrong!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing) return;

        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/posts/${editSlug}`, { method: 'DELETE' });

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
    };

    const handleDeleteDraft = async () => {
        if (!currentDraftId) return;

        if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/drafts/${currentDraftId}`, { method: 'DELETE' });

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
    };

    return (
        <div className={styles.container}>
            {(isDraftMode || currentDraftId) && (
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

                <button
                    className={styles.publish}
                    onClick={handleSubmit}
                    disabled={isSubmitting || isSavingDraft}
                >
                    {isSubmitting ? 'Publishing...' :
                     isEditing ? 'Update Post' :
                     isDraftMode ? 'Publish Draft' : 'Publish'}
                </button>

                <button
                    className={styles.cancelButton}
                    onClick={() => router.back()}
                    type="button"
                    disabled={isSubmitting || isSavingDraft}
                >
                    Cancel
                </button>

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

                {(isDraftMode || currentDraftId) && !isEditing && (
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
    );
};

export default WritePage;