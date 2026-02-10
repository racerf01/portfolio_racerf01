import type { MouseEvent } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { menuItems, normalizeMenuRoute, type MenuRoute } from "@/lib/menu-routes";

type BottomStripeProps = {
  route: MenuRoute;
  onNavigate: (route: MenuRoute) => void;
};

export function BottomStripe({ route, onNavigate }: BottomStripeProps) {
  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, nextRoute: MenuRoute) => {
    event.preventDefault();
    onNavigate(nextRoute);
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

          <nav className="justify-self-center">
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

          <p className="text-muted-foreground justify-self-end text-right text-xs font-medium leading-tight tracking-wide">
            <span className="block">EMBRACE THE</span>
            <span className="block">UNCERTAINTY</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
