-- CreateTable
CREATE TABLE "ProjectCustomElement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "rotation" REAL NOT NULL DEFAULT 0,
    "opacity" REAL NOT NULL DEFAULT 1,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "dataJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectCustomElement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProjectCustomElement_projectId_zIndex_idx" ON "ProjectCustomElement"("projectId", "zIndex");
