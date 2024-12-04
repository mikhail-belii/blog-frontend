import dropPopup, { apiUrl } from "./constants.js";
import { createPost, getCommunity, getMyCommunities, getProfile, getTags } from "./fetchService.js";
import { View } from "./view.js";


export class CreatePostView extends View {
    async getHtml() {
        return `
                <div class="write-post-cont">
                    <div class="write-post-cont__title">Написать новый пост</div>
                    <div class="write-post-cont__name">
                        <label for="post__name">Название</label>
                        <input type="text" id="post__name">
                    </div>
                    <div class="write-post-cont__reading-time">
                        <label for="post__reading-time">Время чтения</label>
                        <input type="number" id="post__reading-time">
                    </div>
                    <div class="write-post-cont__community">
                        <label for="post__community">Группа</label>
                        <select id="post__community"></select>
                    </div>
                    <div class="write-post-cont__tag-list">
                        <label for="tag-list">Теги</label>
                        <select multiple size="3" id="post__tag-list"></select>
                    </div>
                    <div class="write-post-cont__image">
                        <label for="post__image">Ссылка на картинку</label>
                        <input type="text" id="post__image">
                    </div>
                    <div class="write-post-cont__content">
                        <label for="post__content">Текст</label>
                        <textarea id="post__content"></textarea>
                    </div>

                    <div class="write-post-cont__address__title">Адрес</div>
                    <div class="write-post-cont__address">
                        <label for="post__address-subject">Субъект РФ</label>
                        <select id="post__address-subject">
                            <option value="">Не выбрано</option>
                        </select>
                    </div>

                    <div class="write-post-cont__create-post">Создать пост</div>
                </div>
                <div id="popup" class="popup">
                    <span class="closePopup">&times;</span>
                    <p id="popupText"></p>
                </div>
                `
    }

    async runScript(params) {
        const title = document.querySelector('title')
        title.innerText = 'Создать пост'

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

        var communityId = params.communityId
        var isAuthorized = false
        const tagList = document.getElementById('post__tag-list')
        const communityList = document.getElementById('post__community')
        const addressContainer = document.querySelector('.write-post-cont__address')
        const subjectSelect = document.getElementById('post__address-subject')
        var objectGuids = []
        var currentObjectGuid = null

        await refreshData()

        const isValidUrl = (str) => {
            try {
              return !!new URL(str);
            }
            catch (_) {
              return false;
            }
        }

        const writePost = document.querySelector('.write-post-cont__create-post')
        writePost.addEventListener('mousedown', (event) => event.preventDefault())
        writePost.addEventListener('click', async () => {
            const title = document.getElementById('post__name').value
            const description = document.getElementById('post__content').value
            const readingTime = document.getElementById('post__reading-time').value
            const image = document.getElementById('post__image').value 
            const selectedTags = Array.from(tagList.selectedOptions).map(option => option.value)
            const community = post__community.value
            let address = null
            if (objectGuids.length > 0) {
                address = objectGuids[objectGuids.length - 1]
            }
            if (title.length < 5 || title.length > 1000) {
                dropPopup('Длина названия не менее 5 и не более 1000 символов')
                return
            }
            if (description.length < 5 || description.length > 5000) {
                dropPopup('Длина текста не менее 5 и не более 5000 символов')
                return
            }
            if (readingTime <= 0 || readingTime > 1000000) {
                dropPopup('Время чтения меньше нуля, или равно ему, или слишком большое')
                return
            }
            if (image !== '' && !isValidUrl(image)) {
                dropPopup('Ссылка на картинку не является корректной ссылкой')
                return
            }
            if (selectedTags.length === 0) {
                dropPopup('Выберите хотя бы 1 тег')
                return
            }
            let postData = {
                title: title,
                description: description,
                readingTime: readingTime,
                image: image !== ''? image: null,
                addressId: address,
                tags: selectedTags
            }
            if (community !== 'null') {
                try {
                    const response = await createPost(`${apiUrl}/community/${community}/post`, JSON.stringify(postData))
                    if (response.isSuccess) {
                        window.history.pushState({}, '', '/')
                        window.router.loadPage('/')
                    }
                    else {
                        console.log(response.response)
                    }
                }
                catch (err) {
                    console.log(err)
                }
            }
            else {
                try {
                    const response = await createPost(`${apiUrl}/post`, JSON.stringify(postData))
                    if (response.isSuccess) {
                        window.history.pushState({}, '', '/')
                        window.router.loadPage('/')
                    }
                    else {
                        console.log(response.response)
                    }
                }
                catch (err) {
                    console.log(err)
                }
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
                        window.history.pushState({}, '', '/')
                        window.router.loadPage('/')
                    }
                    else {
                        loginRdrct.style.display = 'none'
                        userEmail.style.display = 'block'
                        userEmailText.innerText = response.response.email
                        isAuthorized = true
                    }
    
                    await loadData()
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

        async function loadData() {
            try {
                const response = await getTags(`${apiUrl}/tag`)
                if (!response.isSuccess) {
                    return
                }
                const tags = response.response
                tags.forEach(element => {
                    const option = document.createElement('option')
                    option.value = element.id
                    option.innerText = element.name
                    tagList.appendChild(option)
                })
            }
            catch (err) {
                console.log(err)
            }

            try {
                const emptyOption = document.createElement('option')
                emptyOption.value = null
                emptyOption.innerText = 'Без группы'
                communityList.appendChild(emptyOption)
                const response = await getMyCommunities(`${apiUrl}/community/my`)
                if (response.isSuccess) {
                    const communities = response.response
                    communities.forEach(async element => {
                        if (element.role === 'Administrator') {
                            const option = document.createElement('option')
                            option.value = element.communityId
                            const response2 = await getCommunity(`${apiUrl}/community/${element.communityId}`)
                            if (response2.isSuccess) {
                                const community = response2.response
                                option.innerText = community.name
                            }
                            communityList.appendChild(option)
                        }
                    })
                }
            }
            catch (err) {
                console.log(err)
            }

            $(subjectSelect).select2({
                ajax: {
                    url: `${apiUrl}/address/search`,
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        return {
                            query: params.term
                        }
                    },
                    processResults: function (data) {
                        return {
                            results: [{ id: '', text: 'Не выбрано' }, ...data.map(item => ({
                                id: item.objectId,
                                objectGuid: item.objectGuid,
                                text: item.text,
                                objectLevel: item.objectLevel,
                                objectLevelText: item.objectLevelText
                            }))]
                        }
                    },
                    cache: true
                }
            })

            $(subjectSelect).on('select2:select', async function (e) {
                const selectedItem = e.params.data
                await handleAddressSelection(selectedItem, subjectSelect)
            })
        }

        async function handleAddressSelection(selectedItem, currentSelect) {
            const nextLevel = selectedItem.objectLevel
            const nextLevelText = selectedItem.objectLevelText

            updateLabel(currentSelect, nextLevelText)

            if (selectedItem.id === "") {
                const selects = Array.from(addressContainer.querySelectorAll('select'))
                const currentIndex = selects.indexOf(currentSelect)

                if (currentIndex !== -1) {
                    objectGuids.splice(currentIndex)
                }

                let nextSelect = currentSelect.nextElementSibling
        
                const selectsToRemove = [];
                while (nextSelect) {
                    if (nextSelect.tagName === 'SELECT') {
                        selectsToRemove.push(nextSelect)
                    }
                    nextSelect = nextSelect.nextElementSibling
                }

                selectsToRemove.forEach(select => {
                    const label = select.previousElementSibling
                    if (label && label.tagName === 'LABEL') {
                        label.remove()
                    }
                    $(select).select2('destroy')
                    select.remove()
                })
        
                updateLabel(currentSelect, "Следующий элемент адреса")
                return
            }

            const selects = Array.from(addressContainer.querySelectorAll('select'))
            const currentIndex = selects.indexOf(currentSelect)

            if (currentIndex !== -1) {
                objectGuids[currentIndex] = selectedItem.objectGuid
                objectGuids = objectGuids.slice(0, currentIndex + 1)
            }
            else {
                objectGuids.push(selectedItem.objectGuid)
            }
            currentObjectGuid = objectGuids[objectGuids.length - 1]

            if (nextLevel === 'Building') {
                return
            }

            let nextSelect = currentSelect
            while (nextSelect && nextSelect.nextElementSibling) {
                nextSelect = nextSelect.nextElementSibling
                if (nextSelect.tagName === 'SELECT') {
                    break
                }
            }
            if (nextSelect && nextSelect.tagName === 'SELECT') {
                nextSelect.innerHTML = '<option value="">Не выбрано</option>'
            }
            else {
                nextSelect = document.createElement('select')
                nextSelect.innerHTML = '<option value="">Не выбрано</option>'
                const newLabel = document.createElement('label')
                newLabel.setAttribute('for', nextSelect.id)
                newLabel.innerText = 'Следующий элемент адреса'
                addressContainer.appendChild(newLabel)
                addressContainer.appendChild(nextSelect)
            }

            $(nextSelect).select2({
                ajax: {
                    url: `${apiUrl}/address/search`,
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        return {
                            query: params.term,
                            parentObjectId: selectedItem.id
                        }
                    },
                    processResults: function (data) {
                        return {
                            results: [{ id: '', text: 'Не выбрано' }, ...data.map(item => ({
                                id: item.objectId,
                                objectGuid: item.objectGuid,
                                text: item.text,
                                objectLevel: item.objectLevel,
                                objectLevelText: item.objectLevelText
                            }))]
                        }
                    },
                    cache: true
                }
            })

            $(nextSelect).on('select2:select', async function (e) {
                const selectedItem = e.params.data
                await handleAddressSelection(selectedItem, nextSelect)
            })
        }

        function updateLabel(selectElement, labelText) {
            const label = selectElement.previousElementSibling
            if (label && label.tagName === 'LABEL') {
                label.innerText = labelText
            }
        }

        if (communityId) {
            const observer = new MutationObserver(() => {
                const option = communityList.querySelector(`option[value="${communityId}"]`)
                if (option) {
                    option.selected = true
                    observer.disconnect()
                }
            })

            observer.observe(document.body, { childList: true, subtree: true })
        } 
    }
}