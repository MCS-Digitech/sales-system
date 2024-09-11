'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"

export const _getImages = async () => {
    const images = await unstable_cache(
        async () => {
            const data = await prisma.images.findMany({ take: 24 });
            return data
        },
        ['_getImages'],
        {
            tags: ['_getImages'],
            revalidate: 60 * 30,
        }
    )()
    return images
}

export async function _getImageById(ImageId: string) {
    const image = await unstable_cache(
        async () => {
            const data = await prisma.images.findUnique({ where: { id: ImageId } });
            return data
        },
        ['image'],
        {
            tags: ['image'],
            revalidate: 10,
        }
    )()
    return image
}
