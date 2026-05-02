import { readdir } from "node:fs/promises";
import path from "node:path";

import { PrismaClient, TemplateStatus, UserRole, ElementKind } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SCREEN_ID_META_KEY = "__screenId";
const SCREEN_NAME_META_KEY = "__screenName";
const TEMPLATE_PREFIX = "Seed Background";
const CANVAS_WIDTH = 1242;
const CANVAS_HEIGHT = 2688;
const SCREEN_COUNT = 7;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);
}

function titleFromFileName(value: string) {
  const withoutExt = value.replace(/\.[^/.]+$/, "");
  return withoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function pickRandomUnique<T>(items: T[], count: number) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

function buildTemplateElements(backgroundUrl: string, deviceBackgroundUrls: string[]) {
  const all: Array<{
    kind: ElementKind;
    name: string;
    zIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    locked: boolean;
    visible: boolean;
    editableByUser: boolean;
    dataJson: string;
  }> = [];

  for (let i = 0; i < SCREEN_COUNT; i += 1) {
    const screenId = `screen-${i + 1}`;
    const screenName = `Screen ${i + 1}`;
    const deviceBackgroundUrl = deviceBackgroundUrls[i] || null;

    all.push(
      {
        kind: ElementKind.IMAGE,
        name: "Common Background",
        zIndex: 1,
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        editableByUser: true,
        dataJson: JSON.stringify({
          assetUrl: backgroundUrl,
          fit: "cover",
          commonBackground: true,
          placeholderLabel: "Upload shared background",
          [SCREEN_ID_META_KEY]: screenId,
          [SCREEN_NAME_META_KEY]: screenName,
        }),
      },
      {
        kind: ElementKind.TEXT,
        name: "Headline",
        zIndex: 10,
        x: 90,
        y: 180,
        width: 1060,
        height: 220,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        editableByUser: true,
        dataJson: JSON.stringify({
          text: `Amazing feature set ${i + 1}`,
          fontSize: 88,
          fontWeight: "bold",
          fontStyle: "normal",
          fontFamily: "space",
          color: "#0f172a",
          align: "left",
          [SCREEN_ID_META_KEY]: screenId,
          [SCREEN_NAME_META_KEY]: screenName,
        }),
      },
      {
        kind: ElementKind.DEVICE_SCREENSHOT_SLOT,
        name: "Screenshot Slot",
        zIndex: 20,
        x: 190,
        y: 560,
        width: 862,
        height: 1860,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        editableByUser: true,
        dataJson: JSON.stringify({
          deviceType: "iphone",
          deviceBackgroundColor: "#0b1020",
          deviceMaskFillAssetUrl: null,
          assetUrl: deviceBackgroundUrl,
          fit: "cover",
          placeholderLabel: "Upload screenshot",
          deviceScreenOffsetX: 0,
          deviceScreenOffsetY: 0,
          deviceScreenScale: 0.95,
          deviceMaskOffsetX: 0,
          deviceMaskOffsetY: 0,
          deviceMaskScale: 1,
          [SCREEN_ID_META_KEY]: screenId,
          [SCREEN_NAME_META_KEY]: screenName,
        }),
      },
    );
  }

  return all;
}

async function listImageFiles(publicSubDir: string) {
  const backgroundsDir = path.join(process.cwd(), "public", publicSubDir);

  const entries = await readdir(backgroundsDir, { withFileTypes: true }).catch(() => []);
  const imageExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".bmp", ".svg"]);

  return entries
    .filter((entry) => entry.isFile() && imageExts.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function ensureTemplateForBackground(adminId: string, fileName: string, screenDesignFiles: string[]) {
  const title = titleFromFileName(fileName);
  const baseSlug = slugify(fileName);
  const slug = `bg-${baseSlug}`;
  const backgroundUrl = `/backgrounds/${fileName}`;
  const selectedDeviceBackgrounds = pickRandomUnique(screenDesignFiles, SCREEN_COUNT).map(
    (name) => `/screenDesigns/${name}`,
  );

  const template = await prisma.template.upsert({
    where: { slug },
    update: {
      name: `${TEMPLATE_PREFIX}: ${title}`,
      description: `Auto-seeded template using ${fileName}. Includes ${SCREEN_COUNT} screens with text and device slot.`,
      status: TemplateStatus.PUBLISHED,
      category: "Background Packs",
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      backgroundColor: "#f8fafc",
      previewImageUrl: backgroundUrl,
      publishedAt: new Date(),
    },
    create: {
      name: `${TEMPLATE_PREFIX}: ${title}`,
      slug,
      description: `Auto-seeded template using ${fileName}. Includes ${SCREEN_COUNT} screens with text and device slot.`,
      status: TemplateStatus.PUBLISHED,
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: CANVAS_HEIGHT,
      backgroundColor: "#f8fafc",
      category: "Background Packs",
      previewImageUrl: backgroundUrl,
      publishedAt: new Date(),
      createdById: adminId,
    },
  });

  const elements = buildTemplateElements(backgroundUrl, selectedDeviceBackgrounds);

  await prisma.$transaction(async (tx) => {
    await tx.templateElement.deleteMany({ where: { templateId: template.id } });
    await tx.templateElement.createMany({
      data: elements.map((element, index) => ({
        templateId: template.id,
        ...element,
        zIndex: element.zIndex + index * 100,
      })),
    });
  });

  return template;
}

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const userPassword = await bcrypt.hash("User123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@appshots.local" },
    update: {},
    create: {
      name: "Seed Admin",
      email: "admin@appshots.local",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "user@appshots.local" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@appshots.local",
      passwordHash: userPassword,
      role: UserRole.USER,
    },
  });

  const backgroundFiles = await listImageFiles("backgrounds");
  const screenDesignFiles = await listImageFiles("screenDesigns");

  if (backgroundFiles.length === 0) {
    console.log("No background files found in public/backgrounds. Skipping template pack generation.");
    return;
  }

  if (screenDesignFiles.length < SCREEN_COUNT) {
    console.log(
      `Found only ${screenDesignFiles.length} files in public/screenDesigns. Device background randomizer needs at least ${SCREEN_COUNT} for fully unique 6-screen assignment.`,
    );
  }

  let firstTemplateId: string | null = null;

  for (const fileName of backgroundFiles) {
    const template = await ensureTemplateForBackground(admin.id, fileName, screenDesignFiles);
    if (!firstTemplateId) {
      firstTemplateId = template.id;
    }
  }

  if (firstTemplateId) {
    await prisma.project.upsert({
      where: { id: "seed-demo-project" },
      update: {
        templateId: firstTemplateId,
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
      },
      create: {
        id: "seed-demo-project",
        userId: demoUser.id,
        templateId: firstTemplateId,
        name: "Demo Project",
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
      },
    });
  }

  console.log(`Seed complete. Generated/updated ${backgroundFiles.length} background templates.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
