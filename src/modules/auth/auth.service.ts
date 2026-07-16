import { ref } from "node:process"
import config from "../../config"
import { prisma } from "../../lib/prisma"
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import { Role } from "../../../generated/prisma/enums"
import { ILogin, RegisterUserPayload } from "./userInterface"
import bcrypt from "bcryptjs"
import { jwtUtils } from "../../utils/jwt"
const userRegisterInDB = async (payload: RegisterUserPayload) => {
    const { name, email, password, phone, role } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email },
    });

    if (isUserExist) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds)
    );


    const result = await prisma.$transaction(async (tex) => {
        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role: role || Role.CUSTOMER,
            },

        });
        if (createdUser.role === "TECHNICIAN") {
            await tex.technicianProfile.create({
                data: {
                    userId: createdUser.id,
                    bio: "",
                    experience: 0,
                    location: "",
                }
            })
        }
        return await tex.user.findUnique({
            where: { id: createdUser.id },
            omit: {
                password: true,
            },
            include: {
                technicianProfile: true,
            },
        });
    })

    return result 

};

const userLoginInDB = async (payload: ILogin) => {
    const { email, password } = payload
    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    })

    const IsPasswordMatch = await bcrypt.compare(password, user.password)
    if (!IsPasswordMatch) {
        throw new Error("Password is Incorrected")
    }


    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    const accessToken = await jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in as SignOptions)
    const refreshToken = await jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in as SignOptions)
    return {
        accessToken,
        refreshToken
    }
}




const refreshTokenSave = async (token: string) => {
    const veryToken = await jwtUtils.verifyToken(token, config.jwt_refresh_secret)
    if (!veryToken.success) {
        throw new Error("Token is not valied")
    }

    const { id } = veryToken.data as JwtPayload

    const user = await prisma.user.findUniqueOrThrow({
        where: { id }
    })

    const jwtPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    }

    const accessToken = await jwtUtils.createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in as SignOptions)
    return {
        accessToken
    }

}


const getCurrentLoginUser = async (userId: string) => {

    const user = await prisma.user.findFirstOrThrow({
        where: {
            id: userId
        },
        include: {
            technicianProfile: true,
            bookingsAsCustomer: true,
            reviews: true
        }

    })
    if (user.role === Role.TECHNICIAN) {
        return user;

    }

    const { technicianProfile, ...rest } = user;
    return rest;

}
export const authService = {
    userRegisterInDB,
    userLoginInDB,
    refreshTokenSave,
    getCurrentLoginUser
}