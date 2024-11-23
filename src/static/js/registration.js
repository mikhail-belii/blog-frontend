import { apiUrl } from "./constants.js"
import { register } from "./fetchService.js"
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

    const fullnameInput = document.getElementById('fullname-input')
    const birthdayInput = document.getElementById('birthday-input')
    const sexInput = document.getElementById('sex-input')
    const phoneInput = document.getElementById('phone-input')
    const emailInput = document.getElementById('email-input')
    const passwordInput = document.getElementById('password-input')
    const loginRdrct = document.getElementById('login')
    const homeRdrct = document.getElementById('home')
    const regBtn = document.getElementById('reg-btn')
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
                window.location.href = 'index.html'
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

    loginRdrct.addEventListener('click', () => {
        window.location.href = 'login.html'
    })

    homeRdrct.addEventListener('click', () => {
        window.location.href = 'index.html'
    })
})