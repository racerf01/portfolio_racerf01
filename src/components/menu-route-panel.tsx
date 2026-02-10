import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type MenuRoute } from "@/lib/menu-routes";
import { cn } from "@/lib/utils";

type MenuRoutePanelProps = {
  isVisible: boolean;
  route: MenuRoute;
};

const workTabs = ["webdev", "design", "photos", "music", "other"] as const;
type WorkTab = (typeof workTabs)[number];
type WorkFilter = "date" | "name";
type SortDirection = "asc" | "desc";

type WorkItem = {
  id: string;
  name: string;
  date: string;
  createdAt: number;
};

type PanelMeta = {
  title: string;
  description: string;
};

function getPanelMeta(route: MenuRoute): PanelMeta {
  switch (route) {
    case "/work":
      return {
        title: "Work",
        description: "Project categories, filters, and sortable placeholders for portfolio content.",
      };
    case "/about":
      return {
        title: "About",
        description: "Background and profile content blocks to describe your process and experience.",
      };
    case "/contact":
      return {
        title: "Contact",
        description: "Contact links, collaboration details, and communication channels.",
      };
    default:
      return {
        title: "Home",
        description: "Overview panel.",
      };
  }
}

function getBaseWorkItems(tab: WorkTab): WorkItem[] {
  return Array.from({ length: 8 }).map((_, index) => {
    const createdAt = Date.UTC(2026, 0, 1 + index * 4);
    const date = new Date(createdAt).toISOString().slice(0, 10);

    return {
      id: `${tab}-${index + 1}`,
      name: `${tab} item ${index + 1}`,
      date,
      createdAt,
    };
  });
}

function sortWorkItems(
  items: WorkItem[],
  filter: WorkFilter,
  direction: SortDirection = "desc"
) {
  const sortedItems = [...items];
  const directionMultiplier = direction === "asc" ? 1 : -1;

  if (filter === "name") {
    sortedItems.sort((a, b) => a.name.localeCompare(b.name) * directionMultiplier);
    return sortedItems;
  }

  if (filter === "date") {
    sortedItems.sort((a, b) => a.date.localeCompare(b.date) * directionMultiplier);
    return sortedItems;
  }

  return sortedItems;
}

function PlaceholderGrid({
  items,
  className,
}: {
  items: WorkItem[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {items.map((item) => (
        <Card key={item.id} className="min-w-40 flex-1 basis-52 py-0">
          <CardContent className="flex h-20 flex-col items-center justify-center gap-1 px-3 py-0">
            <p className="text-foreground text-sm capitalize">{item.name}</p>
            <p className="text-muted-foreground text-xs">{item.date}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WorkRoutePanel() {
  const [activeTab, setActiveTab] = useState<WorkTab>("webdev");
  const [activeFilter, setActiveFilter] = useState<WorkFilter>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const workItemsByTab = useMemo(
    () =>
      workTabs.reduce<Record<WorkTab, WorkItem[]>>((acc, tab) => {
        acc[tab] = sortWorkItems(getBaseWorkItems(tab), activeFilter, sortDirection);
        return acc;
      }, {} as Record<WorkTab, WorkItem[]>),
    [activeFilter, sortDirection]
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as WorkTab)}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="h-auto w-fit justify-start gap-1 overflow-x-auto">
          {workTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Tabs
            value={activeFilter}
            onValueChange={(value) => setActiveFilter(value as WorkFilter)}
            className="gap-0"
          >
            <TabsList aria-label="Work filters" className="h-auto w-fit">
              <TabsTrigger value="date">Date</TabsTrigger>
              <TabsTrigger value="name">Name</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            type="button"
            variant="ghost"
            aria-label={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
            title={sortDirection === "asc" ? "Ascending" : "Descending"}
            className="bg-muted/65 hover:bg-muted/65 data-[size=default]:h-8 data-[size=default]:w-8 rounded-lg p-1"
            onClick={() =>
              setSortDirection((currentDirection) =>
                currentDirection === "asc" ? "desc" : "asc"
              )
            }
          >
            {sortDirection === "asc" ? <ArrowUpNarrowWide /> : <ArrowDownWideNarrow />}
          </Button>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
        {workTabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <PlaceholderGrid items={workItemsByTab[tab]} className="justify-center" />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

function AboutRoutePanel() {
  return <PlaceholderGrid items={sortWorkItems(getBaseWorkItems("design"), "name")} />;
}

function ContactRoutePanel() {
  return <PlaceholderGrid items={sortWorkItems(getBaseWorkItems("music"), "date")} />;
}

function renderRouteContent(route: MenuRoute) {
  switch (route) {
    case "/work":
      return <WorkRoutePanel />;
    case "/about":
      return <AboutRoutePanel />;
    case "/contact":
      return <ContactRoutePanel />;
    default:
      return null;
  }
}

export function MenuRoutePanel({ isVisible, route }: MenuRoutePanelProps) {
  const panelMeta = getPanelMeta(route);

  return (
    <Card
      aria-label="menu panel"
      className={cn(
        "mx-auto h-full min-h-56 w-full max-w-7xl backdrop-blur-md transition-opacity duration-150",
        isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <CardHeader className="border-b pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle>{panelMeta.title}</CardTitle>
          <CardDescription className="sm:max-w-2xl sm:text-right">
            {panelMeta.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 pb-4 pt-4">
        <div className="min-h-0 h-full">
          {renderRouteContent(route)}
        </div>
      </CardContent>
    </Card>
  );
}
