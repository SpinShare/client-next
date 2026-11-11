// Main navigation entries of the Big Picture sidebar
export const BIG_PICTURE_SECTIONS = [
    { to: '/', match: (path) => path === '/', label: 'sidebar.frontpage', icon: 'home-5' },
    { to: '/discover/new/0', match: (path) => path.startsWith('/discover/new/'), label: 'sidebar.newest', icon: 'history' },
    { to: '/discover/updated/0', match: (path) => path.startsWith('/discover/updated/'), label: 'sidebar.updated', icon: 'loop-left' },
    { to: '/discover/hotThisWeek/0', match: (path) => path.startsWith('/discover/hotThisWeek/'), label: 'sidebar.hotThisWeek', icon: 'fire' },
    { to: '/discover/hotThisMonth/0', match: (path) => path.startsWith('/discover/hotThisMonth/'), label: 'sidebar.hotThisMonth', icon: 'calendar-check' },
    { to: '/library', match: (path) => path.startsWith('/library'), label: 'sidebar.library', icon: 'book-shelf' },
];

export const BIG_PICTURE_SETTINGS = { to: '/settings', match: (path) => path.startsWith('/settings'), label: 'sidebar.settings', icon: 'settings-2' };

export function sectionIcon(to) {
    return BIG_PICTURE_SECTIONS.find((section) => section.to === to)?.icon ?? null;
}
