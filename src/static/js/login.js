import { apiUrl } from "./constants.js"
import { getProfile, login } from "./fetchService.js"
import { setToken } from "./tokenService.js"

const preloader = document.querySelector('.spinner')
const preloaderBg = document.querySelector('.preloader-bg')

document.addEventListener('DOMContentLoaded', () => {
    // try {
    //     getProfile(`${apiUrl}/account/profile`)
    //     window.location.href = 'home.html'
    // }
    // catch (err) {
    //     return
    // }

    const loginBtn = document.getElementById('login-btn')
    const emailInput = document.getElementById('email-input')
    const passwordInput = document.getElementById('password-input')
    const loginRdrct = document.getElementById('login')
    const homeRdrct = document.getElementById('home')
    const registerBtn = document.getElementById('reg-rdrct-btn')

    loginBtn.addEventListener('click', async (event) => {
        event.preventDefault()
        let credentials = {
            email: emailInput.value,
            password: passwordInput.value
        }
        if (!credentials.email || !credentials.password) {
            alert('Введите Email и пароль')
            return
        }

        preloaderBg.style.display = 'block'
        preloader.style.display = 'block'
        setTimeout(async () => {
            try {
                const response = await login(`${apiUrl}/account/login`, JSON.stringify(credentials))
                if (!response.isSuccess)
                {
                    alert("Неверный Email или пароль")
                    return
                }
                
                setToken(response.response.token)
                window.location.href = 'index.html'
            }
            catch (err) {
                alert(`Что-то пошло не так`)
            }
            finally {
                preloaderBg.style.display = 'none'
                preloader.style.display = 'none'
            }
        }, 500)
    })

    loginRdrct.addEventListener('click', () => {
        window.location.href = 'login.html'
    })

    homeRdrct.addEventListener('click', () => {
        window.location.href = 'index.html'
    })

    registerBtn.addEventListener('click', () => {
        window.location.href = 'registration.html'
    })
})