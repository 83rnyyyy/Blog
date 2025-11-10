import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export const GET = async () => {
    try {
        const trendingPosts = await prisma.post.findMany({
            orderBy: {
                views: 'desc' 
            },
            take: 5, 
            include: {
                user: true,
                cat: true
            }
        });

        return new NextResponse(JSON.stringify(trendingPosts), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }), 
            { status: 500 }
        );
    }
};