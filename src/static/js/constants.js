import { logout } from "./fetchService.js";

export const tokenNameInLS = "access_token"
export const apiUrl = "https://blog.kreosoft.space/api"

export class Response {
    isSuccess;
    response;
}

export async function logoutFunc() {
    try {
        const response = await logout(`${apiUrl}/account/logout`)
        if (response.isSuccess) {
            window.history.pushState({}, '', '/')
            window.router.loadPage('/')
            return
        }
    }
    catch (err) {
        console.log(err)
    }
}