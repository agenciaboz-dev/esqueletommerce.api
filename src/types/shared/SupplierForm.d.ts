export declare interface SupplierForm {
    name: string
    cnpj: string
    code: string

    contact: {
        name: string
        phone: string | null
        email: string | null
    }
}
