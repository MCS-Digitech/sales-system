'use server'
import "server-only"

import { authOptions } from "@/config/authOptions"
import { prisma } from "@/config/db"
import { endOfDay, startOfDay } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { unstable_cache } from "next/cache"

export async function _getDistribution() {
    const session = await getServerSession(authOptions)
    if (!session) return []
    const distribution = await unstable_cache(
        async () => {
            const data = await prisma.distributors.findMany({ where: { users: { some: { id: session.user.id } } } })
            return data
        },
        ['_getDistribution'],
        {
            tags: ['_getDistribution'],
            revalidate: 10,
        }
    )()
    return distribution
}

export async function _getDistributionById(id: string) {
    const distribution = await unstable_cache(
        async () => {
            const data = await prisma.distributors.findMany({ where: { id } })
            return data
        },
        ['distribution', id],
        {
            tags: ['distribution', id],
            revalidate: 10,
        }
    )()
    return distribution
}

export async function _getDistributionInfo(did: string) {
    const distribution = await unstable_cache(
        async () => {
            const data = await prisma.distributors.findUnique({
                select: {
                    _count: {
                        select: {
                            areas: true,
                            bills: {
                                where: {
                                    createdAt: {
                                        gte: startOfDay(),
                                        lte: endOfDay(),
                                    },
                                },
                            },
                            companies: true,
                            products: true,
                            shops: true,
                            users: true,
                        },
                    },
                },
                where: {
                    id: did,
                },
            })
            return data
        },
        [`_getDistributionInfo-${did}`],
        {
            tags: [`_getDistributionInfo-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return distribution
}