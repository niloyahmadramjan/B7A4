import { NextFunction, Request, Response } from "express"
import { authService } from "./auth.service"
import httpStatus from "http-status"
import { catchAsync } from "../../utils/catchAsynce"
import { sendResponse } from "../../utils/sentResponse"

const registerUser = catchAsync(async (req: Request, res: Response,next:NextFunction)=> {
    
    const payload = req.body
    const user = await authService.userRegisterInDB(payload)
    sendResponse(res, {
        success: true,
        message: "User register successfully",
        statusCode: httpStatus.OK,
        data:{user}
    })
})


const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const { accessToken, refreshToken } = await authService.userLoginInDB(payload)
    console.log(accessToken,refreshToken)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge:1000  *60 * 60 *24 *7 
    })
     res.cookie("accessToken", accessToken, {
         httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge:1000  *60 * 60 *24 
    })

    sendResponse(res, {
        success: true,
        message: "login successfully",
        data:{ accessToken, refreshToken },
        statusCode: httpStatus.OK,

    })



})
    
const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshtoken = req.cookies.refreshToken
    const {accessToken} = await authService.refreshTokenSave(refreshtoken)
    res.cookie("accessToken", accessToken, {
         httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge:1000  *60 * 60 *24 
    })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
          message: "RefreshToken is successfully",
        data:{accessToken}
    })
    
})

const getCurrentUser = catchAsync(async (req:Request, res:Response, next: NextFunction) => {
    const userId = req.user?.id
   
    const result = await authService.getCurrentLoginUser(userId as string)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile fetched successfully",
        data:result
    })
})

export const authController = {
    registerUser,  
    loginUser,
    refreshToken,
    getCurrentUser
    
}