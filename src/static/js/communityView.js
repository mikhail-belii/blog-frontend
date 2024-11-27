import { apiUrl } from "./constants.js";
import { getCommunity, getProfile, getUsersRole, logout } from "./fetchService.js";
import { View } from "./view.js";

export class CommunityView extends View {
    async getHtml() {
        return `
                <div class="filters">
                    <div class="filters-head">Фильтры</div>

                    <div class="filters__sorting">
                        <label for="sorting-list">Сортировать</label>
                        <select id="sorting-list">
                            <option value="CreateDesc">По дате создания (сначала новые)</option>
                            <option value="CreateAsc">По дате создания (сначала старые)</option>
                            <option value="LikeDesc">По количеству лайков (сначала популярные)</option>
                            <option value="LikeAsc">По количеству лайков (сначала не популярные)</option>
                        </select>
                    </div>

                    <div class="filters__tag-search">
                        <label for="tag-list">Поиск по тегам</label>
                        <select multiple size="3" id="tag-list">

                        </select>
                    </div>

                    <div class="filters__apply-btn">
                        <button type="button" class="apply-filters-btn" id="apply-filters-btn">Применить</button>
                    </div>
                </div>

                <div class="pagination">
                    <div class="pagination__page"></div>
                    <div class="pagination__size">
                        <label for="pageSize">Число постов на странице</label>
                        <select id="pageSize">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="25">25</option>
                        </select>
                    </div>
                </div>
                `
    }

    async runScript(params) {
        const style = document.querySelector('link[rel="stylesheet"]')
        style.href = '/static/css/communities.css'
        const title = document.querySelector('title')
        title.innerText = 'Сообщество'
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
        const mainCont = document.querySelector('.main-container')
        var isAuthorized = false
        const communityId = params.id

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
    
                    await displayPage()
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

        async function displayPage() {
            const mainInfo = document.createElement('div')
            // mainInfo.classList.add('')

            try {
                const response = await getCommunity(`${apiUrl}/community/${communityId}`)
                if (response.isSuccess) {
                    const communityInfo = response.response
                    const communityName = document.createElement('span')
                    // communityName.classList.add('')
                    communityName.innerText = `Группа "${communityInfo.name}"`
                    mainInfo.appendChild(communityName)

                    const response2 = await getUsersRole(`${apiUrl}/community/${communityId}/role`)
                    if (response2.isSuccess) {
                        const communityBtn = document.createElement('div')

                        switch (response2.response) {
                            case null:
                                communityBtn.classList.add('community__subscribe')
                                communityBtn.innerText = 'Подписаться'
                                mainInfo.appendChild(communityBtn)
                                break
                            case 'Subscriber':
                                communityBtn.classList.add('community__unsubscribe')
                                communityBtn.innerText = 'Отписаться'
                                mainInfo.appendChild(communityBtn)
                                break
                            case 'Administrator':
                                const writePostRdrct = document.createElement('div')
                                writePostRdrct.id = 'post'
                                mainInfo.appendChild(writePostRdrct)
                        }
                    }

                    const subscribers = document.createElement('div')
                    const subscribersImg = document.createElement('img')
                    subscribersImg.src = '/static/img/people-icon.svg'
                    subscribers.appendChild(subscribersImg)
                    const subscribersAmount = document.createElement('span')
                    subscribersAmount.innerText = `${communityInfo.subscribersCount} подписчиков`
                    subscribers.appendChild(subscribersAmount)
                    mainInfo.appendChild(subscribers)

                    const communityType = document.createElement('div')
                    communityType.innerText = `Тип сообщества: ${communityInfo.isClosed? 'закрытое': 'открытое'}`
                    mainInfo.appendChild(communityType)

                    const adminsCont = document.createElement('div')
                    const adminsContTitle = document.createElement('div')
                    adminsContTitle.innerText = 'Администраторы'
                    adminsCont.appendChild(adminsContTitle)
                    communityInfo.administrators.forEach(element => {
                        const admin = document.createElement('div')
                        admin.classList.add('admin')
                        const iconCont = document.createElement('div')
                        iconCont.classList.add('admin-container')
                        const authorIcon = document.createElement('img')
                        if (element.gender === 'Male') {
                            authorIcon.src = '/static/img/male-icon.svg'
                        }
                        else {
                            authorIcon.src = '/static/img/female-icon.svg'
                        }
                        iconCont.appendChild(authorIcon)
                        admin.appendChild(iconCont)
                        const adminName = document.createElement('div')
                        adminName.innerText = element.fullName
                        admin.appendChild(adminName)
                        adminsCont.appendChild(admin)
                    });
                    mainInfo.appendChild(adminsCont)

                    mainCont.appendChild(mainInfo)
                }
            }
            catch (err) {
                console.error(err)
            }
        }
    }
}