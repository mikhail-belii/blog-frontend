import { tokenNameInLS } from "./constants.js"
import * as jose from 'https://cdn.jsdelivr.net/npm/jose@5.9.6/+esm'

export function getToken() {
    return localStorage.getItem(tokenNameInLS)
}

export function setToken(token) {
    localStorage.setItem(tokenNameInLS, token)
}

export function isTokenExpired() {
    return (new Date(jose.decodeJwt(getToken()).exp) * 1000) < Date.now()
}