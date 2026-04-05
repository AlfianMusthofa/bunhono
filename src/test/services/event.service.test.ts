import { describe, it, expect, mock, beforeEach } from "bun:test";

// ─── Mock dependencies ──────────────────────────────────────────
const mockFindAll = mock(() => Promise.resolve([]));
const mockFindByPk = mock(() => Promise.resolve(null));
const mockFindOne = mock(() => Promise.resolve(null));
const mockCreate = mock((data: any) => Promise.resolve({ id: 1, ...data }));
const mockCount = mock(() => Promise.resolve(0));
const mockSave = mock(() => Promise.resolve());

const mockEventParticipantFindOne = mock(() => Promise.resolve(null));
const mockEventParticipantCreate = mock(() => Promise.resolve(true));
const mockEventParticipantFindAll = mock(() => Promise.resolve([]));

mock.module("../../models/event.model", () => ({
  Event: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    findOne: mockFindOne,
    create: mockCreate,
    count: mockCount,
  },
}));

mock.module("../../models/category.model", () => ({ Category: {} }));
mock.module("../../models/mentor.model", () => ({ Mentor: {} }));
mock.module("../../models/eventStatus.model", () => ({ EventStatus: {} }));
mock.module("../../models/certificate.model", () => ({ Certificate: {} }));
mock.module("../../models/user.model", () => ({ User: {} }));

mock.module("../../models/eventParticipant.model", () => ({
  EventParticipantModel: {
    findOne: mockEventParticipantFindOne,
    create: mockEventParticipantCreate,
    findAll: mockEventParticipantFindAll,
  },
}));

mock.module("../../utils/upload", () => ({
  saveImage: mock(() =>
    Promise.resolve({ secure_url: "https://cdn.example.com/event.jpg" }),
  ),
}));

mock.module("../../utils/slug", () => ({
  generateSlug: mock((title: string) => title.toLowerCase().replace(/ /g, "-")),
}));

mock.module("../../config/database", () => ({
  sequelize: {
    fn: mock(() => {}),
    col: mock(() => {}),
  },
}));

// ─── Dynamic import SETELAH semua mock ─────────────────────────
const {
  getAllEventsFunction,
  getEventByIdFunction,
  getEventBySlugService,
  joinEventService,
  CreateEventService,
  UpdateEventService,
} = await import("../../service/event-service");

// ───────────────────────────────────────────────────────────────
// getAllEventsFunction
// ───────────────────────────────────────────────────────────────
describe("getAllEventsFunction", () => {
  beforeEach(() => {
    mockFindAll.mockClear();
    mockCount.mockClear();
  });

  it("returns formatted response", async () => {
    mockFindAll.mockImplementationOnce(() =>
      Promise.resolve([{ id: 1, title: "Event A" }] as any),
    );
    mockCount.mockImplementationOnce(() => Promise.resolve(1));

    const result = await getAllEventsFunction({});

    expect(result.rows).toHaveLength(1);
    expect(result.count).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it("hitung offset dengan benar saat page=2", async () => {
    mockCount.mockImplementationOnce(() => Promise.resolve(20));

    await getAllEventsFunction({ page: 2, limit: 10 });

    expect(mockFindAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 10, limit: 10 }),
    );
  });

  it("build where clause saat ada search", async () => {
    await getAllEventsFunction({ search: "workshop" });

    expect(mockFindAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: expect.anything(),
        }),
      }),
    );
  });

  it("where kosong kalau tidak ada filter", async () => {
    await getAllEventsFunction({});

    expect(mockFindAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });
});

// ───────────────────────────────────────────────────────────────
// getEventByIdFunction
// ───────────────────────────────────────────────────────────────
describe("getEventByIdFunction", () => {
  beforeEach(() => mockFindByPk.mockClear());

  it("returns event by id", async () => {
    mockFindByPk.mockImplementationOnce(() =>
      Promise.resolve({ id: 1, title: "Event A" } as any),
    );

    const result = await getEventByIdFunction({ id: 1 });

    expect(result).toEqual(expect.objectContaining({ id: 1 }));
    expect(mockFindByPk).toHaveBeenCalledWith(1, expect.anything());
  });

  it("returns null kalau event tidak ditemukan", async () => {
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(null));

    const result = await getEventByIdFunction({ id: 999 });

    expect(result).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────
// getEventBySlugService
// ───────────────────────────────────────────────────────────────
describe("getEventBySlugService", () => {
  beforeEach(() => mockFindOne.mockClear());

  it("returns event by slug", async () => {
    mockFindOne.mockImplementationOnce(() =>
      Promise.resolve({ id: 1, slug: "event-a" } as any),
    );

    const result = await getEventBySlugService({ slug: "event-a" });

    expect(result).toEqual(expect.objectContaining({ slug: "event-a" }));
  });

  it("returns null kalau slug tidak ditemukan", async () => {
    const result = await getEventBySlugService({ slug: "not-exist" });

    expect(result).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────
// joinEventService
// ───────────────────────────────────────────────────────────────
describe("joinEventService", () => {
  beforeEach(() => {
    mockFindByPk.mockClear();
    mockEventParticipantFindOne.mockClear();
    mockEventParticipantCreate.mockClear();
  });

  it("berhasil join event", async () => {
    mockFindByPk.mockImplementationOnce(() =>
      Promise.resolve({ id: 1, title: "Event A" } as any),
    );

    const result = await joinEventService(1, 1, "TICKET-001");

    expect(result).toBe(true);
    expect(mockEventParticipantCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 1, eventId: 1 }),
    );
  });

  it("throw NotFoundError kalau event tidak ditemukan", async () => {
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(null));

    expect(joinEventService(1, 999, "TICKET-001")).rejects.toThrow(
      "Event not found!",
    );
  });

  it("throw BadRequestError kalau user sudah join", async () => {
    mockFindByPk.mockImplementationOnce(() =>
      Promise.resolve({ id: 1, title: "Event A" } as any),
    );
    mockEventParticipantFindOne.mockImplementationOnce(() =>
      Promise.resolve({ userId: 1, eventId: 1 } as any),
    );

    expect(joinEventService(1, 1, "TICKET-001")).rejects.toThrow(
      "User already joined!",
    );
  });
});

// ───────────────────────────────────────────────────────────────
// CreateEventService
// ───────────────────────────────────────────────────────────────
describe("CreateEventService", () => {
  beforeEach(() => mockCreate.mockClear());

  const validArgs = [
    "Event A",
    "Jakarta",
    "Description",
    "2025-01-01",
    "2025-01-02",
    1,
    1,
    1,
    100,
    null as any,
    "offline",
    "",
    "free",
    0,
  ] as const;

  it("berhasil create event", async () => {
    const result = await CreateEventService(...validArgs);

    expect(mockCreate).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it("throw BadRequestError kalau title kosong", async () => {
    expect(
      CreateEventService(
        "",
        "Jakarta",
        "Desc",
        "2025-01-01",
        "2025-01-02",
        1,
        1,
        1,
        100,
        null as any,
        "offline",
        "",
        "free",
        0,
      ),
    ).rejects.toThrow("Title is required!");
  });

  it("throw BadRequestError kalau locationType tidak valid", async () => {
    expect(
      CreateEventService(
        "Event",
        "Jakarta",
        "Desc",
        "2025-01-01",
        "2025-01-02",
        1,
        1,
        1,
        100,
        null as any,
        "invalid",
        "",
        "free",
        0,
      ),
    ).rejects.toThrow("Location type is required!");
  });

  it("throw BadRequestError kalau priceType tidak valid", async () => {
    expect(
      CreateEventService(
        "Event",
        "Jakarta",
        "Desc",
        "2025-01-01",
        "2025-01-02",
        1,
        1,
        1,
        100,
        null as any,
        "offline",
        "",
        "invalid",
        0,
      ),
    ).rejects.toThrow("Price type is required!");
  });

  it("throw BadRequestError kalau offline tapi location kosong", async () => {
    expect(
      CreateEventService(
        "Event",
        "",
        "Desc",
        "2025-01-01",
        "2025-01-02",
        1,
        1,
        1,
        100,
        null as any,
        "offline",
        "",
        "free",
        0,
      ),
    ).rejects.toThrow("Location is required!");
  });

  it("throw BadRequestError kalau online tapi meetingLink kosong", async () => {
    expect(
      CreateEventService(
        "Event",
        "",
        "Desc",
        "2025-01-01",
        "2025-01-02",
        1,
        1,
        1,
        100,
        null as any,
        "online",
        "",
        "free",
        0,
      ),
    ).rejects.toThrow("Meeting link is required!");
  });

  it("throw BadRequestError kalau datetime tidak valid", async () => {
    expect(
      CreateEventService(
        "Event",
        "Jakarta",
        "Desc",
        "invalid-date",
        "2025-01-02",
        1,
        1,
        1,
        100,
        null as any,
        "offline",
        "",
        "free",
        0,
      ),
    ).rejects.toThrow("Datetime is invalid!");
  });
});

// ───────────────────────────────────────────────────────────────
// UpdateEventService
// ───────────────────────────────────────────────────────────────
describe("UpdateEventService", () => {
  beforeEach(() => mockFindByPk.mockClear());

  const mockEvent = {
    id: 1,
    title: "Old Title",
    location: "Old Location",
    description: "Old Desc",
    startAt: new Date(),
    endAt: new Date(),
    image: "old.jpg",
    statusId: 1,
    mentorId: 1,
    categoryId: 1,
    capacity: 50,
    locationType: "offline",
    meetingLink: "",
    priceType: "free",
    price: 0,
    save: mockSave,
  };

  it("berhasil update event", async () => {
    mockFindByPk.mockImplementationOnce(() =>
      Promise.resolve({ ...mockEvent } as any),
    );

    const result = await UpdateEventService(
      1,
      "New Title",
      "New Location",
      "New Desc",
      "2025-06-01",
      "2025-06-02",
      null as any,
      1,
      1,
      1,
      100,
      "offline",
      "",
      "free",
      0,
    );

    expect(mockSave).toHaveBeenCalled();
  });

  it("throw BadRequestError kalau datetime tidak dikirim", async () => {
    expect(
      UpdateEventService(
        1,
        "Title",
        "Loc",
        "Desc",
        "",
        "",
        null as any,
        1,
        1,
        1,
        100,
        "offline",
        "",
        "free",
        0,
      ),
    ).rejects.toThrow("Datetime is required!");
  });

  it("throw NotFoundError kalau event tidak ditemukan", async () => {
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(null));

    expect(
      UpdateEventService(
        999,
        "Title",
        "Loc",
        "Desc",
        "2025-01-01",
        "2025-01-02",
        null as any,
        1,
        1,
        1,
        100,
        "offline",
        "",
        "free",
        0,
      ),
    ).rejects.toThrow("Event not found");
  });

  it("throw BadRequestError kalau priceType tidak valid", async () => {
    mockFindByPk.mockImplementationOnce(() =>
      Promise.resolve({ ...mockEvent } as any),
    );

    expect(
      UpdateEventService(
        1,
        "Title",
        "Loc",
        "Desc",
        "2025-01-01",
        "2025-01-02",
        null as any,
        1,
        1,
        1,
        100,
        "offline",
        "",
        "invalid",
        0,
      ),
    ).rejects.toThrow("PriceType is not valid!");
  });
});
