import styles from "./singlePage.module.css";
import Image from "next/image";
import Menu from "@/components/menu/Menu";
import Comment from "@/components/comments/Comments";
import prisma from "@/utils/connect";

export const dynamic = "force-dynamic";

// Fetch post directly from database
const getData = async (slug) => {
  try {
    console.log("🔍 Looking for post with slug:", slug);
    
    const post = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      include: { user: true },
    });
    
    console.log("✅ Post found:", post);
    return post;
  } catch (err) {
    console.error("❌ Error fetching post:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    return null;
  }
};

const SinglePage = async ({ params }) => {
  const { slug } = await params;
  const data = await getData(slug);

  // If the post doesn't exist, show fallback
  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          <div className={styles.textContainer}>
            <h1 className={styles.title}>Post not found</h1>
            <p className={styles.description}>
              not workings
              
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
        </div>

        {data?.img && (
          <div className={styles.imageContainer}>
            <Image src={data.img} alt="" fill className={styles.image} />
          </div>
        )}
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