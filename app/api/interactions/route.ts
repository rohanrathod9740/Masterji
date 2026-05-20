import { prisma } from "@/lib/db";
import { createInteractionSchema, listInteractionSchema } from "@/schemas/interactionSchema";
import { Prisma } from "@/prisma/migrations/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = {
            userId: searchParams.get("userId"),
            personId: searchParams.get("personId") || undefined,
            type: searchParams.get("type") || undefined,
            skip: searchParams.get("skip") ? parseInt(searchParams.get("skip")!) : undefined,
            take: searchParams.get("take") ? parseInt(searchParams.get("take")!) : undefined,
        };

        const result = listInteractionSchema.safeParse(query);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    errors: result.error.flatten(),
                },
                { status: 400 }
            );
        }

        const { userId, personId, type, skip, take } = result.data;

        const where: Prisma.InteractionWhereInput = { userId };
        if (personId) where.personId = personId;
        if (type) where.type = type;

        const interactions = await prisma.interaction.findMany({
            where,
            skip,
            take,
            orderBy: { interactionDate: "desc" },
        });

        const total = await prisma.interaction.count({ where });

        return NextResponse.json(
            {
                success: true,
                data: interactions,
                pagination: { total, skip, take },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error listing interactions:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function POST(req:NextRequest) {
    try{
    const body = await req.json();
    const result = createInteractionSchema.safeParse(body);
    if(!result.success){
        return NextResponse.json(
            {
                success:false,
                errors: result.error.flatten(),
            },
            {status:400}
        );
    }
    const {userId,personId,type,notes,audioUrl,transcript,interactionDate} = result.data;
    const interaction = await prisma.interaction.create({
        data:{
            userId,
            personId,
            type,
            notes,
            audioUrl,
            transcript,
            interactionDate:interactionDate??new Date(),
        }
    });
    return NextResponse.json(
        {
            success:true,
            message:"Interaction successfully updated to the memory!",
            data:interaction
        },
        {status:201}
    );
    }
    catch(error)
    {
        console.error("Error creating Interaction:",error);
        return NextResponse.json(
            {
                success:false,
                message: "Internal server error",
            },
            {status:500}
        );
    }

}