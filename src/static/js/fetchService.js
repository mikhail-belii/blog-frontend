import { Response } from "./constants.js"
import { getToken } from "./tokenService.js"

export async function login(url, requestBody) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function register(url, requestBody) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function getProfile(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function editProfile(url, requestBody) {
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${getToken()}`
            },
            body: requestBody
        })

        let resp = new Response()
        resp.isSuccess = false

        if (response.ok) {
            resp.isSuccess = true
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function logout(url) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function getTags(url) {
    try {
        const response = await fetch(url, {
            method: "GET"
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function getPosts(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function likePost(url) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = false

        if (response.ok) {
            resp.isSuccess = true
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function unlikePost(url) {
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = false

        if (response.ok) {
            resp.isSuccess = true
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function getAuthors(url) {
    try {
        const response = await fetch(url, {
            method: "GET"
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function getCommunities(url) {
    try {
        const response = await fetch(url, {
            method: "GET"
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function getMyCommunities(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function subscribe(url) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = false

        if (response.ok) {
            resp.isSuccess = true
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function unsubscribe(url) {
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = false

        if (response.ok) {
            resp.isSuccess = true
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}

export async function getCommunity(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        })

        let resp = new Response()
        resp.isSuccess = true

        if (!response.ok) {
            resp.isSuccess = false
            return resp
        }
    
        const data = await response.json()
        resp.response = data
        return resp
    }
    catch (err) {
        throw err
    }
}