import { Prisma } from "@prisma/client";
import { user as include } from "../prisma/include"
import { prisma } from "../prisma"
import { Socket } from "socket.io"
import { SignupForm } from "../types/user/signup"
import { uid } from "uid"
import { LoginForm } from "../types/user/login"

export type UserPrisma = Prisma.UserGetPayload<{ include: typeof include }>

export class User {
    id: number
    username: string
    email: string
    password: string
    name: string
    cpf: string
    birth: Date
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
        const user_prisma = await prisma.user.create({
            data: data,
            include,
        })

        const user = new User(user_prisma.id)
        await user.init()
        socket.emit("user:signup", user)
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

    async load(data: UserPrisma) {
        this.id = data.id
        this.cpf = data.cpf
        this.birth = new Date(Number(data.birth))
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