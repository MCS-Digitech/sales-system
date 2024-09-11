'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"

export async function _getProductById(id: string) {
    const product_by_id = await unstable_cache(
        async () => {
            const data = await prisma.products.findMany({ where: { id } })
            return data
        },
        ['product_by_id'],
        {
            tags: ['product_by_id', 'client-product_by_id'],
            revalidate: 10,
        }
    )()
    return product_by_id
}

export async function _getProductBySlug(slug: string) {
    const product_by_slug = await unstable_cache(
        async () => {
            const data = await prisma.products.findMany({ where: { slug } })
            return data
        },
        ['product_by_slug'],
        {
            tags: ['product_by_slug', 'client-product_by_slug'],
            revalidate: 10,
        }
    )()
    return product_by_slug
}