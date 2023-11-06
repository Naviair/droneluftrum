import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        lng: "da-DK",
        supportedLngs: ['da-DK', 'en-US'],
        keySeparator: false, //allows the use of '.' and ':' in translations
        nsSeparator: false, //allows the use of '.' and ':' in translations
        fallbackLng: 'da-DK',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;