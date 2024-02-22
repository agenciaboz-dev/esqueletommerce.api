import { Prisma } from "@prisma/client"

export type DimensionsPrisma = Prisma.DimensionsGetPayload<{}>

export class Dimensions {
    id: number
    weight: number
    height: number
    length: number
    width: number
    product_id: number | null
    option_id: number | null

    constructor(data: DimensionsPrisma) {
        this.id = data.id
        this.weight = data.weight
        this.height = data.height
        this.length = data.length
        this.width = data.width
        this.product_id = data.product_id
        this.option_id = data.option_id
    }
}
