import styles from "./singlePage.module.css";
import Image from "next/image";
import Menu from "@/components/menu/Menu";
import Comment from "@/components/comments/Comments";
import prisma from "@/utils/connect";

export const dynamic = "force-dynamic";

// Fetch one post by slug directly from the database
const getData = async (slug) => {
  try {
    const post = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } }, // same as your API: increment views
      include: { user: true },
    });

    return post; // this is your `data`
  } catch (err) {
    console.error("Error loading post in SinglePage:", err);
    return null;
  }
};

const SinglePage = async ({ params }) => {
  const { slug } = params;
  const data = await getData(slug);

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
