import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export const POST = async (req, { params }) => {
  const { id } = params;
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const draft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!draft) {
      return new NextResponse("Draft not found", { status: 404 });
    }

    if (draft.userEmail !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a post from the draft
    const post = await prisma.post.create({
      data: {
        title: draft.title,
        desc: draft.desc,
        img: draft.img,
        slug: draft.slug,
        catSlug: draft.catSlug,
        userEmail: draft.userEmail,
      },
    });

    // Delete the draft after publishing
    await prisma.draft.delete({
      where: { id },
    });

    return NextResponse.json(post);
  } catch (err) {
    console.log(err);
    return new NextResponse("Database Error", { status: 500 });
  }
};