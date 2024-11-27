import { View } from "./view.js";
import { apiUrl } from "./constants.js"
import { getPosts, getProfile, getTags, likePost, logout, unlikePost } from "./fetchService.js"

export class HomeView extends View {
    async getHtml() {
        return `
        <button type="button" id="postt">Написать пост</button>

        <div class="filters">
            <div class="filters-head">Фильтры</div>

            <div class="filters__author-name">
                <label for="author-name">Поиск по имени автора</label>
                <input type="text" id="author-name">
            </div>

            <div class="filters__tag-search">
                <label for="tag-list">Поиск по тегам</label>
                <select multiple size="3" id="tag-list">

                </select>
            </div>

            <div class="filters__sorting">
                <label for="sorting-list">Сортировать</label>
                <select id="sorting-list">
                    <option value="CreateDesc">По дате создания (сначала новые)</option>
                    <option value="CreateAsc">По дате создания (сначала старые)</option>
                    <option value="LikeDesc">По количеству лайков (сначала популярные)</option>
                    <option value="LikeAsc">По количеству лайков (сначала не популярные)</option>
                </select>
            </div>

            <div class="filters__min-time">
                <label for="min-time">Время чтения от</label>
                <input type="number" id="min-time">
            </div>

            <div class="filters__max-time">
                <label for="max-time">Время чтения до</label>
                <input type="number" id="max-time">
            </div>

            <div class="filters__only-mine">
                <input type="checkbox" id="only-mine">
                <span>Только мои группы</span>
            </div>

            <div class="filters__apply-btn">
                <button type="button" class="apply-filters-btn" id="apply-filters-btn">Применить</button>
            </div>
        </div>

        <div class="posts">
            
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

    async runScript() {
        const style = document.querySelector('link[rel="stylesheet"]')
        style.href = '/static/css/index.css'
        const title = document.querySelector('title')
        title.innerText = 'Главная'
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

        const writePostBtn = document.getElementById('postt')
        const userEmailText = document.querySelector('.user-email-text')
        const logoutBtn = document.querySelector('.logout')
        

        const tagList = document.getElementById('tag-list')
        const $pageSize = document.getElementById('pageSize')
        const applyFiltersBtn = document.getElementById('apply-filters-btn')
        const authorName = document.getElementById('author-name')
        const sortingList = document.getElementById('sorting-list')
        const minTime = document.getElementById('min-time')
        const maxTime = document.getElementById('max-time')
        const $onlyMine = document.getElementById('only-mine')
        var isAuthorized = false

        const urlParams = new URLSearchParams(window.location.search);
        let curPage = parseInt(urlParams.get('page')) || 1
        let pageSize = parseInt(urlParams.get('size')) || 5
        let listWithTags = urlParams.getAll('tags') || []
        let author = urlParams.get('author') || null
        let sorting = urlParams.get('sorting') || 'CreateDesc'
        let min = parseInt(urlParams.get('min')) || null
        let max = parseInt(urlParams.get('max')) || null
        let onlyMine = urlParams.get('onlyMyCommunities') || false

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

        $pageSize.addEventListener('change', () => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('page', 1);
        newUrl.searchParams.set('size', $pageSize.value);
        window.location.href = newUrl.toString();
        })

        applyFiltersBtn.addEventListener('mousedown', (event) => event.preventDefault())
        applyFiltersBtn.addEventListener('click', async () => {
        if (minTime.value < 0 || minTime.value > 100000 ||
                maxTime.value < 0 || maxTime.value > 100000 || 
                minTime.value > maxTime.value && minTime.value !== '' && maxTime.value !== '') {
            alert('Введите корректное время чтения')
            return
        }

        const newUrl = new URL(window.location.href);
        if (authorName.value === '') {
            newUrl.searchParams.delete('author')
        }
        else {
            newUrl.searchParams.set('author', authorName.value)
        }
        if (minTime.value === '') {
            newUrl.searchParams.delete('min');
        } else {
            newUrl.searchParams.set('min', minTime.value);
        }
        if (maxTime.value === '') {
            newUrl.searchParams.delete('max');
        } else {
            newUrl.searchParams.set('max', maxTime.value);
        }
        newUrl.searchParams.set('sorting', sortingList.value)
        newUrl.searchParams.set('onlyMyCommunities', $onlyMine.checked)

        newUrl.searchParams.delete('tags')
        const selectedTags = Array.from(tagList.selectedOptions).map(option => option.value)
        selectedTags.forEach(tag => newUrl.searchParams.append('tags', tag))

        newUrl.searchParams.set('page', 1)
        window.location.href = newUrl.toString();
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
                    writePostBtn.style.display = 'none'
                    userEmail.style.display = 'none'
                    loginRdrct.style.display = 'block'
                }
                else {
                    loginRdrct.style.display = 'none'
                    userEmail.style.display = 'block'
                    userEmailText.innerText = response.response.email
                    isAuthorized = true
                }

                const response2 = await getTags(`${apiUrl}/tag`)
                if (!response2.isSuccess) {
                    return
                }
                const tags = response2.response
                tags.forEach(element => {
                    const option = document.createElement('option')
                    option.value = element.id
                    option.innerText = element.name
                    tagList.appendChild(option)
                });

                loadPage()
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
                let newUrl = new URL(window.location.href)
                newUrl.searchParams.set('page', curPage - 1)
                window.location.href = newUrl.toString()
            }
        })

        arrowRightBtn.addEventListener('mousedown', (event) => event.preventDefault())
        arrowRightBtn.addEventListener('click', () => {
            if (curPage < pagesAmount) {
                let newUrl = new URL(window.location.href)
                newUrl.searchParams.set('page', curPage + 1)
                window.location.href = newUrl.toString()
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
            window.location.href = newUrl.toString()
        })

        return liEl
        }

        async function loadPage() {
        authorName.value = author
        sortingList.value = sorting
        minTime.value = min
        maxTime.value = max
        $onlyMine.checked = onlyMine == "true"
        $pageSize.value = pageSize

        listWithTags.forEach(tagId => {
            const option = tagList.querySelector(`option[value="${tagId}"]`)
            if (option) {
                option.selected = true
            }
        })

        const response = await getPosts(`${apiUrl}/post${document.location.search}`)
        if (!response.isSuccess) {
            alert(JSON.stringify(response.response.errors))
            return
        }
        const posts = response.response.posts
        const $posts = document.querySelector('.posts') 

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
            let header_community = null
            if (element.communityId !== null) {
                header_community = document.createElement('span')
                header_community.classList.add('post__header__community')
                header_community.innerText = `в сообществе "${element.communityName}"`
            }
            header.appendChild(header_author)
            header.appendChild(header_datetime)
            if (header_community !== null) {
                header.appendChild(header_community)
            }
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

            if (isAuthorized) {
                likeIcon.addEventListener('click', async () => {
                    if (likeIcon.classList.contains('liked')) {
                        try {
                            let response = await unlikePost(`${apiUrl}/post/${element.id}/like`)
                            if (response.isSuccess) {
                                likeIcon.classList.remove('liked')
                                likeIcon.src = '/static/img/empty-like-icon.svg'
                                likesCount.innerText = Number(likesCount.innerText) - 1
                            }
                        }
                        catch (err) {
                            console.log(err)
                        }
                    }
                    else {
                        try {
                            let response = await likePost(`${apiUrl}/post/${element.id}/like`)
                            if (response.isSuccess) {
                                likeIcon.classList.add('liked')
                                likeIcon.src = '/static/img/full-like-icon.svg'
                                likesCount.innerText = Number(likesCount.innerText) + 1

                                likeIcon.classList.add('like-animation')
                                setTimeout(() => {
                                    likeIcon.classList.remove('like-animation')
                                }, 500)
                            }
                        }
                        catch (err) {
                            console.log(err)
                        }
                    }
                })
            }

            likes.appendChild(likesCount)
            likes.appendChild(likeIcon)
            postFooter.appendChild(likes)
            post.appendChild(postFooter)

            post.id = element.id
            $posts.appendChild(post)

            addReadMore(post)
        });

        displayPagination(response.response.pagination.count)
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
    }
}