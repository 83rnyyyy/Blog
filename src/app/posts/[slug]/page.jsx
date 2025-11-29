import styles from "./singlePage.module.css";
import Image from "next/image";
import Menu from "@/components/menu/Menu";
import Comment from "@/components/comments/Comments";

/**
 * Server-side helper to fetch one post by slug.
 * Returns `null` instead of throwing if the fetch fails.
 */
const getData = async (slug) => {
  try {
    // Use a relative URL so this works in dev, preview, and production
    const res = await fetch(`/api/posts/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Fetch failed:", res.status, errText);
      return null; // <-- do NOT throw, just return null
    }

    return res.json();
  } catch (err) {
    console.error("Unexpected error fetching post:", err);
    return null; // <-- also do not throw here
  }
};

const SinglePage = async ({ params }) => {
  const { slug } = params; // no await here
  const data = await getData(slug);

  // If API failed or post not found, show a safe fallback instead of crashing
  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          <div className={styles.textContainer}>
            <h1 className={styles.title}>Post not found</h1>
            <p>
              We couldn’t find this article. It may have been deleted or the URL
              may be incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{data.title}</h1>

          <div className={styles.user}>
            {data?.user?.image && (
              <div className={styles.userImageContainer}>
                <Image
                  src={data.user.image}
                  alt=""
                  fill
                  className={styles.avatar}
                />
              </div>
            )}
            <div className={styles.userTextContainer}>
              <span className={styles.username}>{data?.user?.name}</span>
              <span className={styles.date}>1.01.2025</span>
            </div>
          </div>

          {data?.img && (
            <div className={styles.imageContainer}>
              <Image src={data.img} alt="" fill className={styles.image} />
            </div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.post}>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: data?.desc }}
          />
          <div className={styles.comment}>
            <Comment postSlug={slug} />
          </div>
        </div>

        <Menu />
      </div>
    </div>
  );
};

export default SinglePage;
