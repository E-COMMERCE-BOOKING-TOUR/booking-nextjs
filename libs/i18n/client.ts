'use client'

import { useEffect } from 'react'
import i18next from 'i18next'
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { getOptions, languages, cookieName } from './settings'
import Cookies from 'js-cookie'
import enCommon from '../../public/locales/en/common.json'
import viCommon from '../../public/locales/vi/common.json'

const runsOnServerSide = typeof window === 'undefined'

// Initialize i18next
i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language: string, namespace: string) => import(`../../public/locales/${language}/${namespace}.json`)))
    .init({
        ...getOptions(),
        lng: undefined, // let detect language
        resources: {
            en: { common: enCommon },
            vi: { common: viCommon },
        },
        detection: {
            order: ['cookie', 'htmlTag', 'navigator'],
            lookupCookie: cookieName,
            caches: ['cookie'],
        },
        preload: runsOnServerSide ? languages : []
    })

export function useTranslation(lng: string, ns: string = 'common', options: { keyPrefix?: string } = {}) {
    // Pass lng to react-i18next hook to ensure correct language translation
    // independent of global i18next instance state
    const ret = useTranslationOrg(ns, { ...options, lng })
    const { i18n } = ret

    if ((runsOnServerSide && lng && i18n.resolvedLanguage !== lng) || (!runsOnServerSide && lng && i18n.resolvedLanguage !== lng)) {
        if (runsOnServerSide) {
            i18n.changeLanguage(lng)
        }
        // During SSR or Client hydration mismatch, the t function returned by useTranslationOrg might still be using the old language.
        // We override it with a fixed T function for the requested language to ensure hydration matches server.
        return {
            ...ret,
            t: i18n.getFixedT(lng, ns, options.keyPrefix)
        }
    } else {
         

         

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (Cookies.get(cookieName) === lng) return
            Cookies.set(cookieName, lng as string, { path: '/', expires: 365 })
        }, [lng])
    }

    return ret
}
