import { Prisma } from "@prisma/client"
import { getIoInstance } from "../io/io"
import { prisma } from "../prisma"
import { LogInit } from "../types/LogInit"

export type LogPrisma = Prisma.LogGetPayload<{}>

export class Log {
    id: number
    text: string
    timestamp: string

    constructor(data: LogInit) {
        if (data.text) this.save(data.text)
        if (data.log) this.load(data.log)
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
