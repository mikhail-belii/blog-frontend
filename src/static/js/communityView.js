import { apiUrl, isUserAuthorized } from "./constants.js";
import { getCommunity, getPosts, getProfile, getTags, getUsersRole, likePost, logout, subscribe, unlikePost, unsubscribe } from "./fetchService.js";
import { View } from "./view.js";

export class CommunityView extends View {
    async getHtml() {
        return ``
    }

    async runScript(params) {
        const title = document.querySelector('title')
        title.innerText = 'Сообщество'
        const homeRdrct = document.getElementById('home')
        const authorsRdrct = document.getElementById('authors')
        const communitiesRdrct = document.getElementById('communities')
        const writePostRdrct = document.getElementById('post/create')
        const loginRdrct = document.getElementById('login')
        const userEmail = document.querySelector('.user-email')
        homeRdrct.style.display = 'block'
        authorsRdrct.style.display = 'block'
        communitiesRdrct.style.display = 'block'
        writePostRdrct.style.display = 'none'

        const userEmailText = document.querySelector('.user-email-text')
        const mainCont = document.querySelector('.main-container')
        var isAuthorized = false
        const communityId = params.id
        let curPage = parseInt(params.page) || 1
        let pageSize = parseInt(params.size) || 5
        let listWithTags = params.tags || []
        if (!Array.isArray(params.tags) && params.tags) {
            listWithTags = [listWithTags]
        }
        let sorting = params.sorting || 'CreateDesc'

        await refreshData()

        async function refreshData() {
            const preloader = document.querySelector('.spinner')
            const preloaderBg = document.querySelector('.preloader-bg')
            preloaderBg.style.display = 'flex'
            preloader.style.display = 'block'
            setTimeout(async () => {
                try {
                    if (!isUserAuthorized()) {
                        userEmail.style.display = 'none'
                        loginRdrct.style.display = 'block'                       
                    }
                    else {
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
                    }

                    await displayPage()
                    await displayQuery()
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
            mainCont.innerHTML = '';
            const mainInfo = document.createElement('div')
            mainInfo.classList.add('main-info')

            try {
                const response = await getCommunity(`${apiUrl}/community/${communityId}`)
                if (response.isSuccess) {
                    const communityInfo = response.response
                    const communityTitle = document.createElement('div')
                    communityTitle.classList.add('main-info__title')
                    const communityName = document.createElement('span')
                    communityName.innerText = `Группа "${communityInfo.name}"`
                    communityTitle.appendChild(communityName)

                    const response2 = await getUsersRole(`${apiUrl}/community/${communityId}/role`)
                    if (response2.isSuccess) {
                        const communityBtn = document.createElement('div')

                        switch (response2.response) {
                            case null:
                                communityBtn.classList.add('community__subscribe')
                                communityBtn.classList.add('subunsub-btn')
                                communityBtn.innerText = 'Подписаться'
                                communityTitle.appendChild(communityBtn)
                                mainInfo.appendChild(communityTitle)
                                break
                            case 'Subscriber':
                                communityBtn.classList.add('community__unsubscribe')
                                communityBtn.classList.add('subunsub-btn')
                                communityBtn.innerText = 'Отписаться'
                                communityTitle.appendChild(communityBtn)
                                mainInfo.appendChild(communityTitle)
                                break
                            case 'Administrator':
                                const writePostRdrct = document.createElement('button')
                                writePostRdrct.classList.add('write-post-btn')
                                writePostRdrct.id = 'post'
                                writePostRdrct.innerText = 'Написать пост'
                                communityTitle.appendChild(writePostRdrct)
                                mainInfo.appendChild(communityTitle)
                                break
                        }
                    }
                    else {
                        mainInfo.appendChild(communityTitle)
                    }

                    const subscribers = document.createElement('div')
                    subscribers.classList.add('subscribers')
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
                    adminsCont.classList.add('main-info__admins')
                    const adminsContTitle = document.createElement('div')
                    adminsContTitle.classList.add('main-info__admins__title')
                    adminsContTitle.innerText = 'Администраторы'
                    adminsCont.appendChild(adminsContTitle)
                    communityInfo.administrators.forEach(element => {
                        const admin = document.createElement('div')
                        admin.classList.add('admin')
                        const iconCont = document.createElement('div')
                        iconCont.classList.add('admin__icon-container')
                        const adminIcon = document.createElement('img')
                        adminIcon.classList.add('admin__icon')
                        if (element.gender === 'Male') {
                            adminIcon.src = '/static/img/male-icon.svg'
                        }
                        else {
                            adminIcon.src = '/static/img/female-icon.svg'
                        }
                        iconCont.appendChild(adminIcon)
                        admin.appendChild(iconCont)
                        const adminName = document.createElement('div')
                        adminName.classList.add('admin__name')
                        adminName.innerText = element.fullName
                        admin.appendChild(adminName)
                        adminsCont.appendChild(admin)
                    });
                    mainInfo.appendChild(adminsCont)

                    mainCont.appendChild(mainInfo)

                    mainCont.innerHTML += `<div class="filters-min">
                                           <div class="filters-min__head">Фильтры</div>

                                            <div class="filters-min__sorting">
                                                <label for="sorting-list">Сортировать</label>
                                                <select id="sorting-list">
                                                    <option value="CreateDesc">По дате создания (сначала новые)</option>
                                                    <option value="CreateAsc">По дате создания (сначала старые)</option>
                                                    <option value="LikeDesc">По количеству лайков (сначала популярные)</option>
                                                    <option value="LikeAsc">По количеству лайков (сначала не популярные)</option>
                                                </select>
                                            </div>

                                            <div class="filters-min__tag-search">
                                                <label for="tag-list">Поиск по тегам</label>
                                                <select multiple size="3" id="tag-list">

                                                </select>
                                            </div>

                                            <div class="filters-min__apply-btn">
                                                <button type="button" id="apply-filters-btn">Применить</button>
                                            </div>
                                            </div>
                                            `


                    const tagList = document.getElementById('tag-list')
                    const response3 = await getTags(`${apiUrl}/tag`)
                    if (!response3.isSuccess) {
                        return
                    }
                    const tags = response3.response
                    tags.forEach(element => {
                        const option = document.createElement('option')
                        option.value = element.id
                        option.innerText = element.name
                        tagList.appendChild(option)
                    });

                    if (communityInfo.isClosed && response2.response !== null || !communityInfo.isClosed) {

                
                        const response = await getPosts(`${apiUrl}/community/${communityId}/post${document.location.search}`)
                        if (!response.isSuccess) {
                            mainCont.innerHTML += `<h1>Вы не имеете доступа к постам этого сообщества</h1>`
                            return
                        }
                        const posts = response.response.posts
                        const $posts = document.createElement('div')
                        $posts.classList.add('posts') 
                
                        posts.forEach(element => {
                            const post = document.createElement('div')
                            post.classList.add('post')
                            const header = document.createElement('div')
                            header.classList.add('post__header')
                            const header_author = document.createElement('span')
                            header_author.classList.add('post__header__author')
                            header_author.innerText = element.author + ' - '
                            const header_datetime = document.createElement('span')
                            header_datetime.classList.add('post__header__datetime')
                            header_datetime.innerText = formatDate(element.createTime) + ' '
                            header.appendChild(header_author)
                            header.appendChild(header_datetime)

                            post.appendChild(header)
                
                            const title = document.createElement('div')
                            title.classList.add('post__title')
                            title.innerText = element.title
                            post.appendChild(title)
                
                            if (element.image !== null) {
                                const image = document.createElement('div')
                                image.classList.add('post__image')
                                const img = document.createElement('img')
                                img.src = element.image
                                image.appendChild(img)
                                post.appendChild(image)
                            }
                
                            const description = document.createElement('div')
                            description.classList.add('post__description')
                            description.innerText = element.description
                            post.appendChild(description)
                
                            const tags = document.createElement('div')
                            tags.classList.add('post__tags')
                            element.tags.forEach(tag => {
                                const newTag = document.createElement('span')
                                newTag.innerText = `#${tag.name}`
                                tags.appendChild(newTag)
                            });
                            post.appendChild(tags)
                
                            const readingTime = document.createElement('div')
                            readingTime.classList.add('post__reading-time')
                            readingTime.innerText = `Время чтения: ${element.readingTime} мин.`
                            post.appendChild(readingTime)
                
                            const postFooter = document.createElement('div')
                            postFooter.classList.add('post__footer')
                
                            const comments = document.createElement('div')
                            comments.classList.add('post__comments')
                            const commentsCount = document.createElement('span')
                            commentsCount.innerText = element.commentsCount
                            const commentIcon = document.createElement('img')
                            commentIcon.src = '/static/img/comment-icon.svg'
                            comments.appendChild(commentsCount)
                            comments.appendChild(commentIcon)
                            postFooter.appendChild(comments)
                
                            const likes = document.createElement('div')
                            likes.classList.add('post__likes')
                            const likesCount = document.createElement('span')
                            likesCount.innerText = element.likes
                            const likeIcon = document.createElement('img')
                            if (element.hasLike) {
                                likeIcon.src = '/static/img/full-like-icon.svg'
                                likeIcon.classList.add('liked')
                            }
                            else {
                                likeIcon.src = '/static/img/empty-like-icon.svg'
                            }
                
                            likes.appendChild(likesCount)
                            likes.appendChild(likeIcon)
                            postFooter.appendChild(likes)
                            post.appendChild(postFooter)
                
                            post.id = element.id
                            $posts.appendChild(post)
            
                        })
                        mainCont.appendChild($posts)

                        mainCont.innerHTML += `
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

                        displayPagination(response.response.pagination.count)

                        const likeIcons = document.querySelectorAll('.post__likes img')
                        likeIcons.forEach(likeIcon => {
                            likeIcon.addEventListener('click', async () => {
                                if (isAuthorized) {
                                    const post = likeIcon.closest('.post')
                                    const postId = post.id
                                    const likesCount = post.querySelector('.post__likes span')

                                    if (likeIcon.classList.contains('liked')) {
                                        try {
                                            let response = await unlikePost(`${apiUrl}/post/${postId}/like`)
                                            if (response.isSuccess) {
                                                likeIcon.classList.remove('liked')
                                                likeIcon.src = '/static/img/empty-like-icon.svg'
                                                likesCount.innerText = Number(likesCount.innerText) - 1
                                            }
                                        } catch (err) {
                                            console.log(err)
                                        }
                                    } else {
                                        try {
                                            let response = await likePost(`${apiUrl}/post/${postId}/like`)
                                            if (response.isSuccess) {
                                                likeIcon.classList.add('liked')
                                                likeIcon.src = '/static/img/full-like-icon.svg'
                                                likesCount.innerText = Number(likesCount.innerText) + 1

                                                likeIcon.classList.add('like-animation')
                                                setTimeout(() => {
                                                    likeIcon.classList.remove('like-animation')
                                                }, 500)
                                            }
                                        } catch (err) {
                                            console.log(err)
                                        }
                                    }
                                }
                            });
                        });

                        const posts2 = document.querySelectorAll('.post')
                        posts2.forEach(post => {
                            addReadMore(post)
                        })

                        const applyFiltersBtn = document.getElementById('apply-filters-btn')
                        const sortingList = document.getElementById('sorting-list')
                        const tagList = document.getElementById('tag-list')
                        applyFiltersBtn.addEventListener('mousedown', (event) => event.preventDefault())
                        applyFiltersBtn.addEventListener('click', async () => {
                        const newUrl = new URL(window.location.href);

                        newUrl.searchParams.set('sorting', sortingList.value)
                
                        newUrl.searchParams.delete('tags')
                        const selectedTags = Array.from(tagList.selectedOptions).map(option => option.value)
                        selectedTags.forEach(tag => newUrl.searchParams.append('tags', tag))
                
                        newUrl.searchParams.set('page', 1)
                        window.history.pushState({}, '', newUrl.toString())
                        window.router.loadPage(window.location.pathname, {
                            page: 1,
                            size: pageSize,
                            sorting: sortingList.value,
                            tags: selectedTags
                        })
                        })
                    }

                    const subunsubBtn = document.querySelector('.subunsub-btn')
                    if (subunsubBtn) {
                        subunsubBtn.addEventListener('mousedown', (event) => event.preventDefault())
                        subunsubBtn.addEventListener('click', async () => {
                            if (subunsubBtn.classList.contains('community__subscribe')) {
                                try {
                                    const response = await subscribe(`${apiUrl}/community/${communityId}/subscribe`)
                                    if (response.isSuccess) {
                                        subunsubBtn.classList.remove('community__subscribe')
                                        subunsubBtn.classList.add('community__unsubscribe')
                                        subunsubBtn.innerText = 'Отписаться'
                                    }
                                } 
                                catch (err) {
                                    console.log(err)
                                }
                            } 
                            else if (subunsubBtn.classList.contains('community__unsubscribe')) {
                                try {
                                    const response = await unsubscribe(`${apiUrl}/community/${communityId}/unsubscribe`)
                                    if (response.isSuccess) {
                                        subunsubBtn.classList.remove('community__unsubscribe')
                                        subunsubBtn.classList.add('community__subscribe')
                                        subunsubBtn.innerText = 'Подписаться'
                                    }
                                } 
                                catch (err) {
                                    console.log(err)
                                }
                            }
                        })
                    }

                    document.querySelectorAll('.post__title').forEach(element => {
                        element.addEventListener('click', () => {
                            const parentDiv = element.closest('div[id]')
                            if (parentDiv) {
                                window.history.pushState({}, '', `/post/${parentDiv.id}`)
                                window.router.loadPage(`/post/${parentDiv.id}`)
                            }
                        })
                    })
            
                    document.querySelectorAll('.post__comments').forEach(element => {
                        element.addEventListener('click', () => {
                            const commentsAmount = element.firstElementChild.textContent
                            const parentDiv = element.closest('div[id]')
                            if (parentDiv) {
                                window.history.pushState({}, '', `/post/${parentDiv.id}`)
                                window.router.loadPage(`/post/${parentDiv.id}`, {isScrolled: commentsAmount > 0})
                            }
                        })
                    })
                }
            }
            catch (err) {
                console.error(err)
            }
        }

        function addReadMore(post) {
            const description = post.querySelector('.post__description')
            const maxLength = 300
    
            if (description.innerText.length > maxLength) {
                const shortText = description.innerText.substring(0, maxLength) + '...'
                const fullText = description.innerText
    
                description.innerText = shortText
    
                const readMoreButton = document.createElement('span')
                readMoreButton.classList.add('read-more-btn')
                readMoreButton.innerText = 'Читать полностью'
    
                readMoreButton.addEventListener('click', () => {
                    if (description.innerText === shortText) {
                        description.innerText = fullText
                        readMoreButton.innerText = 'Скрыть'
                    }
                    else {
                        description.innerText = shortText
                        readMoreButton.innerText = 'Читать полностью'
                    }
                });
    
                description.insertAdjacentElement('afterend', readMoreButton)
            }
        }

        function formatDate(dateStr) {
            const date = new Date(dateStr)
            const day = date.getDate().toString().padStart(2, '0')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const year = date.getFullYear()
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            const formatted = `${day}.${month}.${year} ${hours}:${minutes}`
            return formatted
        }

        function displayPagination(pagesAmount) {
            const pagination = document.querySelector(".pagination__page")
            const ulEl = document.createElement("ul")
            ulEl.classList.add("pagination__list")
    
            const arrowLeft = document.createElement('li')
            arrowLeft.innerHTML = '&laquo;'
            arrowLeft.classList.add("pagination__item")
            arrowLeft.id = 'arrow-left'
            ulEl.appendChild(arrowLeft)
    
            const maxVisiblePages = 10
            const halfMaxVisiblePages = Math.floor(maxVisiblePages / 2)
    
            let startPage, endPage
    
            if (pagesAmount <= maxVisiblePages) {
                startPage = 1
                endPage = pagesAmount
            }
            else {
                if (curPage <= halfMaxVisiblePages + 1) {
                    startPage = 1
                    endPage = maxVisiblePages - 1
                }
                else if (curPage >= pagesAmount - halfMaxVisiblePages) {
                    startPage = pagesAmount - maxVisiblePages + 2
                    endPage = pagesAmount
                }
                else {
                    startPage = curPage - halfMaxVisiblePages
                    endPage = curPage + halfMaxVisiblePages
                }
            }
    
            if (startPage > 1) {
                const firstPage = displayPaginationButton(1)
                ulEl.appendChild(firstPage)
    
                const ellipsisStart = document.createElement('li')
                ellipsisStart.innerHTML = '...'
                ellipsisStart.classList.add("pagination__item")
                ulEl.appendChild(ellipsisStart)
            }
    
            for (let i = startPage; i <= endPage; i++) {
                const liEl = displayPaginationButton(i)
                ulEl.appendChild(liEl)
            }
    
            if (pagesAmount > maxVisiblePages && endPage < pagesAmount) {
                const ellipsisEnd = document.createElement('li')
                ellipsisEnd.innerHTML = '...'
                ellipsisEnd.classList.add("pagination__item")
                ulEl.appendChild(ellipsisEnd)
    
                const lastPage = displayPaginationButton(pagesAmount)
                ulEl.appendChild(lastPage)
            }
    
            const arrowRight = document.createElement('li')
            arrowRight.innerHTML = '&raquo;'
            arrowRight.classList.add("pagination__item")
            arrowRight.id = 'arrow-right'
            ulEl.appendChild(arrowRight)
    
            pagination.appendChild(ulEl)
    
            const arrowLeftBtn = document.getElementById('arrow-left')
            const arrowRightBtn = document.getElementById('arrow-right')
    
            arrowLeftBtn.addEventListener('mousedown', (event) => event.preventDefault())
            arrowLeftBtn.addEventListener('click', () => {
                if (curPage > 1) {
                    const newUrl = new URL(window.location.href)
                    newUrl.searchParams.set('page', curPage - 1)
                    window.history.pushState({}, '', newUrl.toString())
                    window.router.loadPage(window.location.pathname, {
                        page: curPage - 1,
                        size: pageSize,
                        tags: listWithTags,
                        sorting: sorting
                    })
                }
            })
    
            arrowRightBtn.addEventListener('mousedown', (event) => event.preventDefault())
            arrowRightBtn.addEventListener('click', () => {
                if (curPage < pagesAmount) {
                    const newUrl = new URL(window.location.href)
                    newUrl.searchParams.set('page', curPage + 1)
                    window.history.pushState({}, '', newUrl.toString())
                    window.router.loadPage(window.location.pathname, {
                        page: parseInt(curPage) + 1,
                        size: pageSize,
                        tags: listWithTags,
                        sorting: sorting
                    })
                }
            })
        }

        function displayPaginationButton(pageNumber) {
            const liEl = document.createElement("li")
            liEl.classList.add("pagination__item")
            liEl.innerText = pageNumber
    
            if (curPage == pageNumber) {
                liEl.classList.add('pagination__item-active')
            }
    
            liEl.addEventListener('click', () => {
                const newUrl = new URL(window.location.href)
                newUrl.searchParams.set('page', pageNumber)
                window.history.pushState({}, '', newUrl.toString())
                window.router.loadPage(window.location.pathname, {
                    page: pageNumber,
                    size: pageSize,
                    tags: listWithTags,
                    sorting: sorting
                })
            })
    
            return liEl
        }

        async function displayQuery() {
            const tagList = document.getElementById('tag-list')
            if (tagList) {
                listWithTags.forEach(tagId => {
                    const option = tagList.querySelector(`option[value="${tagId}"]`)
                    if (option) {
                        option.selected = true
                    }
                })
            }

            const $pageSize = document.getElementById('pageSize')
            if ($pageSize) {
                $pageSize.value = pageSize
                $pageSize.addEventListener('change', () => {
                    const newUrl = new URL(window.location.href)
                    newUrl.searchParams.set('page', 1)
                    newUrl.searchParams.set('size', $pageSize.value)
                    window.history.pushState({}, '', newUrl.toString())
                    window.router.loadPage(window.location.pathname, {
                        page: 1,
                        size: $pageSize.value,
                        tags: listWithTags,
                        sorting: sorting
                    })
                })
            }

            const sortingList = document.getElementById('sorting-list')
            if (sortingList) {
                sortingList.value = sorting
            }
        }


        const observer = new MutationObserver(() => {
            const writePostBtn = document.querySelector('.write-post-btn')
            if (writePostBtn) {
                writePostBtn.addEventListener('mousedown', (event) => event.preventDefault())
                writePostBtn.addEventListener('click', () => {
                    window.history.pushState({}, '', '/post/create')
                    window.router.loadPage('/post/create', {communityId: communityId})
                    observer.disconnect()
                })
            }
        })
        observer.observe(document.body, { childList: true, subtree: true })
    }
}