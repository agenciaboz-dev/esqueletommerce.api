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
import { Log } from "../class/Log"
import { SupplierForm } from "../types/shared/SupplierForm"
import { Supplier, SupplierPrisma } from "../class/Supplier"

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

    socket.on("user:signup", (data: SignupForm, user_id?: number) => User.signup(socket, data, user_id))
    socket.on("user:list", () => User.list(socket))
    socket.on("user:login", (data: LoginForm) => User.login(socket, data))
    socket.on("user:update", (data: Partial<UserPrisma> & { id: number }, user_id?: number) => User.update(data, socket, user_id))
    socket.on("user:delete", (data: { id: number; user_id: number }) => User.delete(socket, data.id, data.user_id))

    socket.on("category:list", () => Category.list(socket))
    socket.on("category:new", (data: CategoryForm) => Category.new(socket, data))
    socket.on("category:update", (data: Partial<CategoryPrisma> & { id: number; user_id: number }) => Category.update(socket, data))
    socket.on("category:delete", (data: { id: number; user_id: number }) => Category.delete(socket, data.id, data.user_id))

    socket.on("cep:search", (data: { cep: string }) => Address.searchCep(data.cep, socket))

    socket.on("log:list", () => Log.list(socket))

    socket.on("supplier:list", () => Supplier.list(socket))
    socket.on("supplier:new", (data: SupplierForm, user_id: number) => Supplier.new(data, user_id, socket))
    socket.on("supplier:update", (data: Partial<SupplierPrisma> & { id: number }, user_id) => Supplier.update(socket, data, user_id))
    socket.on("supplier:delete", (id: number, user_id: number) => Supplier.delete(socket, id, user_id))
}

export default { initializeIoServer, getIoInstance, handleSocket }
