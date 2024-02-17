import { Prisma } from "@prisma/client"
import { category as include } from "../prisma/include"

export type CategoryPrisma = Prisma.CategoryGetPayload<{ include: typeof include }>

export class Category {
    id: number
    name: string
    cover: string

    constructor(data: CategoryPrisma) {}

    load(data: CategoryPrisma) {
        this.id = data.id
        this.name = data.name
        this.cover = data.cover
    }
}
