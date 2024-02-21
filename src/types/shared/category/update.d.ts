import { ImageUpload } from "../ImageUpload"

export declare interface CategoryForm {
    name: string
    image?: string | ImageUpload | null
    user_id: number
}
