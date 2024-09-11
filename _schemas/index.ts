import z from "zod"

export const initialImageCreateSchema = z.object({
    src: z.string().nonempty("Image Source can not be empty."),
    searchText: z.string().nonempty("Image search text can not be empty."),
    altText: z.string().optional(),
});

export const createCategorySchema = z.object({
    id: z.string(),
    name: z.string().trim().min(1, "Minimum 1 correctors are required.").max(40, "Maximum 40 correctors are allowed."),
    slug: z.string().trim().toLowerCase().transform(value => value.replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim().replace(/\s+/g, "-")),
    order: z.coerce.number().nonnegative("0 Or Positive numbers only allowed. Ex: 1,2,3 ... 4"),
    isPublished: z.coerce.boolean(),
    displayOnLandingPage: z.coerce.boolean()
})

export const createProductSchema = z.object({
    id: z.string({ required_error: "Product ID is Required." }),
    did: z.string({ required_error: "did is Required." }),
    title: z.string().trim().min(1, "Minimum 1 corrector is required.").max(100, "Maximum 100 correctors are allowed."),
    slug: z.string().trim().toLowerCase().transform(value => value.replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim().replace(/\s+/g, "-")),
    description: z.string().trim().max(600, "Maximum 600 correctors are allowed.").optional(),
    regularPrice: z.coerce.number().nonnegative("Negative Numbers not allowed.").default(0),
    salePrice: z.coerce.number().nonnegative("Negative Numbers not allowed.").default(0),
    purchasePrice: z.coerce.number().nonnegative("Negative Numbers not allowed.").default(0),
    purchaseLimit: z.coerce.number().nonnegative("Negative Numbers not allowed.").default(0),
    stock: z.coerce.number().nonnegative("Negative Numbers not allowed.").default(0),
    isTrackStock: z.coerce.boolean().default(false),
    isReviewEnable: z.coerce.boolean().default(false),
    isPublished: z.coerce.boolean().default(false),
    isFeatured: z.coerce.boolean().default(false),
})
    .refine((ctx) => ctx.purchasePrice < ctx.regularPrice && ctx.purchasePrice < ctx.salePrice, { message: "Purchase Price should be lower than Regular Price and Sale Price.", path: ["purchasePrice"] })
    .refine((ctx) => ctx.salePrice < ctx.regularPrice && ctx.salePrice > ctx.purchasePrice, { message: "Sale Price should be lower than Regular Price and higher than Purchase Price.", path: ["salePrice"] })
    .refine((ctx) => ctx.regularPrice > ctx.salePrice && ctx.regularPrice > ctx.purchasePrice, { message: "Regular Price should be higher than Sale Price and higher than Purchase Price.", path: ["salePrice"] })
    .refine((ctx) => ctx.regularPrice > ctx.purchasePrice, { message: "Regular Price should be higher than Purchase Price.", path: ["regularPrice"] })
    .refine((ctx) => ctx.salePrice ? ctx.salePrice < ctx.regularPrice : true, { message: "Sale Price should be lower than Regular Price.", path: ["salePrice"] })
    .refine((ctx) => ctx.salePrice ? ctx.salePrice > ctx.purchasePrice : true, { message: "Sale Price should be higher than the Purchase Price.", path: ["salePrice"] })
    .refine((ctx) => ctx.salePrice ? ctx.regularPrice > ctx.salePrice : true, { message: "Regular Price should be higher than Sale Price.", path: ["regularPrice"] })

export const createImagesSchema = z.object({
    id: z.string(),
    src: z.string().nonempty("Image Source / Id Required."),
    searchText: z.string(),
    altText: z.string()
})

export const createAttributesSchema = z.object({
    productId: z.string(),
    name: z.string().trim().nonempty("Name is required."),
    value: z.string().trim().nonempty("Value is required.")
})

export const createCompanySchema = z.object({
    id: z.string({ required_error: "Id is required." }),
    did: z.string({ required_error: "did is required." }),
    name: z.string({ required_error: "Company Name is Required." }).trim().nonempty("Company Name is required.")
})

export const createAreaSchema = z.object({
    id: z.string({ required_error: "Id is required." }),
    did: z.string({ required_error: "did is required." }),
    name: z.string({ required_error: "Area Name is Required." }).trim().nonempty("Company Name is required.")
})
export const createBrandSchema = z.object({
    id: z.string({ required_error: "Id is required." }),
    did: z.string({ required_error: "did is required." }),
    name: z.string({ required_error: "Area Name is Required." }).trim().nonempty("Company Name is required.")
})


export const createDistributionSchema = z.object({
    name: z.string().trim().nonempty("Distribution Name is Required.")
})

export const createShopSchema = z.object({
    id: z.string({ required_error: "Id is required." }),
    did: z.string({ required_error: "did is required." }),
    name: z.string({ required_error: "Name is required." }).trim().nonempty("Shop Name is required."),
    owner: z.string({ required_error: "Owner is required." }).trim().optional(),
    phone: z.string().optional().refine((value) => value ? /^\d{11}$/.test(value) : true, { message: "Phone Number must be exactly 11 numeric digits." }),
    address: z.string().trim().optional(),
    areaId: z.string().trim().optional(),
    popType: z.enum(["RETAILER", "WHOLESALER"], { required_error: "Pop Type is required." }),
    payType: z.enum(["CASH", "CHEQUE", "BILL"], { required_error: "Payment Method is required." })
})

export const createAddressSchema = z.object({
    id: z.string({ required_error: "Id is required." }),
    label: z.string().nonempty("Label is required."),
    streetAddress1: z.string().nonempty("Street Address 1 is required."),
    streetAddress2: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.coerce.number({ required_error: "Postal Code / ZIP Code is required." }).refine((value) => /^\d{5}$/.test(value.toString()), { message: "Postal code must be exactly 5 numeric digits." }),
    phone: z.string().nonempty("Phone Number is required.").refine((value) => /^\d{11}$/.test(value), { message: "Phone Number must be exactly 11 numeric digits." })
})

export const createUserSchema = z.object({
    id: z.string({ required_error: "Id is required." }),
    did: z.string({ required_error: "did is required." }),
    name: z.string().nonempty("Name is required."),
    email: z.string().nonempty("Email is required."),
    cnic: z.string().optional(),
    role: z.enum(["CUSTOMER", "SALES_MAN", "BOOKER", "KPO", "ADMIN"], { required_error: "User Role is required." }),
    phone: z.string().nonempty("Phone Number is required.").refine((value) => /^\d{11}$/.test(value), { message: "Phone Number must be exactly 11 numeric digits." })
})

export const createBillingSchema = z.object({
    bookerId: z.string().nonempty("Select Booker."),
    saleManeId: z.string().nonempty("Select Sale Man"),
    areaId: z.string().nonempty("Select Area."),
    shopId: z.string().nonempty("Select Shop."),
    companyId: z.string().nonempty("Select Company."),
    did: z.string().nonempty("Select Distributor."),
    deliveryDate: z.date({ required_error: "Select Delivery Date." }),
    extraDiscount: z.coerce.number().nonnegative("Extra Discount is not allowed in negative numbers."),
    items: z.object({
        id: z.string(),
        profit: z.number().nullable(),
        regularPrice: z.number().nullable(),
        salePrice: z.number().nullable(),
        qty: z.coerce.number().nonnegative("Negative numbers are not allowed.").optional()
    }).array().min(1, "Minimum 1 item should be into a sale.")
})

// repracice create bill schema
export const createBillFormSchema = z.object({
    id: z.string().nonempty("Select Booker."),
    bookerId: z.string().nonempty("Select Booker."),
    saleManId: z.string().nonempty("Select Sale Man."),
    areaId: z.string().nonempty("Select Area."),
    companyId: z.string().nonempty("Select Company."),
    shopId: z.string().nonempty("Select Shop."),
    did: z.string().nonempty("Select Booker."),
    deliveryDate: z.date({ required_error: "Select Delivery Date." }),
    extraDiscount: z.coerce.number().nonnegative("Negative amount is not allowed.").nullable(),
    products: z.object({
        id: z.string(),
        title: z.string().nullable(),
        regularPrice: z.coerce.number().nullable(),
        salePrice: z.coerce.number().nullable(),
        stock: z.coerce.number().nullable(),
        qty: z.coerce.number().nonnegative("Negative amount is not allowed.").nullable(),
    }).array().min(1, "Minimum 1 Product should into bill.")
})

export const findBillBySaleManAndAreaId = z.object({
    saleManId: z.string().nonempty("Select Sale Man"),
    areaId: z.string().nonempty("Select Area."),
})

export const updateBillReturn = z.object({
    billId: z.string(),
    extraDiscount: z.coerce.number().nonnegative("Extra Discount is not allowed in negative numbers."),
    items: z.object({
        id: z.string(),
        products: z.object({
            title: z.string(),
            id: z.string(),
            salePrice: z.number().nullable(),
            regularPrice: z.number().nullable(),
            profit: z.number().nullable(),
        }).array(),
        quantity: z.number(),
        qty: z.coerce.number().nonnegative("Negative numbers are not allowed.").optional()
    }).array().min(1, "Minimum 1 Product should be return.")
})



export const connectBillToLedgerSchema = z.object({
    billId: z.coerce.number().nonnegative("Negative numbers are not allowed."),
    did: z.string({ required_error: "did is required." }),
})