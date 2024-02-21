import { Prisma } from "@prisma/client"
import { getIoInstance } from "../io/io"
import { prisma } from "../prisma"
import { LogInit } from "../types/LogInit"
import { Socket } from "socket.io"

export type LogPrisma = Prisma.LogGetPayload<{}>

export class Log {
    id: number
    text: string
    timestamp: string

    constructor(data: LogInit) {
        if (data.text) this.save(data.text)
        if (data.log) this.load(data.log)
    }

    static async list(socket: Socket) {
        const logs = await prisma.log.findMany()
        logs.forEach((log_prisma) => {
            const log = new Log({ log: log_prisma })
            socket.emit("log:update", log)
        })
    }

    load(data: LogPrisma) {
        this.id = data.id
        this.text = data.text
        this.timestamp = data.timestamp
    }

    async save(text: string) {
        const io = getIoInstance()
        const log_prisma = await prisma.log.create({ data: { text, timestamp: new Date().getTime().toString() } })
        this.load(log_prisma)

        io.emit("log:update", this)
    }
}
