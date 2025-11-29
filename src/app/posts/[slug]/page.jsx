import styles from "./singlePage.module.css";
import Image from "next/image";
import Menu from "@/components/menu/Menu";
import Comment from "@/components/comments/Comments";

const getData = async (slug) => {
  // Use relative URL so it works on localhost, preview, and prod
  const res = await fetch(`/api/posts/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Fetch failed:", res.status, errText);
    // Return null instead of throwing, so we can show a friendly message
    return null;
  }

  return res.json();
};

const SinglePage = async ({ params }) => {
  const { slug } = params;
  const data = await getData(slug);

  // If fetch failed or post doesn’t exist, show a simple fallback instead of crashing
  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          <div className={styles.textContainer}>
            <h1 className={styles.title}>Post not found</h1>
            <p>We couldn’t find this article. It may have been deleted or the URL is wrong.</p>
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
              <Image
                src={data.img}
                alt=""
                fill
                className={styles.image}
              />
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
