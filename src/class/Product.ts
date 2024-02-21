import { Dimensions, Image, Prisma } from "@prisma/client"
import { product as include, variation as variation_include } from "../prisma/include"
import { Category } from "./Category"
import { Supplier } from "./Supplier"
import { prisma } from "../prisma"
import { Socket } from "socket.io"

export type VariationPrisma = Prisma.VariationGetPayload<{ include: typeof variation_include }>
export type ProductPrisma = Prisma.ProductGetPayload<{ include: typeof include }>

export class Product {
    id: number

    active: boolean

    sku: string
    name: string
    description: string
    technical: string
    brand: string

    stock: number
    price: number
    profit: number
    cost: number
    rating: number
    ratings: number
    sold: number

    categories: Category[]

    supplier_id: number
    supplier: Supplier

    dimensions_id: number
    dimensions: Dimensions

    gallery: Image[]
    variations: VariationPrisma[]

    constructor(id: number) {
        this.id = id
    }

    async init() {
        const data = await prisma.product.findUnique({ where: { id: this.id }, include })
        if (data) {
            this.load(data)
        } else {
            throw "produto não encontrado"
        }
    }

    static async list(socket: Socket) {
        const data = await prisma.product.findMany({ include })
        const list = data.map((item) => new Product(item.id).load(item))
        socket.emit("product:list", list)
    }

    // static async new(socket:Socket, Partial<ProductPrisma>)

    load(data: ProductPrisma) {
        this.active = data.active
        this.sku = data.sku
        this.name = data.name
        this.description = data.description
        this.technical = data.technical
        this.brand = data.brand
        this.stock = data.stock
        this.price = data.price
        this.profit = data.profit
        this.cost = data.cost
        this.rating = data.rating
        this.ratings = data.ratings
        this.sold = data.sold
        this.supplier_id = data.supplier_id
        this.dimensions_id = data.dimensions_id
        this.dimensions = data.dimensions

        this.gallery = data.gallery
        this.variations = data.variations

        this.categories = data.categories.map((item) => new Category(item))
        this.supplier = new Supplier(data.supplier_id)
        this.supplier.load(data.supplier)
        return this
    }
}
