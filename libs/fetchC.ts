interface IInitialFetch {
    BaseURL?: string,
    headers?: object,
    paramsSerializer?: (params: object) => void;
}

const initialFetch: IInitialFetch = {
    BaseURL: process.env.API_BACKEND_CONTAINER ?? process.env.NEXT_PUBLIC_API_BACKEND ?? process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
    },
    paramsSerializer: (params: object) => JSON.stringify(params),
}

interface Option extends RequestInit {
    params?: Record<string, string | number | boolean>
    BaseURL?: string
}

const fetchC = {
    get: async (url: string, init?: Option) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryString = init?.params ? "?" + new URLSearchParams(init.params as any).toString() : "";
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
    patch: async (url: string, params?: object, init?: Option) => {
        const data = await fetch((init?.BaseURL ?? initialFetch.BaseURL) + url, {
            ...init,
            method: "PATCH",
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
    delete: async (url: string, init?: Option) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryString = init?.params ? "?" + new URLSearchParams(init.params as any).toString() : "";
        const data = await fetch((init?.BaseURL ?? initialFetch.BaseURL) + url + queryString, {
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