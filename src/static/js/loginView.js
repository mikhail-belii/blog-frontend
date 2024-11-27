import { apiUrl } from "./constants.js"
import { getProfile, login } from "./fetchService.js"
import { setToken } from "./tokenService.js"
import { View } from "./view.js"

export class LoginView extends View {
    async getHtml() {
        return `
                <div class="form-container">
                    <div class="head">Вход</div>
                    <div class="credentials">
                        <label for="email-input"><b>Email</b></label>
                        <input type="text" placeholder="name@example.com" id="email-input" required>

                        <label for="password-input"><b>Пароль</b></label>
                        <input type="password" placeholder="Введите пароль" id="password-input" required minlength="6">
                    </div>
                    <button type="button" class="login-btn">Войти</button>
                    <button type="button" id="registration">Зарегистрироваться</button>
                </div>
        `
    }

    async runScript() {
        const style = document.querySelector('link[rel="stylesheet"]')
        style.href = '/static/css/login.css'
        const title = document.querySelector('title')
        title.innerText = 'Авторизация'

        try {
            const response = await getProfile(`${apiUrl}/account/profile`)
            if (response.isSuccess) {
                window.history.pushState({}, '', '/')
                window.router.loadPage('/')
                return
            }
        }
        catch (err) {
            console.log('User not authorized')
        }

        const homeRdrct = document.getElementById('home')
        const authorsRdrct = document.getElementById('authors')
        const communitiesRdrct = document.getElementById('communities')
        const writePostRdrct = document.getElementById('post')
        const loginRdrct = document.getElementById('login')
        const userEmail = document.querySelector('.user-email')
        const registrationRdrct = document.getElementById('registration');
        homeRdrct.style.display = 'block'
        authorsRdrct.style.display = 'none'
        communitiesRdrct.style.display = 'none'
        loginRdrct.style.display = 'block'
        userEmail.style.display = 'none'
        writePostRdrct.style.display = 'none'
    
        const loginBtn = document.querySelector('.login-btn')
        const emailInput = document.getElementById('email-input')
        const passwordInput = document.getElementById('password-input')
    
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
            const preloader = document.querySelector('.spinner')
            const preloaderBg = document.querySelector('.preloader-bg')
    
            preloaderBg.style.display = 'flex'
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
                    window.history.pushState({}, '', '/')
                    window.router.loadPage('/')
                }
                catch (err) {
                    console.log(err)
                }
                finally {
                    preloaderBg.style.display = 'none'
                    preloader.style.display = 'none'
                }
            }, 500)
        })

        registrationRdrct.addEventListener('click', () => {
            window.history.pushState({}, '', '/registration')
            window.router.loadPage('/registration')
        })
    }
}