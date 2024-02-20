import { Prisma } from "@prisma/client"
import { category as include } from "../prisma/include"
import { prisma } from "../prisma"
import { Socket } from "socket.io"
import { CategoryForm } from "../types/shared/category/update"

export type CategoryPrisma = Prisma.CategoryGetPayload<{ include: typeof include }>

export class Category {
    id: number
    name: string
    image: string | null

    constructor(data: CategoryPrisma) {
        this.load(data)
    }

    static async list(socket: Socket) {
        const list = await prisma.category.findMany({ include })
        socket.emit("category:list", list)
    }

    static async new(socket: Socket, data: CategoryForm) {
        const category_prisma = await prisma.category.create({
            data: { name: data.name },
            include,
        })

        const category = new Category(category_prisma)
        if (data.image) {
            // @ts-ignore
            if (data.image?.file) {
                // @ts-ignore
                const url = saveImage(`categories/${this.id}/`, image.file as ArrayBuffer, image.name)
                await category.update({ image: url })
            }
        }

        socket.emit("category:new:success", category)
        socket.broadcast.emit("category:update", category)
    }

    static async update(socket: Socket, data: Partial<CategoryPrisma> & { id: number }) {
        try {
            const category_prisma = await prisma.category.findUnique({ where: { id: data.id }, include })
            if (category_prisma) {
                const category = new Category(category_prisma)
                await category.update(data, socket)
            } else {
                throw "categoria não encontrada"
            }
        } catch (error) {
            socket.emit("category:update:error", error?.toString())
        }
    }

    static async delete(socket: Socket, id: number) {
        try {
            const deleted = await prisma.category.delete({ where: { id } })
            socket.emit("category:delete:success", deleted)
            socket.broadcast.emit("category:delete", deleted)
        } catch (error) {
            console.log(error)
            socket.emit("category:delete:error", error?.toString())
        }
    }

    load(data: CategoryPrisma) {
        this.id = data.id
        this.name = data.name
        this.image = data.image
    }

    async update(data: Partial<CategoryPrisma>, socket?: Socket) {
        // @ts-ignore
        if (data.image?.file) {
            // @ts-ignore
            data.image = saveImage(`categories/${this.id}/`, data.image.file as ArrayBuffer, data.image.name)
        }

        const category_prisma = await prisma.category.update({ where: { id: this.id }, data, include })
        this.load(category_prisma)

        if (socket) {
            socket.emit("category:update:success", this)
            socket.broadcast.emit("category:update", this)
        }
    }
}
