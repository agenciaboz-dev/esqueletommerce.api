import { Prisma } from "@prisma/client"

export const user = Prisma.validator<Prisma.UserInclude>()({
    address: true,
})


export const category = Prisma.validator<Prisma.CategoryInclude>()({})

export const supplier = Prisma.validator<Prisma.SupplierInclude>()({
    contact: true,
})

export const option = Prisma.validator<Prisma.OptionInclude>()({
    dimensions: true,
    gallery: true,
})

export const variation = Prisma.validator<Prisma.VariationInclude>()({
    options: { include: option },
})

export const product = Prisma.validator<Prisma.ProductInclude>()({
    categories: true,
    gallery: true,
    dimensions: true,
    supplier: { include: supplier },
    variations: { include: variation },
})