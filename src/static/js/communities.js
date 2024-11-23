import { apiUrl } from "./constants.js"
import { getProfile, logout } from "./fetchService.js"

const preloader = document.querySelector('.spinner')
const preloaderBg = document.querySelector('.preloader-bg')

document.addEventListener('DOMContentLoaded', async () => {
    const userEmail = document.getElementById('user-email')
    const login = document.getElementById('login')
    const userEmailText = document.getElementById('user-email-text')
    const profileRdrct = document.getElementById('profile')
    const logoutBtn = document.getElementById('logout')
    const homeRdrct = document.getElementById('home')
    const mainCont = document.querySelector('.main-container')
    const authorsRdrct = document.getElementById('authors')
    const communitiesRdrct = document.getElementById('communities')

    await refreshData()

    login.addEventListener('click', () => {
        window.location.href = 'login.html'
    })

    homeRdrct.addEventListener('click', () => {
        window.location.href = 'index.html'
    })

    profileRdrct.addEventListener('mousedown', (event) => event.preventDefault())
    profileRdrct.addEventListener('click', () => {
        window.location.href = 'profile.html'
    })
    logoutBtn.addEventListener('mousedown', (event) => event.preventDefault())
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

    authorsRdrct.addEventListener('mousedown', (event) => event.preventDefault())
    authorsRdrct.addEventListener('click', () => {
        window.location.href = 'authors.html'
    })

    communitiesRdrct.addEventListener('mousedown', (event) => event.preventDefault())
    communitiesRdrct.addEventListener('click', () => {
        window.location.href = 'communities.html'
    })

    async function refreshData() {
        preloaderBg.style.display = 'flex'
        preloader.style.display = 'block'
        setTimeout(async () => {
            try {
                const response = await getProfile(`${apiUrl}/account/profile`)
                if (!response.isSuccess) {
                    userEmail.style.display = 'none'
                }
                else {
                    login.style.display = 'none'
                    userEmailText.innerText = response.response.email
                }
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