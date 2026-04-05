import { describe, it, expect, mock, beforeEach } from "bun:test";

// ─── Mock dependencies ──────────────────────────────────────────
const mockFindAndCountAll = mock(() =>
  Promise.resolve({
    rows: [{ id: 1, name: "Alice", email: "alice@mail.com" }],
    count: 1,
  }),
);

const mockFindByPk = mock(() =>
  Promise.resolve({
    id: 1,
    name: "Alice",
    email: "alice@mail.com",
    image: "alice.jpg",
    password: "hashed",
    save: mock(() => Promise.resolve()),
  }),
);

const mockFindOne = mock(() => Promise.resolve(null));

const mockCreate = mock((data: any) => Promise.resolve({ id: 1, ...data }));

const mockEventFindAndCountAll = mock(() =>
  Promise.resolve({
    rows: [{ id: 10, title: "Event A" }],
    count: 1,
  }),
);

// ─── Mock modules ───────────────────────────────────────────────
mock.module("../../models/user.model", () => ({
  User: {
    findAndCountAll: mockFindAndCountAll,
    findByPk: mockFindByPk,
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

mock.module("../../models/event.model", () => ({
  Event: { findAndCountAll: mockEventFindAndCountAll },
}));

mock.module("../../models/eventStatus.model", () => ({
  EventStatus: {},
}));

mock.module("../../models/certificate.model", () => ({
  Certificate: {},
}));

mock.module("../../models/eventParticipant.model", () => ({
  EventParticipantModel: {},
}));

mock.module("bcrypt", () => ({
  default: {
    hash: mock(() => Promise.resolve("hashed_password")),
    compare: mock(() => Promise.resolve(true)),
  },
}));

mock.module("../../utils/upload", () => ({
  saveImage: mock(() =>
    Promise.resolve({ secure_url: "https://cdn.example.com/new.jpg" }),
  ),
}));

// ─── Dynamic import SETELAH semua mock ─────────────────────────
const {
  getAllUsers,
  UserEventHistoryService,
  UpdateUserService,
  RegisterUserServive,
  UpdateUserByIdService,
} = await import("../../service/user-service");

// ───────────────────────────────────────────────────────────────
// getAllUsers
// ───────────────────────────────────────────────────────────────
describe("getAllUsers", () => {
  beforeEach(() => mockFindAndCountAll.mockClear());

  it("returns formatted response", async () => {
    const result = await getAllUsers();

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it("hitung offset dengan benar saat page=2", async () => {
    await getAllUsers(undefined, 2, 10);

    expect(mockFindAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 10, limit: 10 }),
    );
  });
});

// ───────────────────────────────────────────────────────────────
// UserEventHistoryService
// ───────────────────────────────────────────────────────────────
describe("UserEventHistoryService", () => {
  beforeEach(() => {
    mockFindByPk.mockClear();
    mockEventFindAndCountAll.mockClear();
  });

  it("returns user + events dengan format yang benar", async () => {
    const result = await UserEventHistoryService(undefined, 1, 10, 1);

    expect(result.user).toEqual({ id: 1, name: "Alice", image: "alice.jpg" });
    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 10,
      totalPage: 1,
    });
  });

  it("hitung offset dengan benar saat page=2", async () => {
    await UserEventHistoryService(undefined, 2, 10, 1);

    expect(mockEventFindAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 10, limit: 10 }),
    );
  });

  it("build where clause saat ada search", async () => {
    await UserEventHistoryService("workshop", 1, 10, 1);

    expect(mockEventFindAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ title: expect.anything() }),
      }),
    );
  });

  it("where kosong kalau tidak ada search", async () => {
    await UserEventHistoryService(undefined, 1, 10, 1);

    expect(mockEventFindAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it("throw BadRequestError kalau id tidak dikirim", async () => {
    expect(
      UserEventHistoryService(undefined, 1, 10, undefined),
    ).rejects.toThrow("Invalid Id!");
  });

  it("throw BadRequestError kalau id NaN", async () => {
    expect(UserEventHistoryService(undefined, 1, 10, NaN)).rejects.toThrow(
      "Invalid Id!",
    );
  });

  it("throw NotFoundError kalau user tidak ditemukan", async () => {
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(null as any));

    expect(UserEventHistoryService(undefined, 1, 10, 999)).rejects.toThrow(
      "User not found!",
    );
  });
});

// ───────────────────────────────────────────────────────────────
// UpdateUserService
// ───────────────────────────────────────────────────────────────
describe("UpdateUserService", () => {
  beforeEach(() => mockFindByPk.mockClear());

  it("throw BadRequestError kalau id tidak dikirim", async () => {
    expect(UpdateUserService(undefined)).rejects.toThrow("Invalid Id");
  });

  it("throw BadRequestError kalau id NaN", async () => {
    expect(UpdateUserService(NaN)).rejects.toThrow("Invalid Id");
  });

  it("throw NotFoundError kalau user tidak ditemukan", async () => {
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(null as any));

    expect(UpdateUserService(999)).rejects.toThrow("User not found!");
  });

  it("update name dan email", async () => {
    const mockUser = {
      id: 1,
      name: "Alice",
      email: "alice@mail.com",
      password: "hashed",
      image: "alice.jpg",
      save: mock(() => Promise.resolve()),
    };
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(mockUser as any));

    await UpdateUserService(1, "Bob", "bob@mail.com");

    expect(mockUser.name).toBe("Bob");
    expect(mockUser.email).toBe("bob@mail.com");
    expect(mockUser.save).toHaveBeenCalled();
  });

  it("hash password kalau password dikirim", async () => {
    const mockUser = {
      id: 1,
      name: "Alice",
      email: "alice@mail.com",
      password: "old_hashed",
      image: "alice.jpg",
      save: mock(() => Promise.resolve()),
    };
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(mockUser as any));

    await UpdateUserService(1, undefined, undefined, "newpassword");

    expect(mockUser.password).toBe("hashed_password");
  });

  it("upload image kalau image dikirim", async () => {
    const mockUser = {
      id: 1,
      name: "Alice",
      email: "alice@mail.com",
      password: "hashed",
      image: "old.jpg",
      save: mock(() => Promise.resolve()),
    };
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(mockUser as any));

    const fakeImage = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    await UpdateUserService(1, undefined, undefined, undefined, fakeImage);

    expect(mockUser.image).toBe("https://cdn.example.com/new.jpg");
  });
});

// ───────────────────────────────────────────────────────────────
// RegisterUserServive
// ───────────────────────────────────────────────────────────────
describe("RegisterUserServive", () => {
  beforeEach(() => {
    mockFindOne.mockClear();
    mockCreate.mockClear();
  });

  it("berhasil register user baru", async () => {
    const result = await RegisterUserServive("Bob", "bob@mail.com", "password");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Bob", email: "bob@mail.com" }),
    );
    expect(result.id).toBe(1);
  });

  it("throw BadRequestError kalau email sudah ada", async () => {
    mockFindOne.mockImplementationOnce(() =>
      Promise.resolve({ id: 1, email: "bob@mail.com" } as any),
    );

    expect(
      RegisterUserServive("Bob", "bob@mail.com", "password"),
    ).rejects.toThrow("Email already exist");
  });

  it("hash password sebelum disimpan", async () => {
    await RegisterUserServive("Bob", "bob@mail.com", "plainpassword");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ password: "hashed_password" }),
    );
  });
});

// ───────────────────────────────────────────────────────────────
// UpdateUserByIdService
// ───────────────────────────────────────────────────────────────
describe("UpdateUserByIdService", () => {
  beforeEach(() => mockFindByPk.mockClear());

  it("throw NotFoundError kalau user tidak ditemukan", async () => {
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(null as any));

    expect(
      UpdateUserByIdService(
        999,
        "Bob",
        "bob@mail.com",
        "pass",
        new File([], ""),
      ),
    ).rejects.toThrow("User not found!");
  });

  it("berhasil update dan return true", async () => {
    const mockUser = {
      id: 1,
      name: "Alice",
      email: "alice@mail.com",
      password: "hashed",
      image: "alice.jpg",
      save: mock(() => Promise.resolve()),
    };
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(mockUser as any));

    const result = await UpdateUserByIdService(
      1,
      "Bob",
      "bob@mail.com",
      "newpass",
      new File([], ""),
    );

    expect(result).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
  });

  it("upload image kalau image size > 0", async () => {
    const mockUser = {
      id: 1,
      name: "Alice",
      email: "alice@mail.com",
      password: "hashed",
      image: "old.jpg",
      save: mock(() => Promise.resolve()),
    };
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(mockUser as any));

    const fakeImage = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    await UpdateUserByIdService(
      1,
      "Alice",
      "alice@mail.com",
      "pass",
      fakeImage,
    );

    expect(mockUser.image).toBe("https://cdn.example.com/new.jpg");
  });
});
