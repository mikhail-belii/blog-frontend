import { apiUrl } from "./constants.js"
import { getAuthors, getProfile, logout } from "./fetchService.js"

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

                displayAuthors()
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

    async function displayAuthors() {
        try {
            const response = await getAuthors(`${apiUrl}/author/list`)
            if (!response.isSuccess) {
                alert('Something went wrong')
            }

            const authors = response.response.slice(0)
            const sortedAuthors = response.response.slice(0)
            authors.sort(compareAlphabetOrder)
            sortedAuthors.sort(compareImportance)

            authors.forEach(element => {
                const author = document.createElement('div')
                author.classList.add('author')

                const authorInfo = document.createElement('div')
                authorInfo.classList.add('author__info')

                const iconCont = document.createElement('div')
                iconCont.classList.add('author__icon-container')
                const authorIcon = document.createElement('img')
                authorIcon.classList.add('author__icon')
                if (element.gender === 'Male') {
                    authorIcon.src = '/static/img/male-icon.svg'
                }
                else {
                    authorIcon.src = '/static/img/female-icon.svg'
                }

                iconCont.appendChild(authorIcon)

                if (element === sortedAuthors[0]) {
                    const goldCrownIcon = document.createElement('img')
                    goldCrownIcon.classList.add('author__icon-crown')
                    goldCrownIcon.src = '/static/img/gold-crown-icon.svg'
                    iconCont.appendChild(goldCrownIcon)
                }
                else if (element === sortedAuthors[1]) {
                    const silverCrownIcon = document.createElement('img')
                    silverCrownIcon.classList.add('author__icon-crown')
                    silverCrownIcon.src = '/static/img/silver-crown-icon.svg'
                    iconCont.appendChild(silverCrownIcon)
                }
                else if (element === sortedAuthors[2]) {
                    const bronzeCrownIcon = document.createElement('img')
                    bronzeCrownIcon.classList.add('author__icon-crown')
                    bronzeCrownIcon.src = '/static/img/bronze-crown-icon.svg'
                    iconCont.appendChild(bronzeCrownIcon)
                }
                
                authorInfo.appendChild(iconCont)

                const iconInfo = document.createElement('div')
                iconInfo.classList.add('author__icon-info')
                const authorHead = document.createElement('div')
                authorHead.classList.add('author__head')
                const authorName = document.createElement('span')
                authorName.classList.add('author__name')
                authorName.innerText = element.fullName
                authorHead.appendChild(authorName)

                const authorCreate = document.createElement('span')
                authorCreate.classList.add('author__create')
                authorCreate.innerText = `Создан: ${formatDate(element.created)}`
                authorHead.appendChild(authorCreate)
                iconInfo.appendChild(authorHead)

                const authorBirthdayContainer = document.createElement('div')
                authorBirthdayContainer.classList.add('author__birthday-container')
                const authorBirthdayLabel = document.createElement('span')
                authorBirthdayLabel.classList.add('author__birthday__label')
                authorBirthdayLabel.innerText = 'Дата рождения: '
                authorBirthdayContainer.appendChild(authorBirthdayLabel)
                const authorBirthdayDate = document.createElement('span')
                if (element.birthDate !== null) {
                    authorBirthdayDate.classList.add('author__birthday__date')
                    authorBirthdayDate.innerText = formatDate(element.birthDate)
                }
                authorBirthdayContainer.appendChild(authorBirthdayDate)
                iconInfo.appendChild(authorBirthdayContainer)
                authorInfo.appendChild(iconInfo)
                author.appendChild(authorInfo)

                const authorAdditionalInfo = document.createElement('div')
                authorAdditionalInfo.classList.add('author__add-info')
                const authorPosts = document.createElement('div')
                authorPosts.classList.add('author__posts')
                authorPosts.innerText = `Постов: ${element.posts}`
                authorAdditionalInfo.appendChild(authorPosts)

                const authorLikes = document.createElement('div')
                authorLikes.classList.add('author__likes')
                authorLikes.innerText = `Лайков: ${element.likes}`
                authorAdditionalInfo.appendChild(authorLikes)

                author.appendChild(authorAdditionalInfo)

                author.addEventListener('click', () => {
                    const rdrctUrl = new URL(window.location.origin)
                    rdrctUrl.pathname = 'index.html'
                    rdrctUrl.searchParams.set('author', element.fullName)
                    window.location.href = rdrctUrl.toString()
                })
                mainCont.appendChild(author)
            });
        }
        catch (err) {
            console.log(err)
        }
    }

    function compareImportance(a, b) {
        if (a.posts > b.posts) {
            return -1
        }
        if (a.posts < b.posts) {
            return 1
        }
        if (a.likes > b.likes) {
            return -1
        }
        if (a.likes < b.likes) {
            return 1
        }
        return 0
    }

    function compareAlphabetOrder(a, b) {
        if (a.fullname > b.fullname) {
            return 1
        }
        if (a.fullname < b.fullname) {
            return -1
        }
        return 0
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        const formatted = `${day}.${month}.${year}`
        return formatted
    }
})