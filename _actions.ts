'use server'
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "./config/db";
import { createAddressSchema, createAreaSchema, createAttributesSchema, createBrandSchema, createCategorySchema, createCompanySchema, createDistributionSchema, createImagesSchema, createProductSchema, createShopSchema, createUserSchema } from "./_schemas";
import { redirect } from "next/navigation";
import { calculatePercentage, calculateProfit } from "./lib/utils";
import { z } from "zod";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "./config/authOptions";

export async function createCategoryAction(form: any) {
    const res = createCategorySchema.parse(form)
    const { id, ...values } = res
    try {
        await prisma.categories.update({
            data: { ...values },
            where: { id }
        })
        revalidatePath(`/admin/categories/${id}`)
        console.log("Category Updated Successfully 👍")
    } catch (e) {
        console.log("Something went wrong when Creating Or Updating with this error 👎")
        console.log(e)
    }
}

export async function deleteCategoryByIdAction(id: string) {
    await prisma.categories.delete({ where: { id } })
    revalidatePath("/admin/categories")
}

export async function deleteProductAction(id: string) {
    await prisma.products.delete({ where: { id } })
    revalidatePath("/admin/inventory")
}

export async function createProductAction(values: z.infer<typeof createProductSchema>) {
    const { id, regularPrice, salePrice, purchasePrice, did, ...otherValues } = createProductSchema.parse(values)
    try {
        await prisma.products.upsert({
            create: {
                ...otherValues,
                regularPrice,
                salePrice,
                purchasePrice,
                distributors: { connect: { id: did } },
                discountInPercentage: calculatePercentage(regularPrice, salePrice),
                profit: calculateProfit({ purchasePrice, regularPrice, salePrice })
            },
            update: {
                ...otherValues,
                regularPrice,
                salePrice,
                purchasePrice,
                distributors: { connect: { id: did } },
                discountInPercentage: calculatePercentage(regularPrice, salePrice),
                profit: calculateProfit({ purchasePrice, regularPrice, salePrice })
            },
            where: { id }
        })
        revalidateTag(`_getInventory`)
        console.log("Updated Successfully 👍")
    } catch (e) {
        console.log("Something went wrong when Updating Product with this error 👎")
        console.log(e)
    }
}

export async function createImageAction(form: any) {
    const { id, searchText, ...values } = createImagesSchema.parse(form)
    try {
        await prisma.images.upsert({
            create: {
                ...values,
                searchText: {
                    set: searchText.split(" ")
                }
            },
            update: {
                ...values,
                searchText: {
                    set: searchText.split(" ")
                }
            },
            where: { id }
        })
        revalidatePath("/images", "page")
    } catch (e) {
        console.log("Something went wrong when Updating with this error 👎")
        console.log(e)
    }
}

export async function connectImageToProductAction({ imageId, productId }: { imageId: string, productId: string }) {
    try {
        await prisma.images.update({
            data: {
                Products: {
                    connect: {
                        id: productId
                    }
                }
            },
            where: {
                id: imageId
            }
        })
        revalidatePath(`admin/inventory/${productId}`)
        console.log("Successfully connected image with product 👍")
    } catch (e) {
        console.log("Something went wrong when connecting image to production 👎")
        console.log(e)
    }
}

export async function connectSubCategories({ categoriesIds, categoryId }: { categoriesIds: string[], categoryId: string }) {
    try {
        await prisma.categories.update({
            data: {
                subCategories: {
                    set: categoriesIds?.map(c => ({ id: c }))
                }
            },
            where: {
                id: categoryId
            }
        })
        revalidatePath(`/admin/categories/${categoryId}/categories`)
        revalidatePath(`/admin/categories`)
        console.log("Successfully updated sub Categories 👍")
    } catch (e) {
        console.log("Something went wrong when connecting image to production 👎")
        console.log(e)
    }
}

export async function connectShopsWithArea({ shopIds, areaId }: { shopIds: string[], areaId: string }) {
    try {
        await prisma.areas.update({
            data: {
                shops: {
                    set: shopIds?.map(c => ({ id: c }))
                }
            },
            where: {
                id: areaId
            }
        })
        revalidatePath(`/admin/areas/${areaId}/shops`)
        revalidatePath(`/admin/areas`)
        console.log("Successfully updated Shop 👍")
    } catch (e) {
        console.log("Something went wrong when connecting Shops wih single area. 👎")
        console.log(e)
    }
}

export async function initializeNewInventory() {
    const { id } = await prisma.products.create({ data: {}, select: { id: true } })
    return id
}

export async function initializeNewCategory() {
    const { id } = await prisma.categories.create({ data: {}, select: { id: true } })
    revalidatePath("/admin/categories")
    return id
}

export async function initImage() {
    const { id } = await prisma.images.create({ data: {}, select: { id: true } })
    return id
}


export async function createCompany(form: typeof createCompanySchema) {
    const { id, did, ...values } = createCompanySchema.parse(form)
    try {
        await prisma.companies.upsert({
            create: { ...values, distributors: { connect: { id: did } } },
            update: { ...values, distributors: { connect: { id: did } } },
            where: { id }
        })
        revalidatePath(`/d/${did}/companies`)
        console.log("Company Successful Created Or Updated 👍")
    } catch (e) {
        console.log("Something went wrong when creating new or updating company 👎")
        console.log(e)
    }
}

export async function createArea(form: typeof createAreaSchema) {
    const { id, did, ...values } = createAreaSchema.parse(form)
    try {
        await prisma.areas.upsert({
            create: { ...values, distributors: { connect: { id: did } } },
            update: { ...values, distributors: { connect: { id: did } } },
            where: { id }
        })
        revalidatePath(`/d/${did}/areas`)
        console.log("Area Successful Created Or Updated 👍")
    } catch (e) {
        console.log("Something went wrong when creating new or updating Area 👎")
        console.log(e)
    }
}

export async function initBrand() {
    const { id } = await prisma.brands.create({ data: {}, select: { id: true } })
    return id
}


export async function createBrand(form: typeof createBrandSchema) {
    const { id, ...values } = createBrandSchema.parse(form)
    try {
        await prisma.brands.update({
            data: { ...values },
            where: { id }
        })
        revalidatePath(`/admin/brands/${id}`)
        console.log("Brand Successful Created Or Updated 👍")
    } catch (e) {
        console.log("Something went wrong when creating new or updating Brand 👎")
        console.log(e)
    }
}

export async function initShop() {
    const { id } = await prisma.shops.create({ data: {}, select: { id: true } })
    return id
}

export async function InitAddress(session: Session | null) {
    if (!session) return
    const { id } = await prisma.userAddresses.create({ data: { User: { connect: { id: session?.user?.id } } }, select: { id: true } })
    return id
}

export async function createShop(form: typeof createShopSchema) {
    const { id, areaId, did, ...values } = createShopSchema.parse(form)
    try {
        await prisma.shops.upsert({
            create: {
                ...values,
                Areas: { connect: { id: areaId } },
                distributors: { connect: { id: did } }
            },
            update: {
                ...values,
                Areas: { connect: { id: areaId } },
                distributors: { connect: { id: did } }
            },
            where: { id }
        })
        revalidatePath(`/d/${did}/shops`)
        console.log("Shop Successful Created Or Updated 👍")
    } catch (e) {
        console.log("Something went wrong when creating new or updating Shop 👎")
        console.log(e)
    }
}

export async function createUserAddress(form: typeof createAddressSchema) {
    const { id, ...values } = createAddressSchema.parse(form)
    try {
        await prisma.userAddresses.update({
            data: { ...values },
            where: { id }
        })
        revalidatePath(`/me/address/${id}`)
        console.log("Address Successful Created Or Updated 👍")
    } catch (e) {
        console.log("Something went wrong when creating new or updating Address 👎")
        console.log(e)
    }
}


export async function initAttribute({ productId }: { productId: string }) {
    await prisma.attributes.create({
        data: {
            product: {
                connect: {
                    id: productId
                }
            }
        }
    })
}

export async function deleteAttribute({ productId, attributeId }: { productId: string, attributeId: string }) {
    try {
        await prisma.attributes.delete({
            where: {
                product: {
                    id: productId
                },
                id: attributeId
            }
        })
        revalidatePath(`/admin/inventory/${productId}/attributes`)
        console.log("Attribute is successfully deleted 👍")
    } catch (error) {
        console.log("Something Went Wrong when deleting attribute 👎")
        console.log(error)
    }
}


interface AddToFavoriteProps {
    productId: string | undefined,
    userId: string | undefined
}
export async function addToFavorite({ productId, userId }: AddToFavoriteProps) {
    if (!productId && !userId) {
        return;
    }

    try {
        const favorite = await prisma.favorites.findUnique({
            where: {
                userId: userId,
            },
        });

        if (favorite) {
            const { productId: db_productIds } = favorite;
            const updatedProductIds = db_productIds.includes(`${productId}`)
                ? db_productIds.filter((id) => id !== productId)
                : [...db_productIds, productId];

            await prisma.favorites.update({
                where: {
                    userId: userId,
                },
                data: {
                    productId: updatedProductIds as [],
                },
            });
            console.log("Successfully updated & added to favorites 👍")
        } else {
            await prisma.favorites.create({
                data: {
                    productId: [productId as string],
                    User: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
            console.log("Successfully added to favorites 👍")
        }
        revalidatePath("/favorite")
    } catch (e) {
        console.log(e)
        console.log("Something went wrong when adding to favorites 👎")
    }
}

type CartItem = {
    id: string | undefined;
    title: string | undefined | null;
    regularPrice: number | null | undefined;
    salePrice: number | null | undefined;
    purchaseLimit: number | null | undefined
    image: string | null | undefined
    qty?: number;
    discount?: number;
    subtotal?: number;
};

type PlaceOrderTypes = {
    session: Session | null
    cartItems: CartItem[]
    addressId: string
    totalDiscount: number
    cartTotal: number
}

export async function placeOrder({ addressId, cartItems, cartTotal, session, totalDiscount }: PlaceOrderTypes) {
    try {
        const { id } = await prisma.orders.create({
            data: {
                orderItems: {
                    create: cartItems.map(i => ({
                        discount: i.discount as number,
                        quantity: i.qty as number,
                        subtotal: i.subtotal as number,
                        Products: { connect: { id: i.id } }
                    }))
                },
                address: { connect: { id: addressId } },
                User: { connect: { id: session?.user.id } },
                discount: totalDiscount,
                total: cartTotal,
                status: { connect: { id: process.env.PENDING_STATUS_ID! } }
            },
            select: { id: true }
        })
        console.log("Order Successfully Placed.👍")
        return id
    } catch (error) {
        console.log("Something Went Wrong when placing an Order... 👎. Please Try Again")
        console.log(error)
    }
}

export async function statusAction({ orderId, statusId }: { orderId: string, statusId: string }) {
    try {
        await prisma.orderStatuses.update({
            data: {
                orders: {
                    connect: {
                        id: orderId
                    }
                }
            },
            where: { id: statusId, }
        })
        console.log("Status Has been changed")
    } catch (error) {
        console.log("Something Went Wrong when changing order status")
        console.log(error)
    }
}


export async function updateUser(form: typeof createUserSchema) {
    const { id, did, ...values } = createUserSchema.parse(form)
    try {
        await prisma.user.upsert({
            create: {
                ...values,
                distributors: { connect: { id: did } }
            },
            update: {
                ...values,
                distributors: { connect: { id: did } }
            },
            where: { id }
        })
        revalidateTag("_getUsers")
        console.log("User Profile has been updated successfully. 👍")
    } catch (error) {
        console.log("Something Went Wrong when updating user's info 👎")
        console.log(error)
    }
}

export async function updateShopArea(values: any) {
    try {
        await prisma.shops.update({
            data: {
                Areas: { connect: { id: values.id } }
            },
            where: {
                id: values.shopId
            }
        })
        revalidatePath(`/admin/shops/${values.shopId}/area`)
        console.log("Shop Area updated successfully. 👍")
    } catch (error) {
        console.log("Something Went Wrong when updating Shop Area. 👎")
        console.log(error)
    }
}