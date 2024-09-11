'use server'
import "server-only"

import { authOptions } from "@/config/authOptions";
import { prisma } from "@/config/db"
import { getServerSession } from "next-auth";
import { unstable_cache } from "next/cache"

export const _getAttributesOfProduct = async ({
    productId
}: {
    productId: string
}) => {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!productId) throw Error("Product Id is required.")

    const attributes = await unstable_cache(
        async () => {
            const data = await prisma.attributes.findMany({
                where: { product: { id: productId } },
                orderBy: { name: "desc" },
            });
            return data
        },
        ['_getAttributesOfProduct'],
        {
            tags: ['_getAttributesOfProduct'],
            revalidate: 60 * 30,
        }
    )()
    return attributes
}
