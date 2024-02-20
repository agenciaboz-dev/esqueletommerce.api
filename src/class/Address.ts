import { Prisma } from "@prisma/client"
import viacep from "../api/viacep"
import { Socket } from "socket.io"

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

    static async searchCep(cep: string, socket?: Socket) {
        try {
            const response = await viacep.search(cep.replace(/\D/g, ""))
            const address = response.data

            if (socket) {
                socket.emit(address.erro ? "cep:search:error" : "cep:search", address)
            }
        } catch (error) {
            console.log(error)
            socket?.emit("cep:search:error", error?.toString())
        }
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
