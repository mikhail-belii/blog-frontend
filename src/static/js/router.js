import { AuthorsView } from "./authorsView.js"
import { CommunitiesView } from "./communitiesView.js"
import { CommunityView } from "./communityView.js"
import { HomeView } from "./homeView.js"
import { LoginView } from "./loginView.js"
import { ProfileView } from "./profileView.js"
import { RegistrationView } from "./registrationView.js"

export function initRouter() {
    const routes = {
        '/': new HomeView(),
        '/login': new LoginView(),
        '/home': new HomeView(),
        '/profile': new ProfileView(),
        '/registration': new RegistrationView(),
        '/authors': new AuthorsView(),
        '/communities': new CommunitiesView(),
        '/communities/:id': new CommunityView()
    };

    const appContainer = document.getElementById('app')

    async function loadPage(path, queryParams = {}) {
        console.log(`Загрузка страницы: ${path}`)

        let view = null
        let params = {}

        if (routes[path]) {
            view = routes[path];
        }
        else {
            for (const route in routes) {
                const regex = new RegExp(`^${route.replace(/:\w+/g, '([\\w-]+)')}$`)
                const match = path.match(regex)
                if (match) {
                    view = routes[route]
                    params = {id: match[1]}
                    break
                }
            }
        }

        if (!view) {
            window.history.pushState({}, '', '/')
            loadPage('/')
            return
        }

        try {
            appContainer.innerHTML = ''
            appContainer.innerHTML = await view.getHtml();
            if (typeof view.runScript === 'function') {
                await view.runScript({...queryParams, ...params})
            }
        } catch (error) {
            console.error(`Ошибка загрузки страницы "${path}":`, error)
        }
    }

    const router = { loadPage }
    window.router = router

    const initPath = window.location.pathname
    const initQueryParams = new URLSearchParams(window.location.search)
    const queryParams = {}
    for (const [key, value] of initQueryParams.entries()) {
        if (queryParams[key]) {
            if (Array.isArray(queryParams[key])) {
                queryParams[key].push(value)
            }
            else {
                queryParams[key] = [queryParams[key], value]
            }
        }
        else {
            queryParams[key] = value
        }
    }
    
    loadPage(initPath, queryParams)

    window.addEventListener('popstate', () => {
        const curPath = window.location.pathname
        const curQueryParams = new URLSearchParams(window.location.search)
        const queryParams = {}
        for (const [key, value] of curQueryParams.entries()) {
            if (queryParams[key]) {
                if (Array.isArray(queryParams[key])) {
                    queryParams[key].push(value)
                }
                else {
                    queryParams[key] = [queryParams[key], value]
                }
            }
            else {
                queryParams[key] = value
            }
        }
    
        loadPage(curPath, queryParams)
    })

    document.querySelectorAll('div[id]').forEach(link => {
        if (link.id !== 'app') {
            link.addEventListener('click', (event) => {
                event.preventDefault()
                const path = `/${link.id}`
                if (routes[path]) {
                    window.history.pushState({}, '', path)
                    loadPage(path)
                }
                else {
                    console.error(`Нет маршрута для: ${path}`)
                }
            })
        }
    })
}