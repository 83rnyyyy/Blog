import styles from "./singlePage.module.css";
import Image from "next/image";
import Menu from "@/components/menu/Menu";
import Comment from "@/components/comments/Comments";

// Fetch one post by slug from your production API
const getData = async (slug) => {
  const url = `/api/posts/${slug}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Fetch failed:", res.status, errText);
      // TEMP: throw so you see the real error in dev / logs
      throw new Error(`Failed to fetch post ${slug}: ${res.status} ${errText}`);
    }

    return res.json();
  } catch (err) {
    console.error("Unexpected error fetching post:", err);
    // You can choose to return null in production if you don't want to crash the page
    // but while debugging, it's better to throw so you see the error.
    throw err;
  }
};

const SinglePage = async ({ params }) => {
  const { slug } = params;
  const data = await getData(slug);

  // If the API truly failed or slug doesn't exist, show a very simple fallback.
  // If the API returns real data (which you said it does), this will NOT run.
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

  // Normal post UI
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
