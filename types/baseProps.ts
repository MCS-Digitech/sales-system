interface Params {
    params: {
        did: string
        areaId: string
        brandId: string
        categoryId: string
        companyId: string
        imageId: string
        ledgerId: string
        orderId: string
        shopId: string
        transactionId: string
        inventoryId: string
        userId: string
    }
}

export interface PageProps extends Params {
    searchParams: { [key: string]: string }
}

export interface LayoutProps extends PageProps { }