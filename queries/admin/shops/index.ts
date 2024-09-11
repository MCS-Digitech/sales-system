'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/config/authOptions"

export async function _getShops(did: string) {
    const shops = await unstable_cache(
        async () => {
            const data = prisma.shops.findMany({ where: { distributors: { some: { id: did } } } });
            return data
        },
        [`_getShops-${did}`],
        {
            tags: [`_getShops-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return shops
}
export async function _getShopsByAreaId({ areaId, did }: { did: string, areaId: string }) {
    const shops = await unstable_cache(
        async () => {
            const data = prisma.shops.findMany({
                where: {
                    Areas: { id: areaId },
                    distributors: { some: { id: did } }
                }
            });
            return data
        },
        [`_getShops-${did}-${areaId}`],
        {
            tags: [`_getShops-${did}-${areaId}`],
            revalidate: 60 * 30,
        }
    )()
    return shops
}

export async function _searchShops({ query, did }: { query: string, did: string }) {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!query) return []

    try {
        const shops = await prisma.shops.findMany({
            where: {
                AND: [
                    { distributors: { some: { id: did } } },
                    { name: { search: query.split(" ").join(" | ") } }
                ]
            }
        });
        return shops
    } catch (error) {
        console.log(error)
        throw Error("Something Went Wrong")
    }

}

export async function _getShopById(shopId: string) {
    const shop = await unstable_cache(
        async () => {
            const data = prisma.shops.findUnique({ include: { Areas: true }, where: { id: shopId } });
            return data
        },
        ['shop', shopId],
        {
            tags: ['shop', shopId],
            revalidate: 10,
        }
    )()
    return shop
}
