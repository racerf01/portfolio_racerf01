import { useEffect, useMemo, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, X } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getContentfulEntriesByContentType,
  hasContentfulBaseConfig,
  type ContentfulAssetResponse,
  type ContentfulEntryResponse,
} from "@/lib/contentful";
import { type MenuRoute } from "@/lib/menu-routes";
import { cn } from "@/lib/utils";

type MenuRoutePanelProps = {
  isVisible: boolean;
  route: MenuRoute;
  onClose: () => void;
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
  description?: string;
  imageUrl?: string;
};

const contentTypeIdByTab: Record<WorkTab, string> = {
  webdev: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_WEBDEV ?? "webDevProjects",
  design: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_DESIGN ?? "design-projects",
  photos: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_PHOTOS ?? "photosProjects",
  music: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_MUSIC ?? "musicProjects",
  other: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_OTHER ?? "otherProjects",
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
  const baseDescriptionByTab: Record<WorkTab, string> = {
    webdev: "Implementation details, stack decisions, and architecture notes.",
    design: "Design rationale, system exploration, and visual direction.",
    photos: "Photo project entry.",
    music: "Music project entry.",
    other: "Additional project entry.",
  };

  return Array.from({ length: 8 }).map((_, index) => {
    const createdAt = Date.UTC(2026, 0, 1 + index * 4);
    const date = new Date(createdAt).toISOString().slice(0, 10);

    return {
      id: `${tab}-${index + 1}`,
      name: `${tab} item ${index + 1}`,
      date,
      createdAt,
      description: baseDescriptionByTab[tab],
      imageUrl: `https://avatar.vercel.sh/${encodeURIComponent(`${tab}-${index + 1}`)}.png?size=480`,
    };
  });
}

function normalizeContentfulAssetUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `https://images.ctfassets.net${url}`;
  }

  return url;
}

function buildContentfulAssetMap(
  assets?: ContentfulAssetResponse[]
): Map<string, ContentfulAssetResponse> {
  const assetMap = new Map<string, ContentfulAssetResponse>();
  if (!assets) {
    return assetMap;
  }

  for (const asset of assets) {
    if (asset.sys?.id) {
      assetMap.set(asset.sys.id, asset);
    }
  }

  return assetMap;
}

function collectAssetIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectAssetIds(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const maybeLink = value as {
    sys?: {
      id?: string;
      linkType?: string;
    };
  };

  if (maybeLink.sys?.id && maybeLink.sys.linkType === "Asset") {
    return [maybeLink.sys.id];
  }

  return [];
}

function getContentfulImageUrl(
  fields: Record<string, unknown>,
  assetMap: Map<string, ContentfulAssetResponse>
): string | undefined {
  const candidateFields = [fields.image, fields.images, fields.file, fields.files];

  for (const candidateField of candidateFields) {
    const assetIds = collectAssetIds(candidateField);

    for (const assetId of assetIds) {
      const asset = assetMap.get(assetId);
      const file = asset?.fields?.file;

      if (!file?.url) {
        continue;
      }

      if (file.contentType && !file.contentType.startsWith("image/")) {
        continue;
      }

      return normalizeContentfulAssetUrl(file.url);
    }
  }

  return undefined;
}

function extractContentfulDescription(fields: Record<string, unknown>): string | undefined {
  const shortDescriptions = [fields.description, fields.titleDescription];
  for (const descriptionValue of shortDescriptions) {
    if (typeof descriptionValue === "string" && descriptionValue.trim()) {
      return descriptionValue.trim();
    }
  }

  return undefined;
}

function mapContentfulEntryToWorkItem(
  tab: WorkTab,
  entry: ContentfulEntryResponse,
  index: number,
  assetMap: Map<string, ContentfulAssetResponse>
): WorkItem {
  const titleField = entry.fields.title;
  const nameField = entry.fields.name;
  const dateField = entry.fields.date;

  const name =
    (typeof titleField === "string" && titleField) ||
    (typeof nameField === "string" && nameField) ||
    `${tab} item ${index + 1}`;

  const createdAt = Date.parse(entry.sys.createdAt ?? "") || Date.now();
  const date =
    (typeof dateField === "string" && dateField.slice(0, 10)) ||
    (entry.sys.createdAt ? entry.sys.createdAt.slice(0, 10) : new Date(createdAt).toISOString().slice(0, 10));
  const description = extractContentfulDescription(entry.fields);
  const imageUrl = getContentfulImageUrl(entry.fields, assetMap);

  return {
    id: entry.sys.id || `${tab}-${index + 1}`,
    name,
    date,
    createdAt,
    description,
    imageUrl,
  };
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
  tab,
  className,
}: {
  items: WorkItem[];
  tab: WorkTab;
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <div className={cn("text-muted-foreground rounded-md border p-4 text-xs", className)}>
        No entries found.
      </div>
    );
  }

  if (tab === "webdev" || tab === "design") {
    return (
      <div className={cn("grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {items.map((item) => (
          <Card key={item.id} className="relative h-full w-full pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-gradient-to-t from-background/90 via-background/45 to-black/10 dark:from-black/75 dark:via-black/45 dark:to-black/20" />
            <img
              src={
                item.imageUrl ??
                `https://avatar.vercel.sh/${encodeURIComponent(`${tab}-${item.id}`)}.png?size=480`
              }
              alt={item.name}
              className="relative z-20 aspect-video w-full object-cover brightness-75 grayscale dark:brightness-50"
              loading="lazy"
            />
            <CardHeader className="relative z-40">
              <CardAction>
                <Badge variant="secondary">{item.date}</Badge>
              </CardAction>
              <CardTitle className="text-foreground line-clamp-2">
                {item.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground line-clamp-3">
                {item.description ?? "Project summary will appear here. Rich content is reserved for detailed view."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="relative z-40">
              <Button className="w-full" variant="secondary" type="button">
                View Project
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

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
  const hasContentful = hasContentfulBaseConfig();
  const [activeTab, setActiveTab] = useState<WorkTab>("webdev");
  const [activeFilter, setActiveFilter] = useState<WorkFilter>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [contentfulError, setContentfulError] = useState<string | null>(null);
  const [isContentfulLoading, setIsContentfulLoading] = useState(() => hasContentful);
  const [baseItemsByTab, setBaseItemsByTab] = useState<Record<WorkTab, WorkItem[]>>(
    () =>
      workTabs.reduce<Record<WorkTab, WorkItem[]>>((acc, tab) => {
        acc[tab] = getBaseWorkItems(tab);
        return acc;
      }, {} as Record<WorkTab, WorkItem[]>)
  );

  useEffect(() => {
    if (!hasContentful) {
      if (import.meta.env.DEV) {
        console.warn("[Contentful] Work panel fetch skipped: missing env config", {
          hasSpaceId: Boolean(import.meta.env.VITE_CONTENTFUL_SPACE_ID),
          hasDeliveryToken: Boolean(import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN),
        });
      }
      return;
    }

    let isCancelled = false;

    void Promise.all(
      workTabs.map(async (tab) => {
        const response = await getContentfulEntriesByContentType(contentTypeIdByTab[tab]);
        const assetMap = buildContentfulAssetMap(response.includes?.Asset);
        return [
          tab,
          response.items.map((item, index) => mapContentfulEntryToWorkItem(tab, item, index, assetMap)),
        ] as const;
      })
    )
      .then((results) => {
        if (isCancelled) {
          return;
        }

        setBaseItemsByTab((currentItemsByTab) => {
          const nextItemsByTab = { ...currentItemsByTab };
          for (const [tab, items] of results) {
            nextItemsByTab[tab] = items;
          }

          return nextItemsByTab;
        });
      })
      .catch((error: unknown) => {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Unknown request error.";
          setContentfulError(message);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsContentfulLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [hasContentful]);

  const workItemsByTab = useMemo(
    () =>
      workTabs.reduce<Record<WorkTab, WorkItem[]>>((acc, tab) => {
        acc[tab] = sortWorkItems(baseItemsByTab[tab], activeFilter, sortDirection);
        return acc;
      }, {} as Record<WorkTab, WorkItem[]>),
    [activeFilter, baseItemsByTab, sortDirection]
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
        {!hasContentful && (
          <p className="text-muted-foreground mb-3 text-xs">
            Contentful is disabled. Set <code>VITE_CONTENTFUL_SPACE_ID</code> and{" "}
            <code>VITE_CONTENTFUL_DELIVERY_TOKEN</code> in <code>.env.local</code>, then restart
            the dev server.
          </p>
        )}
        {isContentfulLoading && (
          <p className="text-muted-foreground mb-3 text-xs">Loading Contentful entries...</p>
        )}
        {!isContentfulLoading && contentfulError && (
          <p className="mb-3 text-xs text-red-400">{contentfulError}</p>
        )}
        {workTabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <PlaceholderGrid tab={tab} items={workItemsByTab[tab]} className="justify-center" />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

function AboutRoutePanel() {
  return <PlaceholderGrid tab="design" items={sortWorkItems(getBaseWorkItems("design"), "name")} />;
}

function ContactRoutePanel() {
  return <PlaceholderGrid tab="music" items={sortWorkItems(getBaseWorkItems("music"), "date")} />;
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

export function MenuRoutePanel({ isVisible, route, onClose }: MenuRoutePanelProps) {
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
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex h-8 items-center">
            <CardTitle className="shrink-0 leading-none">{panelMeta.title}</CardTitle>
            <Separator
              orientation="vertical"
              className="mx-3 shrink-0 data-vertical:h-4 data-vertical:self-center"
            />
            <CardDescription className="text-foreground/80 dark:text-muted-foreground min-w-0 truncate text-left leading-none">
              {panelMeta.description}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close panel"
            title="Close panel"
            className="bg-muted/65 hover:bg-muted/65 shrink-0"
            onClick={onClose}
          >
            <X />
          </Button>
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
