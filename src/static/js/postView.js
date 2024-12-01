import { apiUrl } from "./constants.js";
import { addComment, deleteComment, editComment, getAddressChain, getCommentChain, getPost, getProfile, likePost, logout, unlikePost } from "./fetchService.js";
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
        const writePostRdrct = document.getElementById('post/create')
        const loginRdrct = document.getElementById('login')
        const userEmail = document.querySelector('.user-email')
        const userEmailText = document.querySelector('.user-email-text')
        homeRdrct.style.display = 'block'
        authorsRdrct.style.display = 'block'
        communitiesRdrct.style.display = 'block'
        writePostRdrct.style.display = 'none'

        var postId = params.id
        
        var isAuthorized = false
        var userId = null
        const postCont = document.querySelector('.post-cont')
        const $post = document.querySelector('.post')

        await refreshData()

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
                        userId = response.response.id
                    }
    
                    await loadPost()
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

                    if (post.comments.length !== 0) {
                        const commentsCont = document.createElement('div')
                        commentsCont.classList.add('post__comments-cont')
                        const commentsContTitle = document.createElement('span')
                        commentsContTitle.classList.add('post__comments-cont__title')
                        commentsContTitle.innerHTML = 'Комментарии'
                        commentsCont.appendChild(commentsContTitle)
                        
                        const commentsList = document.createElement('ul')
                        commentsList.classList.add('post__comments-list')
                        post.comments.forEach(async element => {
                            const $comment = buildComment(element)
                            if (element.subComments > 0) {
                                try {
                                    const response = await getCommentChain(`${apiUrl}/comment/${element.id}/tree`)
                                    if (response.isSuccess) {
                                        const openReplies = document.createElement('div')
                                        openReplies.classList.add('post__comment__open-replies')
                                        openReplies.innerText = 'Раскрыть ответы'
                                        $comment.appendChild(openReplies)
                                        const subcommentsList = document.createElement('ul')
                                        subcommentsList.classList.add('post__subcomments-list')
                                        response.response.forEach(subcomment => {
                                            const $subcomment = buildComment(subcomment)
                                            subcommentsList.appendChild($subcomment)
                                        })
                                        $comment.appendChild(subcommentsList)
                                        openReplies.addEventListener('click', () => {
                                            if (subcommentsList.classList.contains('opened')) {
                                                subcommentsList.style.display = 'none'
                                                subcommentsList.classList.remove('opened')
                                                openReplies.innerText = 'Раскрыть ответы'
                                            }
                                            else {
                                                subcommentsList.style.display = 'flex'
                                                subcommentsList.classList.add('opened')
                                                openReplies.innerText = 'Скрыть ответы'
                                            }
                                        })
                                    }
                                }
                                catch (err) {
                                    console.log(err)
                                }
                            }

                            commentsList.appendChild($comment)
                        })
                        commentsCont.appendChild(commentsList)
                        postCont.appendChild(commentsCont)
                    }

                    if (isAuthorized) {
                        const writeComment = document.createElement('div')
                        writeComment.classList.add('post__write-comment-cont')
                        const writeCommentTitle = document.createElement('span')
                        writeCommentTitle.innerText = 'Оставьте комментарий'
                        writeComment.appendChild(writeCommentTitle)
                        const writeCommentArea = document.createElement('textarea')
                        writeComment.appendChild(writeCommentArea)
                        const sendComment = document.createElement('div')
                        sendComment.innerText = 'Отправить'
                        sendComment.addEventListener('click', async () => {
                            const commentContent = writeCommentArea.value
                            try {
                                const response = await addComment(`${apiUrl}/post/${postId}/comment`, JSON.stringify({
                                    content: commentContent,
                                    parentId: null
                                }))
                                if (response.isSuccess) {
                                    //!!!!!!!!!!!!!
                                    window.router.loadPage(`/post/${postId}`)
                                }
                            }
                            catch (err) {
                                console.log(err)
                            }
                        })
                        writeComment.appendChild(sendComment)
                        postCont.appendChild(writeComment)
                    }
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

        function buildComment(element) {
            const $comment = document.createElement('li')
            $comment.classList.add('post__comment')
            const $commentTitle = document.createElement('div')
            $commentTitle.classList.add('post__comment__title')
            const authorName = document.createElement('span')
            authorName.innerText = element.content !== ''? element.author: '[Комментарий удален]'
            $commentTitle.appendChild(authorName)
            let commentEdit = null
            let commentDelete = null
            let editCont = null
            let replyCont = null
            let $commentFooterReply = null
            if (element.authorId === userId && element.content !== '') {
                commentEdit = document.createElement('img')
                commentEdit.src = '/static/img/pencil-icon.svg'
                $commentTitle.appendChild(commentEdit)
                commentDelete = document.createElement('img')
                commentDelete.src = '/static/img/dustbin-icon.svg'
                $commentTitle.appendChild(commentDelete)
            }
            $comment.appendChild($commentTitle)
            
            const $commentContent = document.createElement('span')
            $commentContent.innerText = element.content !== ''? element.content: '[Комментарий удален]'
            let comment = element.content !== ''? element.content: '[Комментарий удален]'
            if (element.content !== '' && element.modifiedDate !== null) {
                const $commentChanged = document.createElement('span')
                $commentChanged.classList.add('post__comment-changed')
                $commentChanged.innerText = ' (изменен)'
                const $commentChangedInfo = document.createElement('div')
                $commentChangedInfo.classList.add('post__comment-changed__info')
                $commentChangedInfo.innerHTML = `
                                                <div>${formatDate(element.createTime)}</div>
                                                <div>Изменено: ${formatDate(element.modifiedDate)}</div>
                                                `
                $commentChanged.appendChild($commentChangedInfo)
                $commentContent.appendChild($commentChanged)
            }
            $comment.appendChild($commentContent)

            const $commentFooter = document.createElement('div')
            const $commentFooterDate = document.createElement('span')
            $commentFooterDate.innerText = formatDate(element.createTime)
            $commentFooter.appendChild($commentFooterDate)
            if (element.content !== '' && isAuthorized) {
                $commentFooterReply = document.createElement('span')
                $commentFooterReply.classList.add('post__comment__footer-reply')
                $commentFooterReply.innerText = ' Ответить'

                $commentFooter.appendChild($commentFooterReply)
            }
            $comment.appendChild($commentFooter)

            if (commentEdit !== null) {
                commentEdit.addEventListener('click', () => {
                    if (editCont) {
                        editCont.remove()
                        editCont = null
                    }
                    const originalContent = comment
                    const originalCommentChanged = $commentContent.querySelector('.post__comment-changed')

                    editCont = document.createElement('div')
                    editCont.classList.add('post__comment__edit-cont')
                    const editInput = document.createElement('input')
                    editInput.value = comment
                    const cancelEdit = document.createElement('div')
                    cancelEdit.classList.add('post__comment__edit-cont__cancel')
                    cancelEdit.innerText = 'Отменить'
                    cancelEdit.addEventListener('click', () => {
                        editCont.remove()
                        editCont = null
                        $commentContent.innerText = originalContent
                        if (originalCommentChanged) {
                            $commentContent.appendChild(originalCommentChanged)
                        }
                        $commentContent.style.display = 'inline'
                    })
                    const applyEdit = document.createElement('div')
                    applyEdit.classList.add('post__comment__edit-cont__apply')
                    applyEdit.innerText = 'Редактировать'
                    applyEdit.addEventListener('click', async () => {
                        const content = editInput.value
                        try {
                            const response = await editComment(`${apiUrl}/comment/${element.id}`, JSON.stringify({content: content}))
                            if (response.isSuccess) {
                                $commentContent.innerText = content
                                comment = content
                                if (originalCommentChanged) {
                                    originalCommentChanged.remove()
                                }
                                const $commentChanged = document.createElement('span')
                                $commentChanged.classList.add('post__comment-changed')
                                $commentChanged.innerText = ' (изменен)'
                                const $commentChangedInfo = document.createElement('div')
                                $commentChangedInfo.classList.add('post__comment-changed__info')
                                $commentChangedInfo.innerHTML = `
                                    <div>${formatDate(element.createTime)}</div>
                                    <div>Изменено: ${formatDate(new Date())}</div>
                                `
                                $commentChanged.appendChild($commentChangedInfo)
                                $commentContent.appendChild($commentChanged)
                                editCont.remove()
                                editCont = null
                                $commentContent.style.display = 'inline'
                            }
                        }
                        catch (err) {
                            console.log(err)
                        }
                    })
                    editCont.appendChild(editInput)
                    editCont.appendChild(cancelEdit)
                    editCont.appendChild(applyEdit)
                    $comment.insertBefore(editCont, $commentContent.nextSibling)
                    $commentContent.style.display = 'none'
                })
            }

            if (commentDelete !== null) {
                commentDelete.addEventListener('click', async () => {
                    try {
                        const response = await deleteComment(`${apiUrl}/comment/${element.id}`)
                        if (response.isSuccess) {
                            $comment.remove()
                            document.querySelector('.post__comments').querySelector('span').innerText = 
                                parseInt(document.querySelector('.post__comments').querySelector('span').innerText) - 1
                        }
                    }
                    catch (err) {
                        console.log(err)
                    }
                })
            }

            if ($commentFooterReply !== null) {
                $commentFooterReply.addEventListener('click', () => {
                    if (replyCont !== null) {
                        replyCont.remove()
                        replyCont = null
                    }
                    replyCont = document.createElement('div')
                    replyCont.classList.add('post__comment__reply-cont')
                    const replyInput = document.createElement('input')
                    replyInput.placeholder = 'Оставьте комментарий...'
                    const cancelReply = document.createElement('div')
                    cancelReply.classList.add('post__comment__reply-cont__cancel')
                    cancelReply.innerText = 'Отменить'
                    cancelReply.addEventListener('click', () => {
                        replyCont.remove()
                        replyCont = null
                    })
                    const applyReply = document.createElement('div')
                    applyReply.classList.add('post__comment__reply-cont__apply')
                    applyReply.innerText = 'Отправить'
                    applyReply.addEventListener('click', async () => {
                        const replyContent = replyInput.value
                        try {
                            const response = await addComment(`${apiUrl}/post/${postId}/comment`, JSON.stringify({
                                content: replyContent,
                                parentId: element.id
                            }))
                            if (response.isSuccess) {
                                replyCont.remove()
                                replyCont = null
                                //!!!!!!!!!!!!!
                                window.router.loadPage(`/post/${postId}`)
                            }
                        }
                        catch (err) {
                            console.log(err)
                        }
                    })
                    replyCont.appendChild(replyInput)
                    replyCont.appendChild(cancelReply)
                    replyCont.appendChild(applyReply)
                    $comment.appendChild(replyCont)
                }
            )}

            return $comment
        }

        const isScrolled = params.isScrolled
        if (isScrolled) {
            const observer = new MutationObserver(() => {
                const commentsCont = document.querySelector('.post__comments-cont')
                if (commentsCont) {
                    const commentsY = commentsCont.getBoundingClientRect().y
                    window.scrollBy(0, commentsY)
                    observer.disconnect()
                }
            })
        
            observer.observe(document.body, { childList: true, subtree: true })
        }
    }
}