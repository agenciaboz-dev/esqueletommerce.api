import { Server as SocketIoServer } from "socket.io"
import { Server as HttpServer } from "http"
import { Server as HttpsServer } from "https"
import { Socket } from "socket.io"
import google from "../google"
import { SignupForm } from "../types/shared/user/signup"
import { User, UserPrisma } from "../class/User"
import { LoginForm } from "../types/shared/user/login"
import { Category, CategoryPrisma } from "../class/Category"
import { Address } from "../class/Address"
import { CategoryForm } from "../types/shared/category/update"

let io: SocketIoServer | null = null

export const initializeIoServer = (server: HttpServer | HttpsServer) => {
    io = new SocketIoServer(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e8 })
    return io
}

export const getIoInstance = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Please call initializeIoServer first.")
    }
    return io
}

export const handleSocket = (socket: Socket) => {
    console.log(`new connection: ${socket.id}`)

    socket.on("disconnect", async (reason) => {
        console.log(`disconnected: ${socket.id}`)
    })

    socket.on("google:login", (data) => google.login.login(socket, data))
    socket.on("google:exchange", (data) => google.login.exchangeCode(socket, data))
    socket.on("google:link", (user) => google.person.link(socket, user))

    socket.on("user:signup", (data: SignupForm) => User.signup(socket, data))
    socket.on("user:list", () => User.list(socket))
    socket.on("user:login", (data: LoginForm) => User.login(socket, data))
    socket.on("user:update", (data: Partial<UserPrisma> & { id: number }) => User.update(data, socket))
    socket.on("user:delete", (data: { id: number }) => User.delete(socket, data.id))

    socket.on("category:list", () => Category.list(socket))
    socket.on("category:new", (data: CategoryForm) => Category.new(socket, data))
    socket.on("category:update", (data: Partial<CategoryPrisma> & { id: number }) => Category.update(socket, data))
    socket.on("category:delete", (data: { id: number }) => Category.delete(socket, data.id))

    socket.on("cep:search", (data: { cep: string }) => Address.searchCep(data.cep, socket))
}

export default { initializeIoServer, getIoInstance, handleSocket }
