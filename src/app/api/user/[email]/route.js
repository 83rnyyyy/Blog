// app/api/user/[email]/route.js
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export const GET = async (req, { params }) => {
    try {
        console.log("API Route hit, params:", params);
        const { email } = await params;
        console.log("Email from params:", email);
        
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                Post: {  // ← Capital P to match your schema
                    select: {
                        views: true
                    }
                }
            }
        });

        console.log("User found:", user);

        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found" }), 
                { status: 404 }
            );
        }

        // Calculate total views - use Post (capital P) to match schema
        const totalViews = user.Post.reduce((sum, post) => sum + (post.views || 0), 0);
        console.log("Total views calculated:", totalViews);
        
        // Remove Post field from response and add totalViews
        const { Post, ...userWithoutPosts } = user;
        const userResponse = {
            ...userWithoutPosts,
            totalViews
        };

        console.log("Sending response:", userResponse);
        return new NextResponse(JSON.stringify(userResponse), { status: 200 });
    } catch (err) {
        console.log("API Error:", err);
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong!", error: err.message }), 
            { status: 500 }
        );
    }
};