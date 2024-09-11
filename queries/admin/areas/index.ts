'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/config/authOptions"

export async function _getAreas(did: string) {
    const areas = await unstable_cache(
        async () => {
            const data = prisma.areas.findMany({ select: { _count: { select: { shops: true } }, id: true, name: true }, where: { distributors: { some: { id: did } } } });
            return data
        },
        [`_getAreas-${did}`],
        {
            tags: [`_getAreas-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return areas
}


export async function _searchAreas({ query, did }: { query: string, did: string }) {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!query) return []

    try {
        const areas = await prisma.areas.findMany({
            select: { _count: { select: { shops: true } }, id: true, name: true },
            where: {
                AND: [
                    { distributors: { some: { id: did } } },
                    { name: { search: query.split(" ").join(" | ") } }
                ]
            }
        });
        return areas
    } catch (error) {
        console.log(error)
        throw Error("Something Went Wrong")
    }

}

export async function _getAreaById(areaId: string) {
    const area = await unstable_cache(
        async () => {
            const data = await prisma.areas.findUnique({ where: { id: areaId } });
            return data
        },
        ['area', areaId],
        {
            tags: ['area', areaId],
            revalidate: 10,
        }
    )()
    return area
}
