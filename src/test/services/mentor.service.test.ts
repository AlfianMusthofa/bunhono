import { describe, it, expect, mock, beforeEach } from "bun:test";

// ─── Mock dependencies ──────────────────────────────────────────
const mockFindAndCountAll = mock(() =>
  Promise.resolve({
    rows: [
      {
        id: 1,
        name: "John",
        position: "Engineer",
        bio: "Bio",
        image: "john.jpg",
      },
    ],
    count: 1,
  }),
);

const mockFindByPk = mock(() => Promise.resolve(null));
const mockCreate = mock((data: any) => Promise.resolve({ id: 1, ...data }));
const mockSave = mock(() => Promise.resolve());

mock.module("../../models/mentor.model", () => ({
  Mentor: {
    findAndCountAll: mockFindAndCountAll,
    findByPk: mockFindByPk,
    create: mockCreate,
  },
}));

mock.module("../../utils/upload", () => ({
  saveImage: mock(() =>
    Promise.resolve({ secure_url: "https://cdn.example.com/mentor.jpg" }),
  ),
}));

// ─── Dynamic import SETELAH semua mock ─────────────────────────
const { GetAllMentorsService, AddMentorService, UpdateMentorService } =
  await import("../../service/mentor-service");

// ───────────────────────────────────────────────────────────────
// GetAllMentorsService
// ───────────────────────────────────────────────────────────────
describe("GetAllMentorsService", () => {
  beforeEach(() => mockFindAndCountAll.mockClear());

  it("returns formatted response", async () => {
    const result = await GetAllMentorsService();

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      total: 1,
      page: 1,
      limit: 5,
      totalPages: 1,
    });
  });

  it("hitung offset dengan benar saat page=2", async () => {
    await GetAllMentorsService(5, 2);

    expect(mockFindAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 5, limit: 5 }),
    );
  });

  it("build where clause saat ada search", async () => {
    await GetAllMentorsService(5, 1, "john");

    expect(mockFindAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ name: expect.anything() }),
      }),
    );
  });

  it("where kosong kalau tidak ada search", async () => {
    await GetAllMentorsService();

    expect(mockFindAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });
});

// ───────────────────────────────────────────────────────────────
// AddMentorService
// ───────────────────────────────────────────────────────────────
describe("AddMentorService", () => {
  beforeEach(() => mockCreate.mockClear());

  it("berhasil create mentor", async () => {
    const result = await AddMentorService(
      "John",
      "Engineer",
      "Bio",
      null as any,
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "John", position: "Engineer" }),
    );
    expect(result.id).toBe(1);
  });

  it("throw BadRequestError kalau name kosong", async () => {
    expect(
      AddMentorService("", "Engineer", "Bio", null as any),
    ).rejects.toThrow("Name or position is required");
  });

  it("throw BadRequestError kalau position kosong", async () => {
    expect(AddMentorService("John", "", "Bio", null as any)).rejects.toThrow(
      "Name or position is required",
    );
  });

  it("upload image kalau image dikirim", async () => {
    const fakeImage = new File(["data"], "mentor.jpg", { type: "image/jpeg" });
    const result = await AddMentorService("John", "Engineer", "Bio", fakeImage);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ image: "https://cdn.example.com/mentor.jpg" }),
    );
  });

  it("image undefined kalau tidak ada image", async () => {
    await AddMentorService("John", "Engineer", "Bio", null as any);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ image: undefined }),
    );
  });
});

// ───────────────────────────────────────────────────────────────
// UpdateMentorService
// ───────────────────────────────────────────────────────────────
describe("UpdateMentorService", () => {
  beforeEach(() => mockFindByPk.mockClear());

  it("throw NotFoundError kalau mentor tidak ditemukan", async () => {
    mockFindByPk.mockImplementationOnce(() => Promise.resolve(null));

    expect(UpdateMentorService(999, "John")).rejects.toThrow(
      "Mentor not found!",
    );
  });

  it("berhasil update mentor dan return true", async () => {
    const mockMentor = {
      id: 1,
      name: "John",
      position: "Engineer",
      bio: "Bio",
      image: "old.jpg",
      save: mockSave,
    };
    mockFindByPk.mockImplementationOnce(() =>
      Promise.resolve(mockMentor as any),
    );

    const result = await UpdateMentorService(1, "Jane", "Manager", "New Bio");

    expect(mockMentor.name).toBe("Jane");
    expect(mockMentor.position).toBe("Manager");
    expect(mockMentor.bio).toBe("New Bio");
    expect(mockSave).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("upload image kalau image dikirim", async () => {
    const mockMentor = {
      id: 1,
      name: "John",
      position: "Engineer",
      bio: "Bio",
      image: "old.jpg",
      save: mockSave,
    };
    mockFindByPk.mockImplementationOnce(() =>
      Promise.resolve(mockMentor as any),
    );

    const fakeImage = new File(["data"], "new.jpg", { type: "image/jpeg" });
    await UpdateMentorService(1, undefined, undefined, undefined, fakeImage);

    expect(mockMentor.image).toBe("https://cdn.example.com/mentor.jpg");
  });
});
