import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  X,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from "recharts";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
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
type WorkItemsByTab = Record<WorkTab, WorkItem[]>;
let cachedWorkProjectsByTab: WorkItemsByTab | null = null;
const aboutFocusAreas = [
  "Frontend Architecture",
  "TypeScript + React",
  "Design Systems",
  "Performance",
  "Content Strategy",
];
const aboutQuickFacts = [
  { label: "Location", value: "Based in the US" },
  { label: "Primary Role", value: "Frontend / Full-stack Developer" },
  { label: "Preferred Stack", value: "React, TypeScript, Hono, Supabase" },
  { label: "Current Focus", value: "Portfolio and product quality" },
];
const aboutIdentity = {
  name: "Ilia Poliakman",
  currentPosition: "Frontend / Full-stack Developer",
};
const skillBadgeSets = [
  {
    title: "Frontend Core",
    items: ["TypeScript", "React", "Angular", "Next.js", "Tailwind CSS", "shadcn/ui", "Vite"],
  },
  {
    title: "Backend and Data",
    items: ["Node.js", "Express", "Hono", "PostgreSQL", "Prisma", "Firebase", "Supabase", "REST APIs", "SQL"],
  },
  {
    title: "Quality",
    items: ["Accessibility", "Performance", "SEO", "Responsive UI", "Refactoring", "Testing"],
  },
  {
    title: "Tooling",
    items: ["GitHub Actions", "CI/CD", "ESLint", "Design Tokens", "Story-driven UI", "DX"],
  },
];
const aboutMetrics = [
  { label: "Projects Shipped", value: "18+" },
  { label: "Years Building", value: "5+" },
  { label: "Avg Lighthouse", value: "95+" },
  { label: "Coffee / Day", value: "3 cups" },
];
const geekyInfo = [
  "Terminal-first workflow with tmux + Neovim",
  "Writes reusable UI primitives before page-level polish",
  "Prefers strict TypeScript and typed API contracts",
  "Treats performance budgets as product requirements",
];
const hobbies = [
  "Street and travel photography",
  "Synth and ambient music production",
  "Mechanical keyboard builds",
  "Long bike rides and hiking",
];
const backgroundStory = [
  "I started with visual design and moved into frontend engineering to control both the experience and implementation details.",
  "Over time, my focus shifted toward building resilient UI systems, reducing complexity, and making products easier to maintain.",
  "Today I combine product thinking, interface craftsmanship, and clean architecture to ship work that scales without losing polish.",
];
const journeyPoints = [
  {
    period: "2019",
    title: "Design to Code Transition",
    description: "Moved from static mockups into interactive builds and component-driven development.",
  },
  {
    period: "2021",
    title: "System Thinking",
    description: "Started building shared UI patterns and reusable tokens for consistency across projects.",
  },
  {
    period: "2023",
    title: "Performance and Accessibility",
    description: "Made audit-based optimization and inclusive UX part of the default delivery process.",
  },
  {
    period: "2025",
    title: "Product + Engineering Balance",
    description: "Combined architecture ownership with tighter product iteration and measurable outcomes.",
  },
];
const educationHistory = [
  {
    period: "2023",
    program: "UX and Product Design Certification",
    institution: "Design Institute",
    details: "Studied usability, interaction design, and design-system thinking for product teams.",
  },
  {
    period: "2021",
    program: "Advanced Frontend Specialization",
    institution: "Online Program",
    details: "Deep dive into React architecture, TypeScript, and modern UI patterns.",
  },
  {
    period: "2016 - 2020",
    program: "B.S. in Computer Science",
    institution: "Your University",
    details: "Focused on software engineering, data structures, and web application development.",
  },
];
const webDevCapabilityGraph = [
  {
    label: "Communication",
    detail: "Clear updates, expectation setting, and async collaboration",
    value: 92,
    barClassName: "bg-primary/80",
  },
  {
    label: "Product Thinking",
    detail: "Translating goals into practical, user-first decisions",
    value: 87,
    barClassName: "bg-foreground/78",
  },
  {
    label: "Problem Solving",
    detail: "Breaking down ambiguity into deliverable technical steps",
    value: 90,
    barClassName: "bg-secondary-foreground/78",
  },
  {
    label: "Ownership",
    detail: "End-to-end accountability from implementation to follow-up",
    value: 89,
    barClassName: "bg-accent-foreground/76",
  },
  {
    label: "Team Collaboration",
    detail: "Cross-functional alignment with design and product peers",
    value: 85,
    barClassName: "bg-muted-foreground/85",
  },
];
const myWebDevelopmentPipelineGraph = [
  { key: "discovery", stage: "Discovery", value: 12 },
  { key: "scope", stage: "Scope", value: 9 },
  { key: "proposal", stage: "Proposal", value: 7 },
  { key: "development", stage: "Development", value: 41 },
  { key: "client_review", stage: "Client Review", value: 10 },
  { key: "qa_launch", stage: "QA/Launch", value: 14 },
  { key: "iteration", stage: "Iteration", value: 7 },
];
const myWebDevelopmentPipelineChartConfig = {
  discovery: { label: "Discovery", color: "var(--primary)" },
  scope: { label: "Scope", color: "var(--foreground)" },
  proposal: { label: "Proposal", color: "var(--ring)" },
  development: { label: "Development", color: "var(--secondary-foreground)" },
  client_review: { label: "Client Review", color: "var(--accent-foreground)" },
  qa_launch: { label: "QA/Launch", color: "var(--muted-foreground)" },
  iteration: { label: "Iteration", color: "var(--accent-foreground)" },
} satisfies ChartConfig;
const myWebDevelopmentAdditionalSteps = [
  {
    step: "Content and Asset Prep",
    value: "Per sprint",
  },
  {
    step: "Accessibility Pass",
    value: "Per release",
  },
  {
    step: "SEO and Metadata",
    value: "Before launch",
  },
  {
    step: "Monitoring Setup",
    value: "After launch",
  },
];
const myWebDevelopmentPipelineNotes = [
  {
    label: "Communication",
    value: "Weekly Updates",
    description: "Progress, blockers, and decisions are shared in a predictable weekly rhythm.",
  },
  {
    label: "Delivery Style",
    value: "Incremental",
    description: "Work ships in smaller milestones so clients can review and adjust direction early.",
  },
  {
    label: "Post-Launch",
    value: "Optimization Cycle",
    description: "After launch, feedback and analytics guide focused iteration and polish.",
  },
];
const websiteBuildInfo = {
  summary:
    "This portfolio is built as a component-first SPA with fast iteration in development and optimized production output.",
  stack: [
    "React 19 + TypeScript",
    "Vite",
    "Tailwind CSS v4",
    "shadcn/ui components",
    "Lucide icons",
    "Contentful API integration",
  ],
  architecture: [
    "Route-aware panel layout and reusable UI primitives",
    "Async content fetching with in-memory cache for instant revisit rendering",
    "Design tokens + global theme variables for consistent styling",
  ],
};
const contactMethods = [
  {
    label: "Email",
    value: "your.email@domain.com",
    href: "mailto:your.email@domain.com",
    icon: Mail,
    external: false,
  },
  {
    label: "GitHub",
    value: "github.com/your-handle",
    href: "https://github.com/your-handle",
    icon: Github,
    external: true,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/your-handle",
    href: "https://linkedin.com/in/your-handle",
    icon: Linkedin,
    external: true,
  },
];
const contactAvailability = {
  status: "Open for new projects",
  nextStart: "Next start: within 1-2 weeks",
  timezone: "US Eastern Time (ET)",
  hours: "Mon-Fri, 9:00-18:00",
  responseTime: "24-48 hours",
};

const contentTypeIdByTab: Record<WorkTab, string> = {
  webdev: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_WEBDEV ?? "webDevProjects",
  design: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_DESIGN ?? "design-projects",
  photos: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_PHOTOS ?? "photosProjects",
  music: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_MUSIC ?? "musicProjects",
  other: import.meta.env.VITE_CONTENTFUL_CONTENT_TYPE_OTHER ?? "otherProjects",
};
const panelSectionTitleClass = "text-base leading-snug font-medium";
const panelMetaTextClass = "text-muted-foreground text-xs";
const panelBodyTextClass = "text-muted-foreground text-sm leading-relaxed";
const panelSurfaceClass = "rounded-lg border bg-muted/50 p-3";
const panelInteractiveSurfaceClass =
  "bg-muted/50 hover:bg-muted/65 rounded-lg border transition-colors";
const panelIconButtonClass =
  "bg-muted/65 hover:bg-muted/65 rounded-lg data-[size=default]:h-8 data-[size=default]:w-8 p-1";

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

function getBaseWorkItemsByTab(): WorkItemsByTab {
  return workTabs.reduce<WorkItemsByTab>((acc, tab) => {
    acc[tab] = getBaseWorkItems(tab);
    return acc;
  }, {} as WorkItemsByTab);
}

function getEmptyWorkItemsByTab(): WorkItemsByTab {
  return workTabs.reduce<WorkItemsByTab>((acc, tab) => {
    acc[tab] = [];
    return acc;
  }, {} as WorkItemsByTab);
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

async function fetchWorkProjectsByTab(): Promise<WorkItemsByTab> {
  const workProjectResults = await Promise.all(
    workTabs.map(async (tab) => {
      const response = await getContentfulEntriesByContentType(contentTypeIdByTab[tab]);
      const assetMap = buildContentfulAssetMap(response.includes?.Asset);
      return [
        tab,
        response.items.map((item, index) => mapContentfulEntryToWorkItem(tab, item, index, assetMap)),
      ] as const;
    })
  );

  return workProjectResults.reduce<WorkItemsByTab>((acc, [tab, items]) => {
    acc[tab] = items;
    return acc;
  }, {} as WorkItemsByTab);
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
      <div className={cn("grid pb-4 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
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
  const [isContentfulLoading, setIsContentfulLoading] = useState(
    () => hasContentful && !cachedWorkProjectsByTab
  );
  const [baseItemsByTab, setBaseItemsByTab] = useState<WorkItemsByTab>(
    () => cachedWorkProjectsByTab ?? (hasContentful ? getEmptyWorkItemsByTab() : getBaseWorkItemsByTab())
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
    if (cachedWorkProjectsByTab) {
      setBaseItemsByTab(cachedWorkProjectsByTab);
      setIsContentfulLoading(false);
      return;
    }

    let isCancelled = false;

    const loadWorkProjects = async () => {
      try {
        setContentfulError(null);
        const workProjectsByTab = await fetchWorkProjectsByTab();
        if (!isCancelled) {
          cachedWorkProjectsByTab = workProjectsByTab;
          setBaseItemsByTab(workProjectsByTab);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Unknown request error.";
          setContentfulError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsContentfulLoading(false);
        }
      }
    };

    void loadWorkProjects();

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
            className={panelIconButtonClass}
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
  return (
    <div className="grid pb-4 gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <Card className="h-full">
        <CardHeader>
          <div className="mb-2 space-y-1">
            <p className="text-sm font-medium">{aboutIdentity.name}</p>
            <p className={panelMetaTextClass}>{aboutIdentity.currentPosition}</p>
          </div>
          <CardTitle>Building thoughtful digital products</CardTitle>
          <CardDescription>
            I design and develop personal and client-facing experiences with a focus on clarity,
            performance, and maintainable systems.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          <p className={panelBodyTextClass}>
            I enjoy taking ideas from rough concept to production-ready interfaces. My work
            balances aesthetics with engineering constraints, making sure each decision supports
            real user outcomes.
          </p>
          <div className="space-y-3">
            <p className={panelSectionTitleClass}>Background</p>
            {backgroundStory.map((paragraph) => (
              <p key={paragraph} className={panelBodyTextClass}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {aboutFocusAreas.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
          <Separator />
          <div className="space-y-3">
            <p className={panelSectionTitleClass}>Quick Facts</p>
            <div className="space-y-2">
              {aboutQuickFacts.map((fact) => (
                <div key={fact.label} className={panelSurfaceClass}>
                  <div className="flex items-start justify-between gap-3">
                    <p className={panelMetaTextClass}>{fact.label}</p>
                    <p className="text-right text-sm">{fact.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className={panelSectionTitleClass}>Skills Set</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {skillBadgeSets.map((set) => (
                <div key={set.title} className={panelSurfaceClass}>
                  <p className={cn("mb-2", panelMetaTextClass)}>{set.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {set.items.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <p className={panelSectionTitleClass}>Journey</p>
            <div className="border-border ml-2 space-y-4 border-l pl-4">
              {journeyPoints.map((point) => (
                <div key={point.period + point.title} className="relative">
                  <span className="bg-primary absolute -left-[1.32rem] top-1.5 size-2.5 rounded-full" />
                  <p className={panelMetaTextClass}>{point.period}</p>
                  <p className="text-sm font-medium">{point.title}</p>
                  <p className={panelBodyTextClass}>{point.description}</p>
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <p className={panelSectionTitleClass}>Education</p>
            <div className="space-y-2">
              {educationHistory.map((item) => (
                <div key={item.period + item.program} className={panelSurfaceClass}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{item.program}</p>
                    <Badge variant="outline">{item.period}</Badge>
                  </div>
                  <p className={panelMetaTextClass}>{item.institution}</p>
                  <p className={cn("mt-1", panelBodyTextClass)}>{item.details}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
            <CardDescription>Small numbers, big consistency.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 pb-3">
            {aboutMetrics.map((metric) => (
              <div key={metric.label} className={panelSurfaceClass}>
                <p className="text-lg font-medium leading-none">{metric.value}</p>
                <p className={cn("mt-1", panelMetaTextClass)}>{metric.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>WebDev Capability Graph</CardTitle>
            <CardDescription>Soft-skill strengths that drive project outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-3">
            {webDevCapabilityGraph.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className={panelMetaTextClass}>{item.detail}</p>
                  </div>
                  <p>{item.value}%</p>
                </div>
                <div className="bg-muted h-2 rounded-full">
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      item.barClassName
                    )}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>My Web Development Pipeline</CardTitle>
            <CardDescription>
              Time-share percentages across the full development process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-3">
            <div className={cn(panelSurfaceClass, "p-2")}>
              <ChartContainer config={myWebDevelopmentPipelineChartConfig} className="h-48 w-full">
                <BarChart data={myWebDevelopmentPipelineGraph} margin={{ top: 8, right: 8, left: 8, bottom: 10 }}>
                  <CartesianGrid vertical={false} className="stroke-border/60" />
                  <YAxis hide domain={[0, 100]} />
                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickMargin={6}
                    minTickGap={0}
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground text-xs"
                    tickFormatter={(value: string) =>
                      value.length > 10 ? `${value.slice(0, 9)}.` : value
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      borderRadius: "0.5rem",
                      color: "var(--foreground)",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                    formatter={(value: number) => [`${value}%`, "Time Share"]}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={34}
                    isAnimationActive={false}
                  >
                    {myWebDevelopmentPipelineGraph.map((point) => (
                      <Cell key={point.key} fill={`var(--color-${point.key})`} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(value: number) => `${value}%`}
                      fill="var(--muted-foreground)"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {myWebDevelopmentAdditionalSteps.map((step) => (
                <div key={step.step} className={cn(panelSurfaceClass, "py-2")}>
                  <p className={panelMetaTextClass}>{step.step}</p>
                  <p className="mt-0.5 text-sm font-medium">{step.value}</p>
                </div>
              ))}
            </div>
            <p className={panelBodyTextClass}>
              These percentages show how I typically distribute my time across an end-to-end build.
            </p>
            <Separator />
            <div className="space-y-2">
              <p className={panelSectionTitleClass}>Pipeline Notes</p>
              <div className="space-y-2">
                {myWebDevelopmentPipelineNotes.map((item) => (
                  <div key={item.label} className={panelSurfaceClass}>
                    <div className="flex items-start justify-between gap-3">
                      <p className={panelMetaTextClass}>{item.label}</p>
                      <p className="text-sm">{item.value}</p>
                    </div>
                    <p className={cn("mt-1", panelBodyTextClass)}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>How This Website Was Built</CardTitle>
            <CardDescription>Stack and implementation approach.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-3">
            <p className={panelBodyTextClass}>
              {websiteBuildInfo.summary}
            </p>
            <div className="space-y-2">
              <p className={panelSectionTitleClass}>Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {websiteBuildInfo.stack.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className={panelSectionTitleClass}>Architecture Notes</p>
              <div className="space-y-2">
                {websiteBuildInfo.architecture.map((item) => (
                  <p key={item} className={cn(panelSurfaceClass, panelMetaTextClass)}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Geeky Info and Hobbies</CardTitle>
            <CardDescription>How I spend focused and off-screen time.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pb-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className={panelSectionTitleClass}>Geeky Info</p>
              <div className="space-y-2">
                {geekyInfo.map((item) => (
                  <p key={item} className={cn(panelSurfaceClass, panelMetaTextClass)}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className={panelSectionTitleClass}>Hobbies</p>
              <div className="space-y-2">
                {hobbies.map((item) => (
                  <p key={item} className={cn(panelSurfaceClass, panelMetaTextClass)}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContactRoutePanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Let&apos;s connect</CardTitle>
          <CardDescription>
            Best way to reach me is email. For project inquiries, include your timeline, goals, and
            current status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          <p className={panelSectionTitleClass}>Contact Methods</p>
          <div className="space-y-2">
            {contactMethods.map((method) => {
              const Icon = method.icon;

              return (
                <a
                  key={method.label}
                  href={method.href}
                  target={method.external ? "_blank" : undefined}
                  rel={method.external ? "noreferrer" : undefined}
                  className={cn(
                    panelInteractiveSurfaceClass,
                    "flex items-center justify-between gap-3 p-3"
                  )}
                >
                  <div className="min-w-0">
                    <p className={panelMetaTextClass}>{method.label}</p>
                    <p className="truncate text-sm">{method.value}</p>
                  </div>
                  <div className="text-muted-foreground flex shrink-0 items-center gap-2">
                    <Icon className="size-4" />
                    {method.external && <ExternalLink className="size-3.5" />}
                  </div>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="h-full" size="sm">
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Typical response and collaboration details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-3">
          <div className={cn(panelSurfaceClass, "flex items-center justify-between gap-3")}>
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              <p className="truncate text-sm font-medium">{contactAvailability.status}</p>
            </div>
            <Badge variant="outline" className="shrink-0">
              Active
            </Badge>
          </div>
          <div className={cn(panelSurfaceClass, "flex items-start gap-3")}>
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm">Remote-friendly, US-based</p>
              <p className={panelBodyTextClass}>
                Available for asynchronous communication and scheduled calls.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className={panelSurfaceClass}>
              <p className={panelMetaTextClass}>Timezone</p>
              <p className="text-sm">{contactAvailability.timezone}</p>
            </div>
            <div className={panelSurfaceClass}>
              <p className={panelMetaTextClass}>Working Hours</p>
              <p className="text-sm">{contactAvailability.hours}</p>
            </div>
          </div>
          <div className={panelSurfaceClass}>
            <p className="text-sm">Response time: {contactAvailability.responseTime}</p>
            <p className={panelMetaTextClass}>{contactAvailability.nextStart}</p>
            <p className={panelMetaTextClass}>
              For urgent requests, use email with <code>Urgent</code> in the subject line.
            </p>
          </div>
        </CardContent>
        <CardFooter className="relative z-40">
          <Button className="w-full" variant="secondary" type="button">
            Send an Email
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
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
            className={cn(panelIconButtonClass, "shrink-0")}
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
