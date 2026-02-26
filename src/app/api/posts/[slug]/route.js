// app/api/posts/[slug]/route.js
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { getAuthSession } from "@/utils/auth";
import { revalidatePath } from "next/cache";

/**
 * GET /api/posts/[slug]
 * Returns post data. If you want to increment views:
 * GET /api/posts/[slug]?incrementViews=1
 */
export async function GET(req, { params }) {
  const { slug } = params;
  const { searchParams } = new URL(req.url);
  const incrementViews = searchParams.get("incrementViews") === "1";

  try {
    const post = incrementViews
      ? await prisma.post.update({
          where: { slug },
          data: { views: { increment: 1 } },
          include: { user: true },
        })
      : await prisma.post.findUnique({
          where: { slug },
          include: { user: true },
        });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (err) {
    console.log("GET /api/posts/[slug] error:", err);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { slug } = params;
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      select: { userEmail: true },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (post.userEmail !== session.user.email) {
      return NextResponse.json({ message: "Not authorized to delete this post" }, { status: 403 });
    }

    await prisma.comment.deleteMany({ where: { postSlug: slug } });
    await prisma.post.delete({ where: { slug } });

    // ✅ clear cached pages
    revalidatePath(`/posts/${slug}`);
    revalidatePath(`/`);

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (err) {
    console.log("DELETE /api/posts/[slug] error:", err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { slug } = params;
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { title, desc, img, catSlug } = body;

    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { userEmail: true },
    });

    if (!existingPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (existingPost.userEmail !== session.user.email) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(desc !== undefined ? { desc } : {}),
        ...(img !== undefined ? { img } : {}),
        ...(catSlug !== undefined ? { catSlug } : {}),
      },
    });

    // ✅ critical: ensures updated post page isn't served from cache
    revalidatePath(`/posts/${slug}`);
    revalidatePath(`/`);

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (err) {
    console.log("PUT /api/posts/[slug] error:", err);
    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}