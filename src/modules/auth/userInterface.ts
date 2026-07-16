import { Role } from "../../../generated/prisma/client"

export interface RegisterUserPayload {
    name: string,
    email: string,
    password: string,
    phone?:string,
    role?: Role
}

export interface ILogin{
    email: string,
    password:string
}