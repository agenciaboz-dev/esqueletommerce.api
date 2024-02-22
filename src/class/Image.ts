import { Prisma } from "@prisma/client"

export type ImagePrisma = Prisma.ImageGetPayload<{}>

export class Image {
    id: number
    url: string
    product_id: number | null
    option_id: number | null

    constructor(data: ImagePrisma) {
        this.id = data.id
        this.url = data.url
        this.product_id = data.product_id
        this.option_id = data.option_id
    }
}
