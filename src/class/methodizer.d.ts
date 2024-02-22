export declare type WithoutFunctions<T> = {
    [P in keyof T as T[P] extends Function ? never : P]: T[P]
}

export declare interface ImageUpload {
    file: ArrayBuffer | File
    name: string
}
