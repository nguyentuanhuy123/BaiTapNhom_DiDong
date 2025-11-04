import * as SQLite from "expo-sqlite";
// ✅ Mở hoặc tạo file SQLite
const db = SQLite.openDatabaseSync("cart.db");

// ✅ Hàm khởi tạo bảng
async function initDB() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cart (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL,
      name TEXT,
      description TEXT,
      categories TEXT,
      price REAL,
      estimatedPrice REAL,
      thumbnailUrl TEXT,
      tags TEXT,
      level TEXT,
      demoUrl TEXT,
      ratings REAL,
      purchased INTEGER
    );
  `);
}

// Gọi khởi tạo ngay khi module load
initDB();

// ✅ Thêm khóa học vào giỏ
export async function addToCart(course: CoursesType, userId: string) {
  await db.runAsync(
    `INSERT OR REPLACE INTO cart (
      id, userId, name, description, categories, price,
      estimatedPrice, thumbnailUrl, tags, level, demoUrl,
      ratings, purchased
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      course._id,
      userId,
      course.name,
      course.description,
      course.categories,
      course.price,
      course.estimatedPrice ?? null,
      course.thumbnail?.url ?? null,
      course.tags,
      course.level,
      course.demoUrl,
      course.ratings ?? 0,
      course.purchased,
    ]
  );
}

// ✅ Lấy tất cả khóa học trong giỏ của 1 user
export async function getCart(userId: string): Promise<CoursesType[]> {
  const result = await db.getAllAsync("SELECT * FROM cart WHERE userId = ?", [userId]);

  // Chuyển đổi dữ liệu SQLite về đúng định dạng CoursesType
  return result.map((item: any) => ({
    _id: item.id, // 🔁 đổi id thành _id
    name: item.name,
    description: item.description,
    categories: item.categories,
    price: item.price,
    estimatedPrice: item.estimatedPrice,
    thumbnail: { public_id: "", url: item.thumbnailUrl },
    tags: item.tags,
    level: item.level,
    demoUrl: item.demoUrl,
    benefits: [],
    prerequisites: [],
    reviews: [],
    courseData: [],
    ratings: item.ratings,
    purchased: item.purchased || 0,
  })) as CoursesType[];
}


// ✅ Xóa 1 khóa học khỏi giỏ
export async function removeFromCart(courseId: string, userId: string) {
  await db.runAsync("DELETE FROM cart WHERE id = ? AND userId = ?", [courseId, userId]);
}

// ✅ Xóa toàn bộ giỏ của user
export async function clearCart(userId: string) {
  await db.runAsync("DELETE FROM cart WHERE userId = ?", [userId]);
}

// ✅ Kiểm tra xem khóa học đã có trong giỏ chưa
export async function isCourseInCart(courseId: string, userId: string) {
  const result = await db.getFirstAsync(
    "SELECT id FROM cart WHERE id = ? AND userId = ?",
    [courseId, userId]
  );
  return !!result;
}
