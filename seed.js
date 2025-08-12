import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.post.create({
    data: {
      slug: "4",
      title: "4",
      desc: "4",
      catSlug: "sports", // Must exist in your Category table
      userEmail: "bernyyyy92@gmail.com", // Must exist in your User table
    },
  });

  console.log("✅ Post created!");
}

main()
  .catch((e) => {
    console.error("❌ Error creating post:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });