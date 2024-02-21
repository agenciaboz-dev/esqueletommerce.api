import { Prisma } from "@prisma/client"
import { supplier as include } from "../prisma/include"
import { prisma } from "../prisma"
import { Contact } from "./Contact"
import { SupplierForm } from "../types/shared/SupplierForm"
import { Socket } from "socket.io"
import { User } from "./User"
import { Log } from "./Log"

export type SupplierPrisma = Prisma.SupplierGetPayload<{ include: typeof include }>

export class Supplier {
    id: number
    name: string
    cnpj: string
    code: string

    contact_id: number
    contact: Contact

    constructor(id: number) {
        this.id = id
    }

    async init() {
        const supplier_prisma = await prisma.supplier.findUnique({ where: { id: this.id }, include })
        if (supplier_prisma) {
            this.load(supplier_prisma)
        } else {
            throw "fornecedor não encontrado"
        }
    }

    static async list(socket: Socket) {
        const suppliers = await prisma.supplier.findMany({ include })
        const list = suppliers.map((supplier_prisma) => {
            const supplier = new Supplier(supplier_prisma.id)
            supplier.load(supplier_prisma)
            return supplier
        })
        socket.emit("supplier:list", list)
    }

    static async new(data: SupplierForm, user_id: number, socket: Socket) {
        try {
            const supplier_prisma = await prisma.supplier.create({
                data: { ...data, contact: { create: data.contact } },
                include,
            })
            const supplier = new Supplier(supplier_prisma.id)
            supplier.load(supplier_prisma)
            socket.emit("supplier:new:success", supplier)
            socket.broadcast.emit("supplier:update", supplier)
            supplier.log(user_id, `cadastrou o fornecedor (${supplier.id}) ${supplier.name}`)
        } catch (error) {
            console.log(error)
            socket.emit("supplier:new:error", error?.toString())
        }
    }

    static async update(socket: Socket, data: Partial<SupplierPrisma> & { id: number }, user_id: number) {
        const supplier = new Supplier(data.id)
        await supplier.init()
        await supplier.update(data, socket)
        supplier.log(user_id, `atualizou o fornecedor (${supplier.id}) ${supplier.name}`)
    }

    static async delete(socket: Socket, id: number, user_id: number) {
        const deleted = await prisma.supplier.delete({ where: { id }, include })
        socket.emit("supplier:delete:success", deleted)
        socket.broadcast.emit("supplier:delete", deleted)
        const supplier = new Supplier(deleted.id)
        supplier.load(deleted)
        supplier.log(user_id, `deletou o fornecedor (${supplier.id}) ${supplier.name}`)
    }

    load(data: SupplierPrisma) {
        this.id = data.id
        this.name = data.name
        this.cnpj = data.cnpj
        this.code = data.code
        this.contact_id = data.contact_id
        if (data.contact) this.contact = new Contact(data.contact)
    }

    async log(user_id: number, text: string) {
        const user = new User(user_id)
        await user.init()

        new Log({ text: `(${user.id}) ${user.name} ${text}` })
    }

    async update(data: Partial<SupplierPrisma>, socket?: Socket) {
        try {
            const supplier_prisma = await prisma.supplier.update({
                where: { id: this.id },
                data: {
                    ...data,
                    id: undefined,
                    contact_id: undefined,
                    products: {},
                    contact: data.contact ? { update: data.contact } : {},
                },
                include,
            })
            this.load(supplier_prisma)

            if (socket) {
                socket.emit("supplier:update:success", this)
                socket.emit("supplier:update", this)
                socket.broadcast.emit("supplier:update", this)
            }
        } catch (error) {
            console.log(error)
            socket?.emit("supplier:update:error", error?.toString())
        }
    }
}
