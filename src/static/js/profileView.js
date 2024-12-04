import dropPopup, { apiUrl } from "./constants.js"
import { editProfile, getProfile, logout } from "./fetchService.js"
import { View } from "./view.js"

export class ProfileView extends View {
    async getHtml() {
        return `
                <div class="form-cont">
                    <div class="form-container">
                        <div class="credentials">
                            <label for="email-input"><b>Email</b></label>
                            <input type="text" placeholder="name@example.com" id="email-input" required>

                            <label for="fullname-input"><b>ФИО</b></label>
                            <input type="text" placeholder="Иванов Иван Иванович" id="fullname-input" required>

                            <label for="phone-input"><b>Телефон</b></label>
                            <input type="tel" id="phone-input" placeholder="+7(xxx)xxx-xx-xx" required>

                            <label for="sex-input"><b>Пол</b></label>
                            <select id="sex-input">
                                <option value="Male">Мужской</option>
                                <option value="Female">Женский</option>
                            </select>

                            <label for="birthday-input"><b>Дата рождения</b></label>
                            <input type="date" id="birthday-input" required>
                        </div>
                        <button type="button" id="save-btn">Сохранить</button>
                    </div>
                </div>
                <div id="popup" class="popup">
                    <span class="closePopup">&times;</span>
                    <p id="popupText"></p>
                </div>
                `
    }

    async runScript() {
        const title = document.querySelector('title')
        title.innerText = 'Профиль'

        const fullnameInput = document.getElementById('fullname-input')
        const birthdayInput = document.getElementById('birthday-input')
        const sexInput = document.getElementById('sex-input')
        const phoneInput = document.getElementById('phone-input')
        const emailInput = document.getElementById('email-input')
        const saveBtn = document.getElementById('save-btn')
        const userEmailText = document.querySelector('.user-email-text')
        var mask = IMask(phoneInput, {
            mask: '+7(000)000-00-00'
        })
    
        refreshData()

        const homeRdrct = document.getElementById('home')
        const authorsRdrct = document.getElementById('authors')
        const communitiesRdrct = document.getElementById('communities')
        const writePostRdrct = document.getElementById('post/create')
        const loginRdrct = document.getElementById('login')
        const userEmail = document.querySelector('.user-email')
        homeRdrct.style.display = 'block'
        authorsRdrct.style.display = 'none'
        communitiesRdrct.style.display = 'none'
        loginRdrct.style.display = 'none'
        userEmail.style.display = 'block'
        writePostRdrct.style.display = 'block'
    
        saveBtn.addEventListener('click', async (event) => {
            event.preventDefault()
    
            if (!fullnameInput.value || !birthdayInput.value || !sexInput.value || 
                !phoneInput.value || !emailInput.value) {
                dropPopup('Пожалуйста, заполните все поля')
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
                    dropPopup("Профиль изменён")
                    return
                }
                if (response.response.errors) {
                    dropPopup(JSON.stringify(response.response.errors))
                }
                else {
                    dropPopup(JSON.stringify(response.response))
                }
            }
            catch (err) {
                console.log(err)
            }
            
        })
    
        async function refreshData() {
            const preloader = document.querySelector('.spinner')
            const preloaderBg = document.querySelector('.preloader-bg')
            preloaderBg.style.display = 'block'
            preloader.style.display = 'block'
            setTimeout(async () => {
                try {
                    const response = await getProfile(`${apiUrl}/account/profile`)
                    if (!response.isSuccess) {
                        window.history.pushState({}, '', '/login')
                        window.router.loadPage('/login')
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
    }
}