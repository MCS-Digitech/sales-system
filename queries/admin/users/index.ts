'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/config/authOptions"

export async function _getUsers(did: string) {
    const users = await unstable_cache(
        async () => {
            const data = await prisma.user.findMany({ where: { distributors: { some: { id: did } } }, orderBy: { createdAt: "desc" } });
            return data
        },
        [`_getUsers-${did}`],
        {
            tags: [`_getUsers-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return users
}


export async function _searchUsers({ query, did }: { query: string, did: string }) {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!query) return []

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { distributors: { some: { id: did } } },
                    { name: { search: query.split(" ").join(" | ") } }
                ]
            }, orderBy: { createdAt: "desc" }
        });
        return users
    } catch (error) {
        console.log(error)
        throw Error("Something Went Wrong")
    }

}

export async function _getUserById(userId: string) {
    const area = await unstable_cache(
        async () => {
            const data = await prisma.user.findUnique({ where: { id: userId } });
            return data
        },
        ['area', userId],
        {
            tags: ['area', userId],
            revalidate: 10,
        }
    )()
    return area
}
