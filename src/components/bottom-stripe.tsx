import { useEffect, useState, type MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { menuItems, normalizeMenuRoute, type MenuRoute } from "@/lib/menu-routes";

type BottomStripeProps = {
  route: MenuRoute;
  onNavigate: (route: MenuRoute) => void;
};

export function BottomStripe({ route, onNavigate }: BottomStripeProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setIsDarkTheme(root.classList.contains("dark"));
    };

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    syncTheme();

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, nextRoute: MenuRoute) => {
    event.preventDefault();
    onNavigate(nextRoute);
  };

  const handleThemeToggle = () => {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextIsDark);
    root.style.colorScheme = nextIsDark ? "dark" : "light";
    setIsDarkTheme(nextIsDark);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 p-3 sm:p-5">
      <Card className="pointer-events-auto mx-auto w-full max-w-7xl py-0 backdrop-blur-md">
        <CardContent className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-3">
          <a
            href="/"
            onClick={(event) => handleNavigate(event, "/")}
            className="flex min-w-0 items-center gap-3 justify-self-start"
          >
            <Badge className="grid size-8 shrink-0 place-items-center rounded-md text-xs font-semibold sm:size-9">
              RF
            </Badge>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold">RACER F01</p>
              <p className="text-muted-foreground truncate text-xs">
                Creative Portfolio
              </p>
            </div>
          </a>

          <div className="flex items-center gap-2 justify-self-center">
            <nav>
              <Tabs
                value={route}
                onValueChange={(value) => onNavigate(normalizeMenuRoute(value))}
              >
                <TabsList aria-label="Main navigation">
                  {menuItems.map((item) => (
                    <TabsTrigger key={item.path} value={item.path}>
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </nav>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
              title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
              className="bg-muted/65 hover:bg-muted/65"
              onClick={handleThemeToggle}
            >
              {isDarkTheme ? <Sun /> : <Moon />}
            </Button>
          </div>

          <p className="text-foreground/80 dark:text-muted-foreground justify-self-end text-right text-xs font-medium leading-tight tracking-wide">
            <span className="block">EMBRACE THE</span>
            <span className="block">UNCERTAINTY</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
