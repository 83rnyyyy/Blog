import { NextResponse } from "next/server";
import prisma from "@/utils/connect"
import { getAuthSession } from "@/utils/auth"; 

export const GET = async (req) => {
  
    
    try {
        
        const {searchParams} = new URL(req.url)
        const limitParam = searchParams.get("limit");
        const pageParam = searchParams.get("page")
        const page = pageParam ? parseInt(pageParam, 10) : 1
        const cat = searchParams.get("cat")
        
        
        console.log("Parameters:", { pageParam, page, cat });
        
        const POST_PER_PAGE = limitParam ? parseInt(limitParam, 10) : 2;
        const validPage = Math.max(1, page)
        
        const query = {
            take: POST_PER_PAGE,
            skip: POST_PER_PAGE * (validPage - 1),
            where: {
                ...(cat && {catSlug: cat}),
            },
        };
        
        console.log("Query object:", JSON.stringify(query, null, 2));
        
        
        await prisma.$connect();
       
        
        
        const [posts, count] = await prisma.$transaction([
            prisma.post.findMany(query),
            prisma.post.count({where: query.where}),
        ]);
        
        console.log("Query results:", { postsCount: posts.length, totalCount: count });
        
        return new NextResponse(JSON.stringify({posts, count}), {status: 200});
    } catch(err) {
        console.error("=== DETAILED ERROR ===");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error code:", err.code);
        console.error("Error stack:", err.stack);
        
        // Prisma specific error handling
        if (err.code === 'P2002') {
            console.error("Unique constraint violation");
        } else if (err.code === 'P1001') {
            console.error("Database connection failed");
        }
        
        return new NextResponse(
            JSON.stringify({ 
                message: "Something went wrong", 
                error: err.message,
                code: err.code 
            }), 
            {status: 500}
        );
    }
}

export const POST = async (req) => {    
    const session = await getAuthSession()
    if (!session) {
        return new NextResponse(
            JSON.stringify({message: "Not authenticated"}), 
            {status: 401}
        );
    }
    
    try {
        const body = await req.json()
        let slug = body.slug;
        
        // Check for duplicate slugs and make unique
        let counter = 1;
        let originalSlug = slug;
        
        // Keep checking until we find a unique slug
        while (await prisma.post.findUnique({where: {slug}})) {
            slug = `${originalSlug}-${counter}`;
            counter++;
        }
        
        const post = await prisma.post.create({
            data: { 
                ...body, 
                slug: slug,  // Use the unique slug
                userEmail: session.user.email
            }       
        });
        
        return new NextResponse(JSON.stringify(post), {status: 200});
    } catch(err) {
        console.log(err)
        return new NextResponse(
            JSON.stringify({ message: "Something went wrong"}), 
            {status: 500}
        );
    }
}