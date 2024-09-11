'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"

export async function _getInventory(did: string) {
    const inventory = await unstable_cache(
        async () => {
            const data = await prisma.products.findMany({
                select: {
                    id: true,
                    title: true,
                    isPublished: true,
                    isFeatured: true,
                    stock: true,
                    images: {
                        select: {
                            id: true,
                            src: true,
                        },
                    },
                },
                where: { distributors: { some: { id: did } } },
                take: 24
            })
            return data
        },
        [`_getInventory-${did}`],
        {
            tags: [`_getInventory-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return inventory
}

export async function _getInventoryByCompanyId({ did, companyId }: { did: string, companyId: string }) {
    const inventory = await unstable_cache(
        async () => {
            const data = prisma.products.findMany({
                select: {
                    id: true,
                    title: true,
                    regularPrice: true,
                    salePrice: true,
                    stock: true,
                },
                where: { Companies: { id: companyId }, distributors: { some: { id: did } } }
            })
            return data
        },
        [`_getInventory-${did}-${companyId}`],
        {
            tags: [`_getInventory-${did}-${companyId}`],
            revalidate: 60 * 30,
        }
    )()
    return inventory
}

export async function _getInventoryById({ inventoryId, did }: { inventoryId: string, did: string }) {
    const inventory = await unstable_cache(
        async () => {
            const data = await prisma.products.findUnique({
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    regularPrice: true,
                    salePrice: true,
                    purchasePrice: true,
                    purchaseLimit: true,
                    stock: true,
                    isFeatured: true,
                    isPublished: true,
                    isReviewEnable: true,
                    isTrackStock: true,
                },
                where: { id: inventoryId, distributors: { some: { id: did } } },
            })
            return data
        },
        [`_getInventoryById-${did}-${inventoryId}`],
        {
            tags: [`_getInventoryById-${did}-${inventoryId}`],
            revalidate: 60 * 30,
        }
    )()
    return inventory
}