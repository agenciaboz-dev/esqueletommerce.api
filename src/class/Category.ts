import { Prisma } from "@prisma/client"
import { category as include } from "../prisma/include"
import { prisma } from "../prisma"
import { Socket } from "socket.io"

export type CategoryPrisma = Prisma.CategoryGetPayload<{ include: typeof include }>

export class Category {
    id: number
    name: string
    cover: string

    constructor(id: number) {
        this.id = id
    }

    static async list(socket: Socket) {
        const list = await prisma.category.findMany({ include })
        socket.emit("category:list", list)
    }

    load(data: CategoryPrisma) {
        this.id = data.id
        this.name = data.name
        this.cover = data.cover
    }
}
