import { Prisma } from "@prisma/client"
import { product as include } from "../prisma/include"
import { Category } from "./Category"
import { Supplier } from "./Supplier"
import { prisma } from "../prisma"
import { Socket } from "socket.io"
import { Dimensions } from "./Dimensions"
import { Image } from "./Image"
import { Variation } from "./Variation"
import { WithoutFunctions } from "./methodizer"

export type ProductPrisma = Prisma.ProductGetPayload<{ include: typeof include }>

export type ProductForm = Omit<WithoutFunctions<Product>, "id" | "active" | "rating" | "ratings" | "sold" | "dimensions_id" | "supplier"> & {
    id?: number
    active?: boolean
    rating?: number
    ratings?: number
    sold?: number
    dimensions_id?: number
}
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
    promotion: number
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
    variations: Variation[]

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

    static async new(socket: Socket, data: ProductForm) {
        try {
            const product_prisma = await prisma.product.create({
                data: {
                    ...data,
                    id: undefined,
                    dimensions_id: undefined,
                    supplier_id: undefined,

                    categories: { connect: data.categories.map((category) => ({ id: category.id })) },
                    dimensions: { create: data.dimensions },
                    gallery: { create: data.gallery },
                    variations: {
                        create: data.variations.map((variation) => ({
                            ...variation,
                            options: {
                                create: variation.options.map((option) => ({
                                    ...option,
                                    dimensions_id: undefined,
                                    dimensions: option.dimensions ? { create: option.dimensions } : undefined,
                                    gallery: option.gallery ? { create: option.gallery } : undefined,
                                })),
                            },
                        })),
                    },
                    supplier: { connect: { id: data.supplier_id } },
                },
                include,
            })

            const product = new Product(product_prisma.id)
            product.load(product_prisma)
            socket.emit("product:new:success", product)
            socket.broadcast.emit("product:update", product)
        } catch (error) {
            socket.emit("product:new:error", error?.toString())
        }
    }

    load(data: ProductPrisma) {
        this.active = data.active
        this.sku = data.sku
        this.name = data.name
        this.description = data.description
        this.technical = data.technical
        this.brand = data.brand
        this.stock = data.stock
        this.price = data.price
        this.promotion = data.promotion
        this.profit = data.profit
        this.cost = data.cost
        this.rating = data.rating
        this.ratings = data.ratings
        this.sold = data.sold
        this.supplier_id = data.supplier_id
        this.dimensions_id = data.dimensions_id

        this.variations = data.variations.map((variation) => new Variation(variation))
        this.gallery = data.gallery.map((image) => new Image(image))
        this.dimensions = new Dimensions(data.dimensions)
        this.categories = data.categories.map((item) => new Category(item))
        this.supplier = new Supplier(data.supplier_id)
        this.supplier.load(data.supplier)
        return this
    }
}
