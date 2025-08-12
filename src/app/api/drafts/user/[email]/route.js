import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  const { email } = params;
  const session = await getAuthSession();
  
  // Only allow users to see their own drafts
  if (!session || session.user.email !== email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const drafts = await prisma.draft.findMany({
      where: {
        userEmail: email,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        cat: true,
      },
    });

    return NextResponse.json(drafts);
  } catch (err) {
    console.log(err);
    return new NextResponse("Database Error", { status: 500 });
  }
};