/** Страница приложения в Google Play (package из mobile/app.json). */
export const LANDING_GOOGLE_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=uz.eduexpo.app2027'

/** Ссылки на страницы приложения в сторах (NEXT_PUBLIC_* подставляются на этапе сборки). */
export function getLandingMobileAppStoreUrls(): { ios: string; android: string } {
  const ios = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL?.trim()
  const android = process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL?.trim()
  return {
    ios: ios || 'https://apps.apple.com/uz/app/edu-expo/id6760607864',
    android: android || LANDING_GOOGLE_PLAY_STORE_URL,
  }
}
