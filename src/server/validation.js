export class InputError extends Error {
  constructor(message) { super(message); this.name = "InputError"; }
}

const cleanString = (value, label, max, { required = true } = {}) => {
  if (value == null && !required) return null;
  if (typeof value !== "string") throw new InputError(`${label} tidak valid`);
  const result = value.trim();
  if ((!result && required) || result.length > max) throw new InputError(`${label} tidak valid`);
  return result || null;
};

export function positiveId(value, label = "ID") {
  const id = String(value ?? "");
  if (!/^[1-9]\d{0,17}$/.test(id)) throw new InputError(`${label} tidak valid`);
  return id;
}

export function pagination(input = {}) {
  const page = Number(input.page ?? 1);
  const pageSize = Number(input.pageSize ?? 10);
  if (!Number.isSafeInteger(page) || page < 1 || page > 1_000_000) throw new InputError("Halaman tidak valid");
  if (![10, 25, 50, 100].includes(pageSize)) throw new InputError("Ukuran halaman tidak valid");
  return { page, pageSize, offset: (page - 1) * pageSize };
}

export function searchText(value) {
  return value == null || value === "" ? "" : cleanString(value, "Pencarian", 120, { required: false }) || "";
}

export function bookInput(value = {}) {
  const stockTotal = Number(value.stockTotal);
  const publicationYear = value.publicationYear == null || value.publicationYear === "" ? null : Number(value.publicationYear);
  if (value.stockAvailable !== undefined || !Number.isSafeInteger(stockTotal) || stockTotal < 0) throw new InputError("Jumlah stok tidak valid");
  if (publicationYear !== null && (!Number.isInteger(publicationYear) || publicationYear < 0 || publicationYear > new Date().getFullYear() + 1)) throw new InputError("Tahun terbit tidak valid");
  return {
    category_id: positiveId(value.categoryId, "Kategori"),
    isbn: cleanString(value.isbn, "ISBN", 20, { required: false }),
    title: cleanString(value.title, "Judul", 255),
    author: cleanString(value.author, "Penulis", 180),
    publisher: cleanString(value.publisher, "Penerbit", 180, { required: false }),
    publication_year: publicationYear,
    stock_total: stockTotal,
  };
}

export function availableAfterStockEdit(previousTotal, previousAvailable, nextTotal) {
  if (![previousTotal, previousAvailable, nextTotal].every(Number.isSafeInteger) || previousTotal < 0 || previousAvailable < 0 || previousAvailable > previousTotal || nextTotal < previousTotal - previousAvailable) throw new InputError("Jumlah stok lebih kecil dari buku yang sedang dipinjam");
  return nextTotal - (previousTotal - previousAvailable);
}

export function categoryInput(value = {}) {
  const isActive = parseActive(value.isActive, "Status kategori");
  return { name: cleanString(value.name, "Nama kategori", 120), description: cleanString(value.description, "Deskripsi", 4000, { required: false }), ...(isActive !== undefined ? { is_active: isActive } : {}) };
}

export function studentInput(value = {}) {
  const isActive = parseActive(value.isActive, "Status siswa");
  const email = cleanString(value.email, "Email", 254, { required: false });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError("Email tidak valid");
  return { student_number: cleanString(value.studentNumber, "NIS", 40), name: cleanString(value.name, "Nama", 180), class_name: cleanString(value.className, "Kelas", 80, { required: false }), email, phone: cleanString(value.phone, "Telepon", 32, { required: false }), ...(isActive !== undefined ? { is_active: isActive } : {}) };
}

function parseActive(value, label) {
  if (value === undefined) return undefined;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new InputError(`${label} tidak valid`);
}

export function formObject(formData) {
  return Object.fromEntries(formData.entries());
}
