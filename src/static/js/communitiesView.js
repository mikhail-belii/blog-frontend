import { apiUrl } from "./constants.js"
import { getCommunities, getMyCommunities, getProfile, logout, subscribe, unsubscribe } from "./fetchService.js"
import { View } from "./view.js"

export class CommunitiesView extends View {
    async getHtml() {
        return `
                <div class="communities-cont"></div>
                `
    }

    async runScript() {
        const style = document.querySelector('link[rel="stylesheet"]')
        style.href = '/static/css/communities.css'
        const title = document.querySelector('title')
        title.innerText = 'Сообщества'
        const homeRdrct = document.getElementById('home')
        const authorsRdrct = document.getElementById('authors')
        const communitiesRdrct = document.getElementById('communities')
        const writePostRdrct = document.getElementById('post')
        const loginRdrct = document.getElementById('login')
        const userEmail = document.querySelector('.user-email')
        homeRdrct.style.display = 'block'
        authorsRdrct.style.display = 'block'
        communitiesRdrct.style.display = 'block'
        writePostRdrct.style.display = 'none'

        const userEmailText = document.querySelector('.user-email-text')
        const logoutBtn = document.querySelector('.logout')
        const communitiesCont = document.querySelector('.communities-cont')
        var isAuthorized = false

        await refreshData()

        logoutBtn.addEventListener('mousedown', (event) => event.preventDefault())
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await logout(`${apiUrl}/account/logout`)
                if (response.isSuccess) {
                    window.history.pushState({}, '', '/')
                    window.router.loadPage('/')
                    return
                }
            }
            catch (err) {
                console.log(err)
            }
        })

        async function refreshData() {
            const preloader = document.querySelector('.spinner')
            const preloaderBg = document.querySelector('.preloader-bg')
            preloaderBg.style.display = 'flex'
            preloader.style.display = 'block'
            setTimeout(async () => {
                try {
                    const response = await getProfile(`${apiUrl}/account/profile`)
                    if (!response.isSuccess) {
                        userEmail.style.display = 'none'
                        loginRdrct.style.display = 'block'
                    }
                    else {
                        loginRdrct.style.display = 'none'
                        userEmail.style.display = 'block'
                        userEmailText.innerText = response.response.email
                        isAuthorized = true
                    }
    
                    await displayCommunities()
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

        async function displayCommunities() {
            try {
                if (isAuthorized) {
                    const response = await getCommunities(`${apiUrl}/community`)
                    const response2 = await getMyCommunities(`${apiUrl}/community/my`)
                    if (response.isSuccess && response2.isSuccess) {
                        const communities = response.response
                        const myCommunities = response2.response
    
                        communitiesCont.innerHTML = ''
                        communities.forEach(element => {
                            const community = document.createElement('div')
                            community.classList.add('community')
    
                            const communityName = document.createElement('div')
                            communityName.classList.add('community__name')
                            communityName.innerText = element.name
                            community.appendChild(communityName)
    
                            let isHandled = false
                            const communityBtn = document.createElement('div')
                            myCommunities.forEach(myElement => {
                                if (myElement.communityId === element.id) {
                                    switch (myElement.role) {
                                        case 'Subscriber':
                                            communityBtn.classList.add('community__unsubscribe')
                                            communityBtn.innerText = 'Отписаться'
                                            community.appendChild(communityBtn)
                                            isHandled = true
                                            break
                                        case 'Administrator':
                                            isHandled = true
                                            break
                                    }
                                }
                            })
                            if (!isHandled) {
                                communityBtn.classList.add('community__subscribe')
                                communityBtn.innerText = 'Подписаться'
                                community.appendChild(communityBtn)
                            }
                            communityBtn.addEventListener('mousedown', (event) => event.preventDefault())
                            communityBtn.addEventListener('click', async (event) => {
                                event.stopPropagation()
                                if (communityBtn.classList.contains('community__subscribe')) {
                                    try {
                                        const response = await subscribe(`${apiUrl}/community/${element.id}/subscribe`)
                                        if (response.isSuccess) {
                                            communityBtn.classList.remove('community__subscribe')
                                            communityBtn.classList.add('community__unsubscribe')
                                            communityBtn.innerText = 'Отписаться'
                                        }
                                    } catch (err) {
                                        console.log(err)
                                    }
                                } else if (communityBtn.classList.contains('community__unsubscribe')) {
                                    try {
                                        const response = await unsubscribe(`${apiUrl}/community/${element.id}/unsubscribe`)
                                        if (response.isSuccess) {
                                            communityBtn.classList.remove('community__unsubscribe')
                                            communityBtn.classList.add('community__subscribe')
                                            communityBtn.innerText = 'Подписаться'
                                        }
                                    } catch (err) {
                                        console.log(err)
                                    }
                                }
                            })
    
                            community.addEventListener('click', () => {
                                window.history.pushState({}, '', `/communities/${element.id}`)
                                window.router.loadPage(`/communities/${element.id}`)
                            })
    
                            communitiesCont.appendChild(community)
                        })
                    }
                } else {
                    const response = await getCommunities(`${apiUrl}/community`)
                    if (response.isSuccess) {
                        const communities = response.response
    
                        communitiesCont.innerHTML = ''
                        communities.forEach(element => {
                            const community = document.createElement('div')
                            community.classList.add('community')
    
                            const communityName = document.createElement('div')
                            communityName.classList.add('community__name')
                            communityName.innerText = element.name
                            community.appendChild(communityName)
    
                            community.addEventListener('click', () => {
                                window.history.pushState({}, '', `/communities/${element.id}`)
                                window.router.loadPage(`/communities/${element.id}`)
                            })
    
                            communitiesCont.appendChild(community)
                        })
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
    }
}