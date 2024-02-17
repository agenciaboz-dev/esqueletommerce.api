import { Prisma } from "@prisma/client"

export const user = Prisma.validator<Prisma.UserInclude>()({
    address: true,
})


export const category = Prisma.validator<Prisma.CategoryInclude>()({
    products: true,
})
