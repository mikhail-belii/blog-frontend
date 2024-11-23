import { tokenNameInLS } from "./constants.js"

export function getToken() {
    return localStorage.getItem(tokenNameInLS)
}

export function setToken(token) {
    localStorage.setItem(tokenNameInLS, token)
}