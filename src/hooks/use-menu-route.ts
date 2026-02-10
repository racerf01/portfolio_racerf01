import { useCallback, useEffect, useState } from "react";

import { getCurrentMenuRoute, normalizeMenuRoute, type MenuRoute } from "@/lib/menu-routes";

export function useMenuRoute() {
  const [route, setRoute] = useState<MenuRoute>(() => getCurrentMenuRoute());

  useEffect(() => {
    const syncFromLocation = () => {
      const normalizedRoute = normalizeMenuRoute(window.location.pathname);
      if (window.location.pathname !== normalizedRoute) {
        window.history.replaceState({}, "", normalizedRoute);
      }
      setRoute(normalizedRoute);
    };

    window.addEventListener("popstate", syncFromLocation);
    syncFromLocation();

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  const navigate = useCallback((nextRoute: MenuRoute) => {
    if (nextRoute === route) {
      return;
    }

    window.history.pushState({}, "", nextRoute);
    setRoute(nextRoute);
  }, [route]);

  return { route, navigate };
}
