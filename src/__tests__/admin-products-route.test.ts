import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
  authMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/services/auth/adminAuth.server", () => ({
  getAuthenticatedAdminIdFromCookies: authMock,
}));

import { GET } from "@/app/api/admin/products/route";

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "product-1",
    name: "Cake",
    slug: "cake",
    description: null,
    image: "/cake.webp",
    category: "CAKE",
    isActive: true,
    sortOrder: 1,
    location: null,
    variants: [
      {
        id: "variant-1",
        label: "Default",
        regularPrice: 500,
        salePrice: null,
        stock: 10,
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      },
    ],
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("GET /api/admin/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue("admin-1");
    prismaMock.product.findMany.mockResolvedValue([makeProduct()]);
    prismaMock.product.count.mockResolvedValue(1);
  });

  it("keeps product management location filtering exact by default", async () => {
    const res = await GET(
      new Request("http://localhost/api/admin/products?locationId=loc-noida")
    );

    expect(res.status).toBe(200);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ OR: [{ locationId: "loc-noida" }] }],
        },
      })
    );
  });

  it("includes global products with the selected location when requested by admin booking forms", async () => {
    const res = await GET(
      new Request(
        "http://localhost/api/admin/products?locationId=loc-noida&includeGlobal=true&isActive=true"
      )
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          AND: [{ OR: [{ locationId: "loc-noida" }, { locationId: null }] }],
        },
      })
    );
  });
});
