'use server'
import "server-only"

import { authOptions } from "@/config/authOptions";
import { prisma } from "@/config/db"
import { getServerSession } from "next-auth";
import { unstable_cache } from "next/cache"

export async function _getCompanies(did: string) {
    const companies = await unstable_cache(
        async () => {
            const data = await prisma.companies.findMany({
                select: { id: true, name: true, _count: { select: { products: true } } },
                where: { distributors: { some: { id: did } } },
            });
            return data
        },
        [`_getCompanies-${did}`],
        {
            tags: [`_getCompanies-${did}`],
            revalidate: 10,
        }
    )()
    return companies
}

export async function _searchCompanies({ query, did }: { query: string, did: string }) {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!query) return []

    try {
        const companies = await prisma.companies.findMany({
            select: { id: true, name: true, _count: { select: { products: true } } },
            where: {
                AND: [
                    { distributors: { some: { id: did } } },
                    { name: { search: query.split(" ").join(" | ") } }
                ]
            }
        });
        return companies
    } catch (error) {
        console.log(error)
        throw Error("Something Went Wrong")
    }

}

export const _getCompaniesWithProductsCount = async ({
    did,
    productId
}: {
    did: string,
    productId: string
}) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        throw new Error("Unauthorized")
    }

    if (!did) {
        throw new Error("Distribution Id is required.")
    }

    if (!productId) {
        throw new Error("Product Id is required.")
    }

    const companies = await unstable_cache(
        async () => {
            const data = await prisma.companies.findMany({
                select: {
                    _count: {
                        select: {
                            products: true,
                        },
                    },
                    id: true,
                    name: true,
                    products: {
                        select: {
                            id: true,
                        },
                        where: {
                            id: productId,
                        },
                    },
                },
                where: { distributors: { some: { id: did } } },
            });
            return data
        },
        ['_getCompaniesWithProductsCount'],
        {
            tags: ['_getCompaniesWithProductsCount'],
            revalidate: 60 * 30,
        }
    )()
    return companies
}

export async function _getCompanyById(companyId: string) {
    const company = await unstable_cache(
        async () => {
            const data = await prisma.companies.findUnique({ where: { id: companyId } });
            return data
        },
        ['_getCompanyById'],
        {
            tags: ['_getCompanyById'],
            revalidate: 10,
        }
    )()
    return company
}