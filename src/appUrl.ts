/** Absolute URL of the app's main page, including any sub-folder it's hosted under. */
export const appUrl = new URL(import.meta.env.BASE_URL, location.origin).href;
