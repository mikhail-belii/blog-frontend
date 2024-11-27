import { apiUrl } from "./constants.js"
import { getProfile, register } from "./fetchService.js"
import { setToken } from "./tokenService.js"
import { View } from "./view.js"

export class RegistrationView extends View {
    async getHtml() {
        return `
                <div class="form-container">
                    <div class="head">Регистрация</div>
                    <div class="credentials">
                        <label for="fullname-input"><b>ФИО</b></label>
                        <input type="text" placeholder="Иванов Иван Иванович" id="fullname-input" required>

                        <label for="birthday-input"><b>Дата рождения</b></label>
                        <input type="date" class="birthday-input" required>

                        <label for="sex-input"><b>Пол</b></label>
                        <select id="sex-input">
                            <option value="Male">Мужской</option>
                            <option value="Female">Женский</option>
                        </select>

                        <label for="phone-input"><b>Телефон</b></label>
                        <input type="tel" id="phone-input" placeholder="+7(xxx)xxx-xx-xx" required>

                        <label for="email-input"><b>Email</b></label>
                        <input type="text" placeholder="name@example.com" id="email-input" required>

                        <label for="password-input"><b>Пароль</b></label>
                        <input type="password" placeholder="Введите пароль" id="password-input" required>
                    </div>
                    <button type="button" class="reg-btn">Зарегистрироваться</button>
                </div>
                `
    }

    async runScript() {
        const style = document.querySelector('link[rel="stylesheet"]')
        style.href = '/static/css/registration.css'
        const title = document.querySelector('title')
        title.innerText = 'Регистрация'
        try {
            const response = await getProfile(`${apiUrl}/account/profile`)
            if (response.isSuccess) {
                window.history.pushState({}, '', '/')
                window.router.loadPage('/')
                return
            }
        }
        catch (err) {
            console.log(err)
        }

        const homeRdrct = document.getElementById('home')
        const authorsRdrct = document.getElementById('authors')
        const communitiesRdrct = document.getElementById('communities')
        const writePostRdrct = document.getElementById('post')
        const loginRdrct = document.getElementById('login')
        const userEmail = document.querySelector('.user-email')
        homeRdrct.style.display = 'block'
        authorsRdrct.style.display = 'none'
        communitiesRdrct.style.display = 'none'
        loginRdrct.style.display = 'block'
        userEmail.style.display = 'none'
        writePostRdrct.style.display = 'none'

        const fullnameInput = document.getElementById('fullname-input')
        const birthdayInput = document.getElementById('birthday-input')
        const sexInput = document.getElementById('sex-input')
        const phoneInput = document.getElementById('phone-input')
        const emailInput = document.getElementById('email-input')
        const passwordInput = document.getElementById('password-input')
        const regBtn = document.querySelector('.reg-btn')
        var mask = IMask(phoneInput, {
            mask: '+7(000)000-00-00'
        })

        regBtn.addEventListener('click', async (event) => {
            event.preventDefault()

            if (!fullnameInput.value || !birthdayInput.value || !sexInput.value || 
                !phoneInput.value || !emailInput.value || !passwordInput.value) {
                alert('Пожалуйста, заполните все поля')
                return
            }

            let date = new Date(birthdayInput.value)
            let data = {
                fullName: fullnameInput.value,
                password: passwordInput.value,
                email: emailInput.value,
                birthDate: date.toISOString(),
                gender: sexInput.value,
                phoneNumber: phoneInput.value
            }

            const preloader = document.querySelector('.spinner')
            const preloaderBg = document.querySelector('.preloader-bg')
            preloaderBg.style.display = 'block'
            preloader.style.display = 'block'
            setTimeout(async () => {
                try {
                    const response = await register(`${apiUrl}/account/register`, JSON.stringify(data))
                    if (!response.isSuccess)
                    {
                        alert(JSON.stringify(response.response.errors))
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
            }, 500);
        })
        }
}