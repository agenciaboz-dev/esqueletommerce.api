import { Prisma } from "@prisma/client";
import { user as include } from "../prisma/include"
import { prisma } from "../prisma"
import { Socket } from "socket.io"
import { SignupForm } from "../types/shared/user/signup"
import { uid } from "uid"
import { LoginForm } from "../types/shared/user/login"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export type UserPrisma = Prisma.UserGetPayload<{ include: typeof include }>

export class User {
    id: number
    username: string
    email: string
    password: string
    name: string
    cpf: string
    birth: string
    phone: string
    pronoun: string
    uf: string
    admin: boolean

    image: string | null

    google_id: string | null
    google_token: string | null

    constructor(id: number) {
        this.id = id
    }

    async init() {
        const user_prisma = await prisma.user.findUnique({ where: { id: this.id }, include })
        if (user_prisma) {
            await this.load(user_prisma)
        } else {
            throw "usuário não encontrado"
        }
    }

    static async update(data: Partial<UserPrisma> & { id: number }, socket: Socket) {
        const user = new User(data.id)
        await user.init()
        user.update(data, socket)
    }

    static async signup(socket: Socket, data: SignupForm) {
        try {
            const user_prisma = await prisma.user.create({
                data: {
                    ...data,
                    address: data.address
                        ? {
                              create: {
                                  city: data.address.city,
                                  district: data.address.district,
                                  number: data.address.number,
                                  street: data.address.street,
                                  uf: data.address.uf,
                              },
                          }
                        : {},
                },
                include,
            })

            const user = new User(user_prisma.id)
            await user.init()
            socket.emit("user:signup", user)
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                const errors = [
                    { key: "username", message: "nome de usuário já cadastrado" },
                    { key: "email", message: "e-mail já cadastrado" },
                    { key: "cpf", message: "cpf já cadastrado" },
                    { key: "google_id", message: "conta google já cadastrada" },
                ]

                const target = error.meta?.target as string | undefined
                const match = target?.match(/_(.*?)_/)
                if (match) {
                    const key = match[1]
                    const message = errors.find((item) => item.key == key)?.message
                    socket.emit("user:signup:error", message)
                    return
                }
            }

            socket.emit("user:signup:error", error?.toString())
        }
    }

    static async list(socket: Socket) {
        const users_prisma = await prisma.user.findMany({ include })
        const users = await Promise.all(
            users_prisma.map(async (user) => {
                const new_user = new User(user.id)
                await new_user.init()
                return new_user
            })
        )

        socket.emit("user:list", users)
    }

    static async login(socket: Socket, data: LoginForm) {
        const user_prisma = await prisma.user.findFirst({
            where: { OR: [{ email: data.login }, { username: data.login }, { cpf: data.login }], password: data.password, admin: data.admin },
            include,
        })

        if (user_prisma) {
            const user = new User(user_prisma.id)
            await user.init()
            socket.emit("user:login", user)
        } else {
            socket.emit("user:login", null)
        }
    }

    static async delete(socket: Socket, id: number) {
        try {
            const deleted = await prisma.user.delete({ where: { id } })
            socket.emit("user:delete", deleted)
        } catch (error) {
            console.log(error)
            socket.emit("user:delete:error", error?.toString())
        }
    }

    async load(data: UserPrisma) {
        this.id = data.id
        this.cpf = data.cpf
        this.birth = data.birth
        this.username = data.username
        this.email = data.email
        this.name = data.name
        this.password = data.password
        this.phone = data.phone
        this.pronoun = data.pronoun
        this.uf = data.uf
        this.admin = data.admin

        this.image = data.image

        this.google_id = data.google_id
        this.google_token = data.google_token
    }

    async update(data: Partial<UserPrisma>, socket?: Socket) {
        try {
            const user_prisma = await prisma.user.update({
                where: { id: this.id },
                data: {
                    ...data,
                    address: {},
                },
                include: include,
            })

            await this.load(user_prisma)

            socket && socket.emit("user:update", this)
        } catch (error) {
            console.log(error)
        }
    }
}