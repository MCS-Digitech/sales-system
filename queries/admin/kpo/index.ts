'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"

export async function _getSalesMen(did: string) {
    const salesMen = await unstable_cache(
        async () => {
            const data = await prisma.user.findMany({
                select: { id: true, role: true, name: true },
                where: {
                    role: { in: ["SALES_MAN"] },
                    distributors: { some: { id: did } },
                },
            });
            return data
        },
        ['salesMen', did],
        {
            tags: ['salesMen', did],
            revalidate: 10,
        }
    )()
    return salesMen
}

export async function _getBillByBillId(billId: string) {
    const bill = await unstable_cache(
        async () => {
            const data = await prisma.billing.findUnique({
                select: {
                    _count: {
                        select: {
                            items: true,
                        },
                    },
                    id: true,
                    isReturned: true,
                    area: { select: { name: true } },
                    booker: { select: { name: true } },
                    company: { select: { name: true } },
                    saleMane: { select: { name: true } },
                    shop: { select: { name: true } },
                    items: {
                        select: {
                            id: true,
                            products: {
                                select: {
                                    id: true,
                                    title: true,
                                    salePrice: true,
                                    regularPrice: true,
                                    profit: true,
                                },
                            },
                            issueQuantity: true,
                        },
                    },
                },
                where: { id: billId },
            });
            return data
        },
        [`bill-${billId}`],
        {
            tags: [`bill-${billId}`],
            revalidate: 10,
        }
    )()
    return bill
}