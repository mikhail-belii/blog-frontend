import { apiUrl } from "./constants.js"
import { editProfile, getProfile, logout } from "./fetchService.js"

const preloader = document.querySelector('.spinner')
const preloaderBg = document.querySelector('.preloader-bg')

document.addEventListener('DOMContentLoaded', async () => {
    const fullnameInput = document.getElementById('fullname-input')
    const birthdayInput = document.getElementById('birthday-input')
    const sexInput = document.getElementById('sex-input')
    const phoneInput = document.getElementById('phone-input')
    const emailInput = document.getElementById('email-input')
    const homeRdrct = document.getElementById('home')
    const saveBtn = document.getElementById('save-btn')
    const userEmailText = document.getElementById('user-email-text')
    const profileRdrct = document.getElementById('profile')
    const logoutBtn = document.getElementById('logout')
    var mask = IMask(phoneInput, {
        mask: '+7(000)000-00-00'
    })

    refreshData()

    saveBtn.addEventListener('click', async (event) => {
        event.preventDefault()

        if (!fullnameInput.value || !birthdayInput.value || !sexInput.value || 
            !phoneInput.value || !emailInput.value) {
            alert('Пожалуйста, заполните все поля')
            return
        }

        let date = new Date(birthdayInput.value)
        let data = {
            fullName: fullnameInput.value,
            email: emailInput.value,
            birthDate: date.toISOString(),
            gender: sexInput.value,
            phoneNumber: phoneInput.value
        }

        try {
            const response = await editProfile(`${apiUrl}/account/profile`, JSON.stringify(data))
            if (response.isSuccess) {
                userEmailText.innerText = emailInput.value
                alert("Профиль изменён")
                return
            }
            alert(JSON.stringify(response.response.errors))
        }
        catch (err) {
            console.log(err)
        }
        
    })

    homeRdrct.addEventListener('click', () => {
        window.location.href = 'index.html'
    })

    profileRdrct.addEventListener('mousedown', (event) => {
        event.preventDefault()
    })
    profileRdrct.addEventListener('click', () => {
        window.location.href = 'profile.html'
    })
    logoutBtn.addEventListener('mousedown', (event) => {
        event.preventDefault()
    })
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await logout(`${apiUrl}/account/logout`)
            if (response.isSuccess) {
                window.location.href = 'index.html'
                return
            }
        }
        catch (err) {
            console.log(err)
        }
    })

    async function refreshData() {
        preloaderBg.style.display = 'block'
        preloader.style.display = 'block'
        setTimeout(async () => {
            try {
                const response = await getProfile(`${apiUrl}/account/profile`)
                if (!response.isSuccess) {
                    window.location.href = 'index.html'
                }
                fullnameInput.value = response.response.fullName
                birthdayInput.value = response.response.birthDate.split('T')[0]
                sexInput.value = response.response.gender
                phoneInput.value = response.response.phoneNumber
                emailInput.value = response.response.email
                userEmailText.innerText = response.response.email
            }
            catch(err) {
                console.log(err)
            }
            finally {
                preloader.style.display = 'none'
                preloaderBg.style.display = 'none'
            }
        }, 500)
    }
})