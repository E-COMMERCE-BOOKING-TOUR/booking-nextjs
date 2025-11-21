interface IInitialFetch {
    BaseURL?: string,
    headers?: object,
    paramsSerializer?: (params: object) => void;
}

const initialFetch: IInitialFetch = {
    BaseURL: process.env.API_BACKEND_CONTAINER ?? process.env.NEXT_PUBLIC_API_BACKEND,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
    },
    paramsSerializer: (params: object) => JSON.stringify(params),
}

interface Option extends RequestInit {
    params?: { [key: string]: string }
    BaseURL?: string
}

const fetchC = {
    get: async (url: string, init?: Option) => {
        const queryString = init?.params ? "?" + new URLSearchParams(init.params).toString() : "";
        const data = await fetch((init?.BaseURL ?? initialFetch.BaseURL) + url + queryString, {
            ...init,
            headers: {
                ...initialFetch.headers,
                ...init?.headers
            },
        });
        const res = await data.json();
        if (!data.ok) {
            throw new Error(res.message || res.data?.msg || "Đã xảy ra lỗi")
        }
        return res;
    },
    post: async (url: string, params?: object, init?: Option) => {
        const data = await fetch((init?.BaseURL ?? initialFetch.BaseURL) + url, {
            ...init,
            method: "POST",
            body: JSON.stringify(params),
            headers: {
                ...initialFetch.headers,
                ...init?.headers
            },
        });
        const res = await data.json();
        if (!data.ok) {
            throw new Error(res.message || res.data?.msg || "Đã xảy ra lỗi")
        }
        return res;
    },
    postFormData: async (url: string, params: FormData, init?: Option) => {
        const data = await fetch((init?.BaseURL ?? initialFetch.BaseURL) + url, {
            ...init,
            method: "POST",
            body: params,
            headers: {
                ...init?.headers
            },
        });
        const res = await data.json();
        if (!data.ok) {
            throw new Error(res.message || res.data?.msg || "Đã xảy ra lỗi")
        }
        return res;
    },
    put: async (url: string, params?: object, init?: RequestInit) => {
        const data = await fetch((initialFetch.BaseURL || "") + url, {
            ...init,
            method: "PUT",
            body: JSON.stringify(params),
            headers: {
                ...initialFetch.headers,
                ...init?.headers
            },
        });
        const res = await data.json();
        if (!data.ok) {
            throw new Error(res.message || res.data?.msg || "Đã xảy ra lỗi")
        }
        return res;
    },
    delete: async (url: string, params?: { [key: string]: string }, init?: RequestInit) => {
        const queryString = params ? "?" + new URLSearchParams(params).toString() : "";
        const data = await fetch((initialFetch.BaseURL || "") + url + queryString, {
            ...init,
            method: "DELETE",
            headers: {
                ...initialFetch.headers,
                ...init?.headers
            },
        });
        const res = await data.json();
        if (!data.ok) {
            throw new Error(res.message || res.data?.msg || "Đã xảy ra lỗi")
        }
        return res;
    }
}

export default fetchC;