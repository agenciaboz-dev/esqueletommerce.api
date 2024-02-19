import { Address } from "../../../class/Address"
import { User } from "../../../class/User"

interface SignupAddress extends Address {
    id?: number
    init?: (data: AddressPrisma) => void
    user_id?: number
}
export declare interface SignupForm extends User {
    id?: number
    init?: () => Promise<void>
    load?: (data: UserPrisma) => Promise<void>
    update?: (data: Partial<UserPrisma>, socket?: Socket) => Promise<void>

    address?: SignupAddress
}
