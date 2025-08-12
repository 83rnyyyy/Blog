
import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

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

    // Validate required fields for publishing
    if (!draft.title || !draft.desc) {
      return new NextResponse(
        JSON.stringify({ message: "Title and content are required to publish" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate slug if not exists
    const finalSlug = draft.slug || slugify(draft.title);

    // Create a post from the draft
    const post = await prisma.post.create({
      data: {
        title: draft.title,
        desc: draft.desc, // Use content field for desc
        slug: finalSlug,
        img: draft.img,
        catSlug: draft.catSlug || "random",
        userEmail: draft.userEmail,
      },
    });

    // Delete the draft after publishing
    await prisma.draft.delete({
      where: { id },
    });

    return NextResponse.json(post);
  } catch (err) {
    console.log("Publish draft error:", err);
    
    // Handle duplicate slug error
    if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
      return new NextResponse(
        JSON.stringify({ message: "A post with this title already exists. Please change the title." }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ 
        message: "Database Error", 
        error: err.message 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};