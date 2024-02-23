import { Prisma } from "@prisma/client"
import { variation as include, option as option_include } from "../prisma/include"
import { Dimensions } from "./Dimensions"
import { Image } from "./Image"

export type VariationPrisma = Prisma.VariationGetPayload<{ include: typeof include }>
export type VariationOptionPrisma = Prisma.OptionGetPayload<{ include: typeof option_include }>

export class VariationOption {
    id: number
    name: string
    sku: string | null
    cover_url: string | null
    price: number | null
    promotion: number | null
    stock: number | null
    dimensions_id: number | null

    dimensions: Dimensions | null
    gallery: Image[]

    constructor(data: VariationOptionPrisma) {
        this.id = data.id
        this.name = data.name
        this.sku = data.sku
        this.cover_url = data.cover_url
        this.price = data.price
        this.promotion = data.promotion
        this.stock = data.stock
        this.dimensions_id = data.dimensions_id

        this.dimensions = data.dimensions ? new Dimensions(data.dimensions) : null
        this.gallery = data.gallery.map((image) => new Image(image))
    }
}

export class Variation {
    id: number
    type: string
    options: VariationOption[]

    constructor(data: VariationPrisma) {
        this.id = data.id
        this.type = data.type
        this.options = data.options.map((option) => new VariationOption(option))
    }
}
