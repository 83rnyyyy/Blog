import { NextResponse } from "next/server";
import prisma from "@/utils/connect"
import { getAuthSession } from "@/utils/auth";

export async function GET(req, { params }) {
  const { slug } = params;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        user: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (err) {
    console.error("GET /api/posts/[slug] error:", err);
    return NextResponse.json(
      { message: "Database Error", error: err.message },
      { status: 500 }
    );
  }
}


export const DELETE = async (req, { params }) => {
    try {
        const { slug } =  await params;
        const session = await getAuthSession();
        
        if (!session) {
            return new NextResponse(
                JSON.stringify({ message: "Not authenticated" }), 
                { status: 401 }
            );
        }

        // First check if the post exists and belongs to the user
        const post = await prisma.post.findUnique({
            where: { slug },
            select: {
                id: true,
                userEmail: true,
                title: true
            }
        });

        if (!post) {
            return new NextResponse(
                JSON.stringify({ message: "Post not found" }), 
                { status: 404 }
            );
        }

        if (post.userEmail !== session.user.email) {
            return new NextResponse(
                JSON.stringify({ message: "Not authorized to delete this post" }), 
                { status: 403 }
            );
        }

        // Delete all comments first (due to foreign key constraints)
        await prisma.comment.deleteMany({
            where: { postSlug: slug }
        });

        // Then delete the post
        await prisma.post.delete({
            where: { slug }
        });

        return new NextResponse(
            JSON.stringify({ message: "Post deleted successfully" }), 
            { status: 200 }
        );

    } catch (err) {
        console.log("Delete error:", err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }), 
            { status: 500 }
        );
    }
};


export const PUT = async (req, { params }) => {
    try {
        const { slug } = await params;
        const session = await getAuthSession();
        
        if (!session) {
            return new NextResponse("Not authenticated", { status: 401 });
        }

        const body = await req.json();
        const { title, desc, img, catSlug } = body;

        // Check if post exists and user owns it
        const existingPost = await prisma.post.findUnique({
            where: { slug },
            select: { userEmail: true }
        });

        if (!existingPost) {
            return new NextResponse("Post not found", { status: 404 });
        }

        if (existingPost.userEmail !== session.user.email) {
            return new NextResponse("Not authorized", { status: 403 });
        }

        // Update the post
        const updatedPost = await prisma.post.update({
            where: { slug },
            data: {
                title,
                desc,
                img,
                catSlug,
            },
        });

        return new NextResponse(JSON.stringify(updatedPost), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse("Database Error", { status: 500 });
    }
};