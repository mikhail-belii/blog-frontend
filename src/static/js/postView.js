import { apiUrl } from "./constants.js";
import { getAddressChain, getPost, getProfile, likePost, logout, unlikePost } from "./fetchService.js";
import { View } from "./view.js";


export class PostView extends View {
    async getHtml() {
        return `
                <div class="post-cont">
                    <div class="post">
                    </div>
                </div>
                `
    }

    async runScript(params) {
        const title = document.querySelector('title')
        title.innerText = 'Пост'

        const homeRdrct = document.getElementById('home')
        const authorsRdrct = document.getElementById('authors')
        const communitiesRdrct = document.getElementById('communities')
        const writePostRdrct = document.getElementById('post')
        const loginRdrct = document.getElementById('login')
        const userEmail = document.querySelector('.user-email')
        const userEmailText = document.querySelector('.user-email-text')
        const logoutBtn = document.querySelector('.logout')
        homeRdrct.style.display = 'block'
        authorsRdrct.style.display = 'block'
        communitiesRdrct.style.display = 'block'
        writePostRdrct.style.display = 'none'

        var postId = params.id
        
        var isAuthorized = false
        const postCont = document.querySelector('.post-cont')
        const $post = document.querySelector('.post')

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
    
                    loadPost()
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

        async function loadPost() {
            try {
                const response = await getPost(`${apiUrl}/post/${postId}`)
                if (response.isSuccess === 403) {
                    $post.innerHTML = '<h1 style="justify-self: center;">Access is forbidden</h1>'
                }
                else if (response.isSuccess === 404) {
                    $post.innerHTML = '<h1 style="justify-self: center;">Post not found</h1>'
                }
                else {
                    const post = response.response
                    
                    const header = document.createElement('div')
                    header.classList.add('post__header')
                    const header_author = document.createElement('span')
                    header_author.classList.add('post__header__author')
                    header_author.innerText = post.author + ' - '
                    const header_datetime = document.createElement('span')
                    header_datetime.classList.add('post__header__datetime')
                    header_datetime.innerText = formatDate(post.createTime) + ' '
                    let header_community = null
                    if (post.communityId !== null) {
                        header_community = document.createElement('span')
                        header_community.classList.add('post__header__community')
                        header_community.innerText = `в сообществе "${post.communityName}"`
                    }
                    header.appendChild(header_author)
                    header.appendChild(header_datetime)
                    if (header_community !== null) {
                        header.appendChild(header_community)
                    }
                    $post.appendChild(header)

                    const title = document.createElement('div')
                    title.classList.add('post__title')
                    title.innerText = post.title
                    $post.appendChild(title)

                    if (post.image !== null) {
                        const image = document.createElement('div')
                        image.classList.add('post__image')
                        const img = document.createElement('img')
                        img.src = post.image
                        image.appendChild(img)
                        $post.appendChild(image)
                    }

                    const description = document.createElement('div')
                    description.classList.add('post__description')
                    description.innerText = post.description
                    $post.appendChild(description)

                    const tags = document.createElement('div')
                    tags.classList.add('post__tags')
                    post.tags.forEach(tag => {
                        const newTag = document.createElement('span')
                        newTag.innerText = `#${tag.name}`
                        tags.appendChild(newTag)
                    });
                    $post.appendChild(tags)

                    const readingTime = document.createElement('div')
                    readingTime.classList.add('post__reading-time')
                    readingTime.innerText = `Время чтения: ${post.readingTime} мин.`
                    $post.appendChild(readingTime)

                    if (post.addressId !== null) {
                        const geo = document.createElement('div')
                        geo.classList.add('post__geo')
                        const geoImg = document.createElement('img')
                        geoImg.src = '/static/img/geo-icon.svg'
                        geo.appendChild(geoImg)
                        try {
                            const response = await getAddressChain(`${apiUrl}/address/chain?objectGuid=${post.addressId}`)
                            if (response.isSuccess) {
                                const addressElements = response.response
                                const $address = document.createElement('span')
                                addressElements.forEach(element => {
                                    $address.innerText += element.text + ', '
                                })
                                $address.innerText = $address.innerText.slice(0, -2)
                                geo.appendChild($address)
                                $post.appendChild(geo)
                            }
                        }
                        catch (err) {
                            console.log(err)
                        }
                    }
                    
                    const postFooter = document.createElement('div')
                    postFooter.classList.add('post__footer')

                    const comments = document.createElement('div')
                    comments.classList.add('post__comments')
                    const commentsCount = document.createElement('span')
                    commentsCount.innerText = post.commentsCount
                    const commentIcon = document.createElement('img')
                    commentIcon.src = '/static/img/comment-icon.svg'
                    comments.appendChild(commentsCount)
                    comments.appendChild(commentIcon)
                    postFooter.appendChild(comments)

                    const likes = document.createElement('div')
                    likes.classList.add('post__likes')
                    const likesCount = document.createElement('span')
                    likesCount.innerText = post.likes
                    const likeIcon = document.createElement('img')
                    if (post.hasLike) {
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
                                    let response = await unlikePost(`${apiUrl}/post/${postId}/like`)
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
                    $post.appendChild(postFooter)
        
                    $post.id = postId
                }
            }
            catch (err) {
                console.log(err)
                $post.innerHTML = '<h1 style="justify-self: center;">Error occured</h1>'
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