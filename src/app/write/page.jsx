// app/write/page.jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.bubble.css";
import styles from "./writePage.module.css";

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { app } from "@/utils/firebase";
import useSWR from "swr";

const storage = getStorage(app);

// IMPORTANT: avoid cached API responses while editing
const fetcher = (url) => fetch(url, { cache: "no-store" }).then((res) => res.json());

const ADMIN_MODE = true; // toggle this to enable/disable admin-only lock
const ADMIN_EMAILS = ["bernieliu2@gmail.com", "teenagetheoryblog@gmail.com"];

export default function WritePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const editSlug = searchParams.get("edit");
  const draftId = searchParams.get("draft");
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

  // Fetch draft data for editing a draft
  const { data: draftData, isLoading: draftLoading } = useSWR(
    isDraftMode ? `/api/drafts/${draftId}` : null,
    fetcher
  );

  // Redirect if unauthenticated / not admin (if admin mode)
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

  // Populate form for editing a post
  useEffect(() => {
    if (isEditing && postData && !postLoading && session?.user?.email) {
      if (postData.userEmail !== session.user.email) {
        alert("You are not authorized to edit this post");
        router.push("/");
        return;
      }

      setTitle(postData.title || "");
      setValue(postData.desc || "");
      setCatSlug(postData.catSlug || "");
      setMedia(postData.img || "");
      setIsDataReady(true);
    }
  }, [isEditing, postData, postLoading, session?.user?.email, router]);

  // Populate form for editing a draft
  useEffect(() => {
    if (isDraftMode && draftData && !draftLoading && session?.user?.email) {
      if (draftData.userEmail !== session.user.email) {
        alert("You are not authorized to edit this draft");
        router.push("/");
        return;
      }

      setTitle(draftData.title || "");
      setValue(draftData.content || "");
      setCatSlug(draftData.catSlug || "");
      setMedia(draftData.img || "");
      setCurrentDraftId(draftData.id || draftId);
      setIsDataReady(true);
    }
  }, [isDraftMode, draftData, draftLoading, session?.user?.email, router, draftId]);

  // Reset form for new content
  useEffect(() => {
    if (!isEditing && !isDraftMode) {
      setTitle("");
      setValue("");
      setCatSlug("");
      setMedia("");
      setCurrentDraftId(null);
      setIsDataReady(true);
    } else {
      setIsDataReady(false);
    }
  }, [isEditing, isDraftMode]);

  // Upload file to Firebase
  useEffect(() => {
    if (!file) return;

    const upload = () => {
      // unique name to avoid overwriting
      const name = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `images/${name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.log("Upload error:", error);
          alert("Image upload failed.");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setMedia(downloadURL);
        }
      );
    };

    upload();
  }, [file]);

  if (
    status === "loading" ||
    (isEditing && postLoading) ||
    (isDraftMode && draftLoading) ||
    !isDataReady
  ) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (status !== "authenticated") return null;

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const generateSlug = (t) =>
    t
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

  const saveDraft = async ({ silent = false } = {}) => {
    if (!title.trim()) {
      if (!silent) alert("Please add a title before saving as draft");
      return null;
    }

    setIsSavingDraft(true);

    try {
      const slug = generateSlug(title);
      const desc = value.replace(/<[^>]*>/g, "").slice(0, 200);

      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentDraftId || undefined, // update if exists
          title,
          desc,
          content: value, // ✅ include full content
          img: media,
          slug: currentDraftId ? undefined : slug,
          catSlug: catSlug || "academics",
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (!silent) alert(`Failed to save draft: ${error.message || "Unknown error"}`);
        return null;
      }

      const savedDraft = await response.json();

      if (!silent) alert("Draft saved successfully!");

      if (!currentDraftId) {
        setCurrentDraftId(savedDraft.id);
        router.replace(`/write?draft=${savedDraft.id}`); // ✅ use router, not history
      }

      return savedDraft;
    } catch (error) {
      console.error("Save draft error:", error);
      if (!silent) alert("Failed to save draft. Please try again.");
      return null;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !value.trim()) {
      alert("Please fill in title and content");
      return;
    }

    setIsSubmitting(true);

    try {
      // Draft publish flow
      if (isDraftMode) {
        const saved = await saveDraft({ silent: true });
        const idToPublish = saved?.id || currentDraftId;

        if (!idToPublish) {
          alert("No draft ID found to publish.");
          return;
        }

        const response = await fetch(`/api/drafts/${idToPublish}/publish`, {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          alert(`Failed to publish draft: ${error.message || "Unknown error"}`);
          return;
        }

        const post = await response.json();
        router.push(`/posts/${post.slug}`);
        router.refresh();
        return;
      }

      // Normal post create/edit
      const url = isEditing ? `/api/posts/${editSlug}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const body = {
        title,
        desc: value,
        img: media,
        catSlug: catSlug || "academics",
      };

      if (!isEditing) body.slug = slugify(title);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert(`Error: ${error.message || "Something went wrong"}`);
        return;
      }

      const result = await res.json();

      router.push(`/posts/${result.slug || editSlug}`);
      router.refresh(); // ✅ prevents stale post page after update
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/posts/${editSlug}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert(`Error: ${error.message || "Failed to delete post"}`);
        return;
      }

      alert("Post deleted successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting!");
    }
  };

  const handleDeleteDraft = async () => {
    if (!currentDraftId) return;

    if (!confirm("Are you sure you want to delete this draft? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/drafts/${currentDraftId}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        alert(`Error: ${error.message || "Failed to delete draft"}`);
        return;
      }

      alert("Draft deleted successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Delete draft error:", error);
      alert("Something went wrong while deleting!");
    }
  };

  return (
    <div className={styles.container}>
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
        onChange={(e) => setTitle(e.target.value)}
      />

      <select className={styles.select} value={catSlug} onChange={(e) => setCatSlug(e.target.value)}>
        <option value="academics">Academics</option>
        <option value="social">Social</option>
        <option value="mentalHealth">Mental Health</option>
        <option value="findYourFocus">Find Your Focus</option>
      </select>

      <div className={styles.editor}>
        <button className={styles.button} type="button" onClick={() => setOpen((o) => !o)}>
          <Image src="/plus.png" alt="" width={16} height={16} />
        </button>

        {open && (
          <div className={styles.add}>
            <input
              type="file"
              id="image"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: "none" }}
              accept="image/*"
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
            key={`editor-${isEditing ? editSlug : isDraftMode ? draftId : "new"}`}
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
            onClick={() => saveDraft()}
            disabled={isSavingDraft || isSubmitting}
            type="button"
          >
            {isSavingDraft ? "Saving Draft..." : "Save as Draft"}
          </button>
        )}

        <button className={styles.publish} onClick={handleSubmit} disabled={isSubmitting || isSavingDraft}>
          {isSubmitting ? "Publishing..." : isEditing ? "Update Post" : isDraftMode ? "Publish Draft" : "Publish"}
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
  );
}