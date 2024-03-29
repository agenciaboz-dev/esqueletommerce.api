import { Prisma } from "@prisma/client"
import { user as include } from "../prisma/include"
import { prisma } from "../prisma"
import { Socket } from "socket.io"
// import { SignupForm } from "../types/shared/user/signup"
import { LoginForm } from "../types/shared/user/login"
import { Address, AddressForm } from "./Address"
import { handlePrismaError, user_errors } from "../prisma/errors"
import { saveImage } from "../tools/saveImage"
import { Log } from "./Log"
import { ImageUpload, WithoutFunctions } from "./methodizer"

export type UserPrisma = Prisma.UserGetPayload<{ include: typeof include }>
export class User {
    id: number
    email: string
    password: string
    name: string
    cpf: string
    birth: string
    phone: string
    pronoun: string
    admin: boolean

    image?: string | null | ImageUpload

    google_id: string | null
    google_token: string | null

    address?: Address

    constructor(id: number) {
        this.id = id
    }

    async init() {
        const user_prisma = await prisma.user.findUnique({ where: { id: this.id }, include })
        if (user_prisma) {
            this.load(user_prisma)
        } else {
            throw "usuário não encontrado"
        }
    }

    static async update(data: Partial<UserPrisma> & { id: number }, socket: Socket, user_id?: number) {
        const user = new User(data.id)
        await user.init()
        await user.update(data, socket)
        user.log(user_id ? `atualizou o usuário (${user.id}) ${user.name}` : "se atualizou", user_id)
    }

    static async signup(socket: Socket, data: UserForm, user_id?: number) {
        try {
            const user_prisma = await prisma.user.create({
                data: {
                    ...data,
                    image: "",
                    address: data.address
                        ? {
                              create: {
                                  cep: data.address.cep,
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
            user.load(user_prisma)
            if (data.image) {
                // @ts-ignore
                if (data.image?.file) {
                    // @ts-ignore
                    const url = saveImage(`users/${this.id}/`, data.image.file as ArrayBuffer, data.image.name)
                    await user.update({ image: url })
                }
            }

            socket.emit("user:signup:success", user)
            socket.broadcast.emit("user:signup", user)
            user.log(user_id ? `cadastrou o usuário (${user.id}) ${user.name}` : "se cadastrou", user_id)
        } catch (error) {
            handlePrismaError(error, socket) || socket.emit("user:signup:error", error?.toString())
        }
    }

    static async list(socket: Socket) {
        const users_prisma = await prisma.user.findMany({ include })
        const users = await Promise.all(
            users_prisma.map(async (user_prisma) => {
                const user = new User(user_prisma.id)
                user.load(user_prisma)
                return user
            })
        )

        socket.emit("user:list", users)
    }

    static async login(socket: Socket, data: LoginForm) {
        const user_prisma = await prisma.user.findFirst({
            where: { OR: [{ email: data.login }, { cpf: data.login }], password: data.password, admin: data.admin },
            include,
        })

        if (user_prisma) {
            const user = new User(user_prisma.id)
            user.load(user_prisma)
            socket.emit("user:login", user)
        } else {
            socket.emit("user:login", null)
        }
    }

    static async delete(socket: Socket, id: number, user_id: number) {
        try {
            const deleted = await prisma.user.delete({ where: { id }, include })
            socket.emit("user:delete:success", deleted)
            socket.broadcast.emit("user:delete", deleted)
            const user = new User(user_id)
            user.load(deleted)
            user.log(`deletou o usuário (${deleted.id}) ${deleted.name}`, user_id)
        } catch (error) {
            console.log(error)
            socket.emit("user:delete:error", error?.toString())
        }
    }

    load(data: UserPrisma) {
        this.id = data.id
        this.cpf = data.cpf
        this.birth = data.birth
        this.email = data.email
        this.name = data.name
        this.password = data.password
        this.phone = data.phone
        this.pronoun = data.pronoun
        this.admin = data.admin

        this.image = data.image

        this.google_id = data.google_id
        this.google_token = data.google_token

        if (data.address) this.address = new Address(data.address)
    }

    async update(data: Partial<UserPrisma>, socket?: Socket) {
        // @ts-ignore
        if (data.image?.file) {
            // @ts-ignore
            data.image = saveImage(`users/${this.id}/`, data.image.file as ArrayBuffer, data.image.name)
        }
        try {
            const user_prisma = await prisma.user.update({
                where: { id: this.id },
                data: {
                    ...data,
                    address: data.address
                        ? this.address
                            ? {
                                  update: {
                                      city: data.address.city,
                                      district: data.address.district,
                                      number: data.address.number,
                                      street: data.address.street,
                                      uf: data.address.uf,
                                      cep: data.address.cep,
                                  },
                              }
                            : {
                                  create: {
                                      city: data.address.city,
                                      district: data.address.district,
                                      number: data.address.number,
                                      street: data.address.street,
                                      uf: data.address.uf,
                                      cep: data.address.cep,
                                  },
                              }
                        : {},
                },
                include: include,
            })

            this.load(user_prisma)

            if (socket) {
                socket.emit("user:update:success", this)
                socket.emit("user:update", this)
                socket.broadcast.emit("user:update", this)
            }
        } catch (error) {
            console.log(error)
            if (socket) {
                handlePrismaError(error, socket) || socket.emit("user:update:error", error?.toString())
            }
        }
    }

    async log(text: string, user_id?: number) {
        let user: User
        user = this
        if (user_id) {
            user = new User(user_id)
            await user.init()
        }

        new Log({ text: `(${user.id}) ${user.name} ${text}` })
    }
}

export type UserForm = Omit<WithoutFunctions<User>, "address" | "id"> & { address?: AddressForm; id?: number }
