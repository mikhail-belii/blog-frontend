import { AuthorsView } from "./authorsView.js"
import { CommunitiesView } from "./communitiesView.js"
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
        '/communities': new CommunitiesView()
    };

    const appContainer = document.getElementById('app')

    async function loadPage(path, queryParams = {}) {
        console.log(`Загрузка страницы: ${path}`)

        const view = routes[path]

        if (!view) {
            window.history.pushState({}, '', '/')
            loadPage('/')
            return
        }

        try {
            appContainer.innerHTML = ''
            appContainer.innerHTML = await view.getHtml();
            if (typeof view.runScript === 'function') {
                await view.runScript(queryParams)
            }
        } catch (error) {
            console.error(`Ошибка загрузки страницы "${path}":`, error)
        }
    }

    const router = { loadPage }
    window.router = router

    const initPath = window.location.pathname
    const initQueryParams = new URLSearchParams(window.location.search)
    loadPage(initPath, Object.fromEntries(initQueryParams.entries()))

    window.addEventListener('popstate', () => {
        const curPath = window.location.pathname
        const curQueryParams = new URLSearchParams(window.location.search)
        loadPage(curPath, Object.fromEntries(curQueryParams.entries()))
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