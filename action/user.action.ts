'use server'

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const userModels = async () => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { status: 401, message: "Unauthorized" };
        }
        const res = await prisma.models.findMany({
            where: {
                userId: session.user.id,
                type:'bot'
            },
            orderBy:{
                created_at:'desc'
            }
        });

        if (res)
            return {
                status: 200,
                res
            };
        return {
            status: 400,
            message: 'No models found',
        };

    } catch (error) {
        return {
            status: 500,
            message: 'failed to load models',
            
        };
    }
}

export const getUserProfile = async () => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { status: 401, message: "Unauthorized" };

        const [plan, agentStats] = await Promise.all([
            prisma.plan.findUnique({ where: { userId: session.user.id } }),
            prisma.models.aggregate({
                where: { userId: session.user.id, type: 'bot' },
                _count: { id: true },
                _sum: { times: true },
            }),
        ]);

        const sourceBreakdown = await prisma.models.groupBy({
            by: ['source'],
            where: { userId: session.user.id, type: 'bot' },
            _count: { id: true },
        });

        return {
            status: 200,
            plan,
            agentCount: agentStats._count.id,
            totalConversations: agentStats._sum.times ?? 0,
            sourceBreakdown,
            memberSince: session.user.id,
        };
    } catch {
        return { status: 500, message: 'Failed to load profile' };
    }
}

export const deleteModelAction = async (modelId: string) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { status: 401, message: "Unauthorized" };
        }
         
        const existing = await prisma.models.findUnique({
            where: { id: modelId }
        });
        
        if (!existing || existing.userId !== session.user.id) {
            return { status: 404, message: "Model not found or unauthorized" };
        }

        await prisma.models.delete({
            where: {
                id: modelId,
            }
        });

        return {
            status: 200,
            message: 'Model deleted successfully',
        };

    } catch (error) {
        return {
            status: 500,
            message: 'Failed to delete model',
        };
    }
}