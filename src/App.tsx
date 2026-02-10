import { CablesPatchBackground } from "@/components/cables-patch-background";
import { BottomStripe } from "@/components/bottom-stripe";
import { useBrowserTheme } from "@/hooks/use-browser-theme";
import { MenuRoutePanel } from "@/components/menu-route-panel";
import { useMenuRoute } from "@/hooks/use-menu-route";
import { cn } from "@/lib/utils";

const cablesPatchDir = import.meta.env.VITE_CABLES_PATCH_DIR ?? "/patch";

export function App() {
  useBrowserTheme();
  const { route, navigate } = useMenuRoute();
  const shouldShowPanel = route !== "/";

  return (
    <div className="relative min-h-screen">
      <CablesPatchBackground patchDir={cablesPatchDir} interactive />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10"
      />
      <main
        className={cn(
          "pointer-events-none fixed inset-0 z-20 flex items-stretch p-3 pb-20 transition-opacity duration-150 sm:p-5 sm:pb-24",
          shouldShowPanel ? "opacity-100" : "opacity-0"
        )}
      >
        <MenuRoutePanel isVisible={shouldShowPanel} route={route} />
      </main>
      <BottomStripe route={route} onNavigate={navigate} />
    </div>
  );
}

export default App;
