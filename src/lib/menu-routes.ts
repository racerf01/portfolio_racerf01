export const menuItems = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
] as const;

export type MenuRoute = (typeof menuItems)[number]["path"];

const MENU_ROUTE_SET = new Set<MenuRoute>(menuItems.map((item) => item.path));

function trimTrailingSlash(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function normalizeMenuRoute(pathname: string): MenuRoute {
  const normalized = trimTrailingSlash(pathname) as MenuRoute;
  if (MENU_ROUTE_SET.has(normalized)) {
    return normalized;
  }

  return "/";
}

export function getCurrentMenuRoute(): MenuRoute {
  if (typeof window === "undefined") {
    return "/";
  }

  return normalizeMenuRoute(window.location.pathname);
}
