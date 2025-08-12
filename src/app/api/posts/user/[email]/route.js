import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export const GET = async (req, { params }) => {
    const { email } = await params;
    
    try {
        const userPosts = await prisma.post.findMany({
            where: {
                userEmail: email
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                cat: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return new NextResponse(JSON.stringify(userPosts), { status: 200 });
    } catch (err) {
        console.log(err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!" }), 
            { status: 500 }
        );
    }
};