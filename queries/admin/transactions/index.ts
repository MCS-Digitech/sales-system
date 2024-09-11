'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/config/authOptions"

export async function _getTransactions(did: string) {
    const transactions = await unstable_cache(
        async () => {
            const data = await prisma.billing.findMany({
                select: {
                    _count: {
                        select: {
                            items: true
                        }
                    },
                    id: true,
                    accessId: true,
                    area: { select: { name: true } },
                    booker: { select: { name: true } },
                    saleMane: { select: { name: true } },
                    company: { select: { name: true } },
                    isReturned: true,
                    distributor: { select: { name: true } },
                    shop: { select: { name: true } },
                },
                where: {
                    distributor: { id: did }
                }
            })
            return data
        },
        [`_getTransactions-${did}`],
        {
            tags: [`_getTransactions-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return transactions
}


export async function _searchTransactions({ query, did }: { query: string, did: string }) {
    const session = await getServerSession(authOptions)

    if (!session) throw Error("Unauthorized")
    if (!query) return []

    try {
        const transaction = await prisma.billing.findMany({
            select: {
                _count: {
                    select: {
                        items: true
                    }
                },
                id: true,
                accessId: true,
                area: { select: { name: true } },
                booker: { select: { name: true } },
                saleMane: { select: { name: true } },
                company: { select: { name: true } },
                isReturned: true,
                distributor: { select: { name: true } },
                shop: { select: { name: true } },
            },
            where: {
                AND: [
                    { distributor: { id: did } },
                    { accessId: parseInt(query) }
                ]
            }
        });
        return transaction
    } catch (error) {
        console.log(error)
        throw Error("Something Went Wrong")
    }

}

export async function _getTransactionById({ transactionId }: { transactionId: string }) {
    const transaction = await unstable_cache(
        async () => {
            const data = await prisma.billing.findUnique({
                select: {
                    _count: {
                        select: {
                            items: true
                        }
                    },
                    id: true,
                    accessId: true,
                    area: { select: { name: true } },
                    booker: { select: { name: true } },
                    saleMane: { select: { name: true } },
                    company: { select: { name: true } },
                    isReturned: true,
                    distributor: { select: { name: true } },
                    shop: { select: { name: true } },
                    items: {
                        select: {
                            issueQuantity: true, returnQuantity: true, products: {
                                select: { regularPrice: true, salePrice: true, title: true, id: true }
                            }
                        }
                    }
                },
                where: { id: transactionId }
            });
            return data
        },
        [`transaction-${transactionId}`],
        {
            tags: [`transaction-${transactionId}`],
            revalidate: 10,
        }
    )()
    return transaction
}
