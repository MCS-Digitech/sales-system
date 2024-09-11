'use server'
import "server-only"

import { prisma } from "@/config/db"
import { unstable_cache } from "next/cache"

export async function _getLedgerBills({ did }: { did: string }) {
    const bills = await unstable_cache(
        async () => {
            try {
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
                });
                return data
            } catch (error) {
                console.log(error)
            }
        },
        [`_getLedgerBills-${did}`],
        {
            tags: [`_getLedgerBills-${did}`],
            revalidate: 60 * 30,
        }
    )()
    return bills
}
