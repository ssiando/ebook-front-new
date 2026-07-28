import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import commonKo from './locales/ko/common.json'
import commonEn from './locales/en/common.json'
import userKo from './locales/ko/user.json'
import userEn from './locales/en/user.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ko',
    supportedLngs: ['ko', 'en'],
    defaultNS: 'common',
    resources: {
      ko: { common: commonKo, user: userKo },
      en: { common: commonEn, user: userEn },
    },
    interpolation: { escapeValue: false },
  })

export default i18n
