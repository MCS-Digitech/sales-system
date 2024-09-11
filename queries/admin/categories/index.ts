'use server'
import "server-only"

import { authOptions } from "@/config/authOptions";
import { prisma } from "@/config/db"
import { getServerSession } from "next-auth";
import { unstable_cache } from "next/cache"

export async function _getCategoriesOfProduct({ productId }: { productId: string }) {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!productId) throw Error("Product Id is required.")

    const categories = await unstable_cache(
        async () => {
            const data = await prisma.categories.findMany({
                select: {
                    id: true,
                    name: true,
                    isPublished: true,
                    displayOnLandingPage: true,
                    images: {
                        select: { src: true },
                    },
                    subCategories: { select: { name: true }, where: { id: productId } },
                    Products: { select: { id: true }, where: { id: productId } },
                },
            });
            return data
        },
        ['_getCategoriesOfProduct'],
        {
            tags: ['_getCategoriesOfProduct'],
            revalidate: 60 * 30,
        }
    )()
    return categories
}


export async function _getAdminCategories(did: string) {
    const categories = await unstable_cache(
        async () => {
            const data = await prisma.categories.findMany({
                select: { _count: { select: { subCategories: true } }, id: true, name: true, slug: true, order: true, displayOnLandingPage: true, isPublished: true, images: { select: { id: true, src: true } }, },
                where: { distributors: { some: { id: did } } },
                orderBy: { order: "asc" },
            });
            return data
        },
        [`_getAdminCategories-${did}`],
        {
            tags: [`_getAdminCategories-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return categories
}


export async function _searchCategories({ query, did }: { query: string, did: string }) {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!query) return []

    try {
        const categories = await prisma.categories.findMany({
            select: { _count: { select: { subCategories: true } }, id: true, name: true, slug: true, order: true, displayOnLandingPage: true, isPublished: true, images: { select: { id: true, src: true } }, },
            where: {
                AND: [
                    { distributors: { some: { id: did } } },
                    { name: { search: query.split(" ").join(" | ") } }
                ]
            }
        });
        return categories
    } catch (error) {
        console.log(error)
        throw Error("Something Went Wrong")
    }

}