import { Prisma } from "@prisma/client"

export type AddressPrisma = Prisma.AddressGetPayload<{}>

export class Address {
    id: number
    cep: string
    street: string
    number: string
    district: string
    uf: string
    city: string
    user_id: number

    constructor(data: AddressPrisma) {
        this.init(data)
    }

    init(data: AddressPrisma) {
        this.id = data.id
        this.cep = data.cep
        this.city = data.city
        this.district = data.district
        this.number = data.number
        this.street = data.street
        this.uf = data.uf
        this.user_id = data.user_id
    }
}
