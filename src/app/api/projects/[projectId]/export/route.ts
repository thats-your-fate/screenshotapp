import { NextResponse } from "next/server";
import type { ExportFormat } from "@prisma/client";

import { getCurrentApiUser } from "@/features/auth/server-api";
import { createProjectExport } from "@/features/exports/service";
import { getProjectForUserEditor } from "@/features/projects/service";
import { storePublicFile } from "@/lib/storage/local-storage";

export const runtime = "nodejs";

type ExportRequestBody = {
  screenId?: string;
  label?: string;
  format?: "PNG" | "JPG" | "WEBP";
  scale?: number;
  quality?: number;
};

function getBaseUrl(request: Request) {
  const envUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  let browser: import("puppeteer").Browser | null = null;

  try {
    const user = await getCurrentApiUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { projectId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as ExportRequestBody;
    if (!body.screenId || typeof body.screenId !== "string") {
      return NextResponse.json({ error: "Missing screenId." }, { status: 400 });
    }

    const editorData = await getProjectForUserEditor(user.id, projectId);
    if (!editorData) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const screen = editorData.screens.find((item) => item.id === body.screenId);
    if (!screen) {
      return NextResponse.json({ error: "Screen not found." }, { status: 404 });
    }

    const format: ExportFormat =
      body.format === "JPG" || body.format === "WEBP" || body.format === "PNG" ? body.format : "PNG";
    const quality = Math.max(1, Math.min(100, Math.round(Number(body.quality ?? 82))));

    const puppeteer = await import("puppeteer");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: Math.max(screen.canvas.width + 300, 1400),
      height: Math.max(screen.canvas.height + 300, 1200),
      deviceScaleFactor: 1,
    });

    const cookie = request.headers.get("cookie");
    if (cookie) {
      await page.setExtraHTTPHeaders({ cookie });
    }

    const baseUrl = getBaseUrl(request);
    const targetUrl = `${baseUrl}/app/projects/${projectId}/editor?exportMode=1&screenId=${encodeURIComponent(screen.id)}`;
    await page.goto(targetUrl, {
      waitUntil: "networkidle0",
      timeout: 90000,
    });

    await page.waitForSelector(`#editor-canvas-root-${screen.id}`, { timeout: 30000 });
    await page.evaluate(async () => {
      if ("fonts" in document) {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      }
    });

    const target = await page.$(`#editor-canvas-root-${screen.id}`);
    if (!target) {
      throw new Error("Export canvas node not found.");
    }

    const box = await target.boundingBox();
    if (!box) {
      throw new Error("Export canvas bounds not found.");
    }

    const screenshotType = format === "JPG" ? "jpeg" : format === "WEBP" ? "webp" : "png";
    const screenshotPayload: {
      type: "png" | "jpeg" | "webp";
      clip: { x: number; y: number; width: number; height: number };
      quality?: number;
    } = {
      type: screenshotType,
      clip: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      },
    };
    if (screenshotType !== "png") {
      screenshotPayload.quality = quality;
    }

    const buffer = (await page.screenshot(screenshotPayload)) as Buffer;

    const safeLabel = (body.label || screen.name || "screen").replace(/[^a-zA-Z0-9._-]/g, "-");
    const extension = format === "JPG" ? "jpg" : format === "WEBP" ? "webp" : "png";
    const stored = await storePublicFile({
      folder: "exports",
      fileNameHint: `${editorData.project.name.replace(/[^a-zA-Z0-9._-]/g, "-")}-${safeLabel}.${extension}`,
      buffer,
    });

    const scale = Number(body.scale || 1);

    try {
      const record = await createProjectExport({
        projectId,
        format,
        scale,
        outputUrl: stored.url,
      });
      return NextResponse.json({ ok: true, exportId: record.id, outputUrl: stored.url });
    } catch (dbError) {
      console.error("Export file saved, but failed to record export metadata:", dbError);
      return NextResponse.json({
        ok: true,
        exportId: null,
        outputUrl: stored.url,
        warning: "File exported, but history entry failed.",
      });
    }
  } catch (error) {
    console.error("Puppeteer export route failed:", error);
    const message = error instanceof Error ? error.message : "Unexpected export error.";
    return NextResponse.json(
      {
        error: message,
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
