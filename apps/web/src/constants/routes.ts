export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  CAMP_LIST: '/camp-list',
  TEMPLATE: '/template',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  CAMP: {
    NEW: '/camp/new',
    CHECKLIST: (campId: string) => `/camp/${campId}/checklist`,
  },
  INVITE: {
    PAGE: (token: string) => `/invite/${token}`,
    WITH_REDIRECT: (token: string) => `/sign-in?redirect_url=/invite/${token}`,
  },
} as const;
