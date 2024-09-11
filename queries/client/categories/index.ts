'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"

export async function _getCategories() {
    const categories = await unstable_cache(
        async () => {
            const data = await prisma.categories.findMany()
            return data
        },
        ['categories'],
        {
            tags: ['categories', 'client-categories'],
            revalidate: 10,
        }
    )()
    return categories
}

export async function _getCategoriesProducts() {
    const categoriesProducts = await unstable_cache(
        async () => {
            const data = await prisma.categories.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    Products: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            regularPrice: true,
                            salePrice: true,
                            discountInPercentage: true,
                            images: { select: { src: true }, take: 1 },
                        },
                    },
                    images: { select: { src: true } },
                },
                where: {
                    Products: { some: { isFeatured: true, isPublished: true } },
                    isPublished: true,
                    displayOnLandingPage: true,
                },
                take: 8,
                orderBy: { order: "asc" },
            })
            return data
        },
        ['_getCategoriesWithThereProducts'],
        {
            tags: ['_getCategoriesWithThereProducts'],
            revalidate: 60 * 30,
        }
    )()
    return categoriesProducts
}

export async function _getCategoryDesktop() {
    const categoryDesktop = await unstable_cache(
        async () => {
            const data = await prisma.categories.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: { select: { src: true } },
                    subCategories: { select: { name: true, id: true, slug: true, images: { select: { src: true } } } }
                },
                where: {
                    subCategories: { some: { id: {} } },
                    Products: { some: { isFeatured: true, isPublished: true } },
                    isPublished: true,
                    displayOnLandingPage: true,
                },
                take: 8,
                orderBy: { order: "asc" },
            })
            return data
        },
        ['_getCategoryDesktop'],
        {
            tags: ['_getCategoryDesktop'],
            revalidate: 60 * 30,
        }
    )()
    return categoryDesktop
}

export async function _getCategoryById(id: string) {
    const category_by_id = await unstable_cache(
        async () => {
            const data = await prisma.categories.findMany({ where: { id } })
            return data
        },
        ['category_by_id'],
        {
            tags: ['category_by_id', 'client-category_by_id'],
            revalidate: 10,
        }
    )()
    return category_by_id
}

export async function _getCategoryBySlug(slug: string) {
    const category_by_slug = await unstable_cache(
        async () => {
            const data = await prisma.categories.findMany({ where: { slug } })
            return data
        },
        ['category_by_slug'],
        {
            tags: ['category_by_slug', 'client-category_by_slug'],
            revalidate: 10,
        }
    )()
    return category_by_slug
}