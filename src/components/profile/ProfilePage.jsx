"use client";
import React, { useState } from 'react';
import styles from './profile.module.css';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation"
const fetcher = (url) => fetch(url).then(res => res.json());

const ProfilePage = ({ userEmail }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('posts');
    const [deletingPost, setDeletingPost] = useState(null);
    const isOwnProfile = session?.user?.email === userEmail;
    // Fetch user data and their posts
    const { data: userData, isLoading: userLoading } = useSWR(
        userEmail ? `/api/user/${userEmail}` : null, 
        fetcher
    );
    
    const { data: userPosts, isLoading: postsLoading, mutate: mutatePosts } = useSWR(
        userEmail ? `/api/posts/user/${userEmail}` : null, 
        fetcher
    );

    // Fetch user drafts (only for own profile)
    const { data: userDrafts, isLoading: draftsLoading, mutate: mutateDrafts } = useSWR(
        isOwnProfile && userEmail ? `/api/drafts/user/${userEmail}` : null, 
        fetcher
    );

    const handleDeletePost = async (slug, title) => {
        const confirmDelete = confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`);
        
        if (!confirmDelete) return;

        setDeletingPost(slug);
        
        try {
            const response = await fetch(`/api/posts/${slug}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                mutatePosts(
                    (currentPosts) => currentPosts?.filter(post => post.slug !== slug),
                    false
                );
                alert('Post deleted successfully!');
            } else {
                const error = await response.json();
                alert(`Failed to delete post: ${error.message}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setDeletingPost(null);
        }
    };

    const handleDeleteDraft = async (draftId) => {
        
        
        

        try {
            const response = await fetch(`/api/drafts/${draftId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                mutateDrafts(
                    (currentDrafts) => currentDrafts?.filter(draft => draft.id !== draftId),
                    false
                );
                
            } else {
                const error = await response.json();
                alert(`Failed to delete draft: ${error.message}`);
            }
        } catch (error) {
            console.error('Delete draft error:', error);
            alert('Failed to delete draft. Please try again.');
        }
    };

    const handlePublishDraft = async (draftId) => {
        try {
            const response = await fetch(`/api/drafts/${draftId}/publish`, {
                method: 'POST',
            });

            if (response.ok) {
                // Refresh both drafts and posts
                mutateDrafts();
                mutatePosts();
                
                setActiveTab('posts'); // Switch to posts tab to see the published post
                router.push(`/user/${userEmail}`);
            } else {
                const error = await response.json();
                alert(`Failed to publish draft: ${error.message}`);
            }
        } catch (error) {
            console.error('Publish draft error:', error);
            alert('Failed to publish draft. Please try again.');
        }
    };

    if (userLoading) {
        return <div className={styles.loading}>Loading profile...</div>;
    }

    if (!userData) {
        return <div className={styles.error}>User not found</div>;
    }

    

    return (
        <div className={styles.container}>
            {/* Profile Header */}
            <div className={styles.profileHeader}>
                <div className={styles.profileInfo}>
                    {userData.image && (
                        <Image
                            src={userData.image}
                            alt={userData.name}
                            width={120}
                            height={120}
                            className={styles.profileImage}
                        />
                    )}
                    <div className={styles.userDetails}>
                        <h1 className={styles.userName}>{userData.name}</h1>
                        <p className={styles.userEmail}>{userData.email}</p>
                        {userData.bio && (
                            <p className={styles.userBio}>{userData.bio}</p>
                        )}
                        <div className={styles.stats}>
                            <span className={styles.stat}>
                                <strong>{userPosts?.length || 0}</strong> Posts
                            </span>
                            <span className={styles.stat}>
                                <strong>{userData.totalViews || 0}</strong> Total Views
                            </span>
                            <span className={styles.stat}>
                                Joined {new Date(userData.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        {isOwnProfile && (
                            <Link href="/write" className={styles.writeButton}>
                                Write New Post
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'posts' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts ({userPosts?.length || 0})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'drafts' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('drafts')}
                    style={{ display: isOwnProfile ? 'block' : 'none' }}
                >
                    Drafts ({userDrafts?.length || 0})
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.content}>
                {activeTab === 'posts' && (
                    <div className={styles.postsGrid}>
                        {postsLoading ? (
                            <div className={styles.loading}>Loading posts...</div>
                        ) : userPosts && userPosts.length > 0 ? (
                            userPosts.map((post) => (
                                <div key={post.id} className={styles.postCard}>
                                    {post.img && (
                                        <div className={styles.postImageContainer}>
                                            <Image
                                                src={post.img}
                                                alt={post.title}
                                                fill
                                                className={styles.postImage}
                                            />
                                        </div>
                                    )}
                                    <div className={styles.postContent}>
                                        <div className={styles.postCategory}>
                                            <span className={`${styles.category} ${styles[post.catSlug]}`}>
                                                {post.cat?.title || post.catSlug}
                                            </span>
                                        </div>
                                        <h3 className={styles.postTitle}>
                                            <Link href={`/posts/${post.slug}`}>
                                                {post.title}
                                            </Link>
                                        </h3>
                                        <p className={styles.postDesc}>
                                            {post.desc?.length > 150 
                                                ? post.desc.substring(0, 150) + "..." 
                                                : post.desc
                                            }
                                        </p>
                                        <div className={styles.postMeta}>
                                            <span className={styles.postDate}>
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className={styles.postViews}>
                                                {post.views || 0} views
                                            </span>
                                            {isOwnProfile && (
                                                <div className={styles.postActions}>
                                                    <Link href={`/write?edit=${post.slug}`} className={styles.editButton}>
                                                        Edit
                                                    </Link>
                                                    <button 
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDeletePost(post.slug, post.title)}
                                                        disabled={deletingPost === post.slug}
                                                    >
                                                        {deletingPost === post.slug ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noPosts}>
                                <p>No posts yet.</p>
                                {isOwnProfile && (
                                    <Link href="/write" className={styles.writeButton}>
                                        Write your first post
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'drafts' && (
                    <div className={styles.postsGrid}>
                        {draftsLoading ? (
                            <div className={styles.loading}>Loading drafts...</div>
                        ) : userDrafts && userDrafts.length > 0 ? (
                            userDrafts.map((draft) => (
                                <div key={draft.id} className={`${styles.postCard} ${styles.draftCard}`}>
                                    {draft.img && (
                                        <div className={styles.postImageContainer}>
                                            <Image
                                                src={draft.img}
                                                alt={draft.title}
                                                fill
                                                className={styles.postImage}
                                            />
                                        </div>
                                    )}
                                    <div className={styles.postContent}>
                                        <div className={styles.draftBadge}>
                                            Draft
                                        </div>
                                        <h3 className={styles.postTitle}>
                                            {draft.title || 'Untitled Draft'}
                                        </h3>
                                        <p className={styles.postDesc}>
                                            {draft.desc?.length > 150 
                                                ? draft.desc.substring(0, 150) + "..." 
                                                : draft.desc || 'No description yet.'
                                            }
                                        </p>
                                        <div className={styles.postMeta}>
                                            <span className={styles.postDate}>
                                                Last saved: {new Date(draft.updatedAt).toLocaleDateString()}
                                            </span>
                                            <div className={styles.draftActions}>
                                                <Link 
                                                    href={`/write?draft=${draft.id}`} 
                                                    className={styles.editButton}
                                                >
                                                    Continue Writing
                                                </Link>
                                                <button 
                                                    className={styles.publishButton}
                                                    onClick={() => handlePublishDraft(draft.id)}
                                                >
                                                    Publish
                                                </button>
                                                <button 
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteDraft(draft.id, draft.title)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noPosts}>
                                <p>No drafts yet.</p>
                                <Link href="/write" className={styles.writeButton}>
                                    Start writing
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;