// /api/drafts/route.js - Create/Update drafts
import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse("Not Authenticated!", { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, desc, img, catSlug, slug, id } = body;

    console.log("Received draft data:", { title, desc, img, catSlug, slug, id });

    if (id) {
      // Update existing draft
      console.log("Updating existing draft:", id);
      
      const updateData = {
        updatedAt: new Date(),
      };

      // Only update fields that are provided
      if (title !== undefined) updateData.title = title;
      if (desc !== undefined) updateData.desc = desc;
      
      if (img !== undefined) updateData.img = img;
      if (catSlug !== undefined) updateData.catSlug = catSlug || null;

      const updatedDraft = await prisma.draft.update({
        where: { 
          id,
          userEmail: session.user.email // Ensure user can only update their own drafts
        },
        data: updateData,
      });
      
      console.log("Draft updated successfully:", updatedDraft.id);
      return NextResponse.json(updatedDraft);
    } else {
      // Create new draft
      console.log("Creating new draft");
      
      const createData = {
        userEmail: session.user.email,
      };

      // Only add fields that are provided
      if (title) createData.title = title;
      if (desc) createData.desc = desc;
      
      if (img) createData.img = img;
      if (catSlug) createData.catSlug = catSlug;
      if (slug) createData.slug = slug;

      const draft = await prisma.draft.create({
        data: createData,
      });
      
      console.log("Draft created successfully:", draft.id);
      return NextResponse.json(draft);
    }
  } catch (err) {
    console.error("Draft API Error:", err);
    return new NextResponse(
      JSON.stringify({ 
        message: "Database Error", 
        error: err.message,
        details: err 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};