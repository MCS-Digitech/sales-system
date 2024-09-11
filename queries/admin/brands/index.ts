'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/config/authOptions"

export async function _getBrands(did: string) {
    const brands = await unstable_cache(
        async () => {
            const data = prisma.brands.findMany({ select: { _count: { select: { products: true } }, id: true, name: true }, where: { distributors: { some: { id: did } } } });
            return data
        },
        [`_getBrands-${did}`],
        {
            tags: [`_getBrands-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return brands
}


export async function _searchBrands({ query, did }: { query: string, did: string }) {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!query) return []

    try {
        const brands = await prisma.brands.findMany({
            select: { _count: { select: { products: true } }, id: true, name: true },
            where: {
                AND: [
                    { distributors: { some: { id: did } } },
                    { name: { search: query.split(" ").join(" | ") } }
                ]
            }
        });
        return brands
    } catch (error) {
        console.log(error)
        throw Error("Something Went Wrong")
    }

}

export async function _getBrandById(brandId: string) {
    const brand = await prisma.brands.findUnique({ where: { id: brandId } });
    return brand
}
