import { User } from "../../../class/User"

export declare interface SignupForm extends User {
    id?: number
    init?: () => Promise<void>
    load?: (data: UserPrisma) => Promise<void>
    update?: (data: Partial<UserPrisma>, socket?: Socket) => Promise<void>
}
