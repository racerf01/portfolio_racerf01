import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/utils";

type CablesPatchOptions = {
  prefixAssetPath?: string;
  jsPath?: string;
  glCanvasId?: string;
  glCanvasResizeToWindow?: boolean;
  canvas?: {
    alpha?: boolean;
    premultipliedAlpha?: boolean;
  };
  patch?: unknown;
  onPatchLoaded?: (patch: unknown) => void;
  onFinishedLoading?: (patch: unknown) => void;
  [key: string]: unknown;
};

type CablesPatchInstance = {
  delete?: () => void;
};

type CablesApi = {
  Patch: new (options: CablesPatchOptions) => CablesPatchInstance;
  exportedPatch?: unknown;
  patch?: CablesPatchInstance;
};

declare global {
  interface Window {
    CABLES?: CablesApi;
  }
}

type CablesPatchBackgroundProps = {
  patchDir?: string;
  canvasId?: string;
  className?: string;
  patchOptions?: CablesPatchOptions;
  interactive?: boolean;
};

function normalizePatchDir(patchDir: string) {
  if (patchDir.endsWith("/")) {
    return patchDir;
  }
  return `${patchDir}/`;
}

export function CablesPatchBackground({
  patchDir = "/patch",
  canvasId = "cables-bg-canvas",
  className,
  patchOptions,
  interactive = false,
}: CablesPatchBackgroundProps) {
  const patchRef = useRef<CablesPatchInstance | null>(null);
  const scriptLoadHandlerRef = useRef<() => void>(() => undefined);
  const scriptErrorHandlerRef = useRef<() => void>(() => undefined);

  const normalizedPatchDir = useMemo(() => normalizePatchDir(patchDir), [patchDir]);

  useEffect(() => {
    const scriptSrc = `${normalizedPatchDir}js/patch.js`;
    let isDisposed = false;

    const initPatch = () => {
      if (isDisposed || patchRef.current) {
        return;
      }

      const cablesApi = window.CABLES;
      if (!cablesApi?.Patch) {
        console.warn("[cables] Patch API not available after script load.");
        return;
      }

      const options: CablesPatchOptions = {
        prefixAssetPath: normalizedPatchDir,
        jsPath: `${normalizedPatchDir}js/`,
        glCanvasId: canvasId,
        glCanvasResizeToWindow: true,
        canvas: { alpha: true, premultipliedAlpha: true },
        ...patchOptions,
      };

      if (!options.patch) {
        options.patch = cablesApi.exportedPatch;
      }

      if (!options.onPatchLoaded) {
        options.onPatchLoaded = () => undefined;
      }

      if (!options.onFinishedLoading) {
        options.onFinishedLoading = () => undefined;
      }

      const patch = new cablesApi.Patch(options);
      cablesApi.patch = patch;
      patchRef.current = patch;
    };

    scriptLoadHandlerRef.current = initPatch;
    scriptErrorHandlerRef.current = () => {
      if (!isDisposed) {
        console.warn(`[cables] Failed to load patch script at "${scriptSrc}".`);
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-cables-script="${scriptSrc}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", scriptLoadHandlerRef.current);
      existingScript.addEventListener("error", scriptErrorHandlerRef.current);

      if (existingScript.dataset.loaded === "true") {
        initPatch();
      }
    } else {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.dataset.cablesScript = scriptSrc;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        initPatch();
      });
      script.addEventListener("error", scriptErrorHandlerRef.current);
      document.body.appendChild(script);
    }

    return () => {
      isDisposed = true;
      const script = document.querySelector<HTMLScriptElement>(
        `script[data-cables-script="${scriptSrc}"]`
      );
      if (script) {
        script.removeEventListener("load", scriptLoadHandlerRef.current);
        script.removeEventListener("error", scriptErrorHandlerRef.current);
      }

      patchRef.current?.delete?.();
      patchRef.current = null;
    };
  }, [canvasId, normalizedPatchDir, patchOptions]);

  return (
    <canvas
      id={canvasId}
      tabIndex={interactive ? 1 : -1}
      aria-hidden={!interactive}
      className={cn(
        "fixed inset-0 h-full w-full",
        interactive ? "z-0 pointer-events-auto" : "-z-10 pointer-events-none",
        className
      )}
    />
  );
}
