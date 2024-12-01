import { logoutFunc } from "./constants.js"
import { initRouter } from "./router.js"

document.addEventListener('DOMContentLoaded', () => {
    initRouter()

    const logoutBtn = document.querySelector('.logout')
    logoutBtn.addEventListener('mousedown', (event) => event.preventDefault())
    logoutBtn.addEventListener('click', logoutFunc)
})