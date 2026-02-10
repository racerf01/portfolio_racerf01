export type ContentfulEntryResponse = {
  sys: {
    id: string;
    type: string;
    createdAt?: string;
    updatedAt?: string;
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields: Record<string, unknown>;
  [key: string]: unknown;
};

export type ContentfulAssetResponse = {
  sys: {
    id: string;
    type: string;
  };
  fields?: {
    title?: string;
    file?: {
      url?: string;
      contentType?: string;
      fileName?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type ContentfulEntriesResponse = {
  skip: number;
  limit: number;
  total: number;
  items: ContentfulEntryResponse[];
  includes?: {
    Asset?: ContentfulAssetResponse[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function getMissingConfigMessage() {
  return [
    "Missing Contentful configuration.",
    "Set VITE_CONTENTFUL_SPACE_ID and VITE_CONTENTFUL_DELIVERY_TOKEN.",
  ].join(" ");
}

export function hasContentfulBaseConfig() {
  return Boolean(
    import.meta.env.VITE_CONTENTFUL_SPACE_ID &&
      import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN
  );
}

function getContentfulBaseConfig() {
  const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
  const environment = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT ?? "master";
  const accessToken = import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN;

  if (!spaceId || !accessToken) {
    throw new Error(getMissingConfigMessage());
  }

  return { spaceId, environment, accessToken };
}

async function requestContentful<T>(endpoint: URL, accessToken: string): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let details = response.statusText;

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        details = payload.message;
      }
    } catch {
      // Keep status text fallback when response is not JSON.
    }

    throw new Error(`Contentful request failed (${response.status}): ${details}`);
  }

  return (await response.json()) as T;
}

export async function getContentfulEntriesByContentType(
  contentTypeId?: string
): Promise<ContentfulEntriesResponse> {
  const { spaceId, environment, accessToken } = getContentfulBaseConfig();
  const resolvedContentTypeId = contentTypeId;

  if (!resolvedContentTypeId) {
    throw new Error("Missing content type id.");
  }

  const endpoint = new URL(
    `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries`
  );
  endpoint.searchParams.set("content_type", resolvedContentTypeId);
  endpoint.searchParams.set("limit", "10");
  endpoint.searchParams.set("order", "-sys.createdAt");
  endpoint.searchParams.set("include", "2");

  const response = await requestContentful<ContentfulEntriesResponse>(endpoint, accessToken);

  if (import.meta.env.DEV) {
    console.log("[Contentful] Entries response", {
      contentTypeId: resolvedContentTypeId,
      endpoint: endpoint.toString(),
      response,
    });
  }

  return response;
}
