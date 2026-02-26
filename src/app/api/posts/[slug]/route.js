import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { getAuthSession } from "@/utils/auth";

// GET SINGLE POST
export async function GET(req, { params }) {
  // Await params in Next.js 15+
  const { slug } = await params;

  try {
    const post = await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      include: { user: true },
    });

    return NextResponse.json(post, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts/[slug] error:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE POST
export async function DELETE(req, { params }) {
  try {
    const { slug } = await params; // Await params
    const session = await getAuthSession();

    if (!session) {
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
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    // Delete associated comments first if your schema doesn't have cascade delete
    await prisma.comment.deleteMany({
      where: { postSlug: slug },
    });

    await prisma.post.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/posts/[slug] error:", err);
    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
}

// UPDATE POST (PUT)
export async function PUT(req, { params }) {
  try {
    // CRITICAL FIX: Await params here
    const { slug } = await params; 
    
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { title, desc, img, catSlug } = body;

    // Check ownership
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

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        title,
        desc,
        img,
        catSlug: catSlug || "academics",
      },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (err) {
    console.error("PUT /api/posts/[slug] error:", err);
    return NextResponse.json(
      { message: "Database Error", error: err.message },
      { status: 500 }
    );
  }
}