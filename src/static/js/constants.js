import { logout } from "./fetchService.js";
import { getToken, isTokenExpired, setToken } from "./tokenService.js";

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
            setToken(null)
            window.history.pushState({}, '', '/')
            window.router.loadPage('/')
            return
        }
    }
    catch (err) {
        console.log(err)
    }
}

export function isUserAuthorized() {
    if (getToken() === 'null') return false
    if (isTokenExpired()) return false
    return true
}

export default function dropPopup(popupText)
{
    let popup = document.getElementById("popup");
    let popupContent = document.getElementById("popupText");
    popupContent.textContent = popupText;
    popup.style.display = "block";
    setTimeout(function() {
        popup.classList.add("fadeOut");
        setTimeout(function() {
            popup.style.display = "none";
            popup.classList.remove("fadeOut");
        }, 500)
    }, 3500);

    document.querySelector(".closePopup").addEventListener("click", function() {
        document.getElementById("popup").style.display = "none";
    });
}