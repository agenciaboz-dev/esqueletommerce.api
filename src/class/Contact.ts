import { Prisma } from "@prisma/client"

export type ContactPrisma = Prisma.ContactGetPayload<{}>

export class Contact {
    id: number
    name: string
    supplier_id: number | null
    email: string | null
    phone: string | null

    constructor(data: ContactPrisma) {
        this.load(data)
    }

    load(data: ContactPrisma) {
        this.id = data.id
        this.email = data.email
        this.name = data.name
        this.phone = data.phone
        this.supplier_id = data.supplier_id
    }
}
