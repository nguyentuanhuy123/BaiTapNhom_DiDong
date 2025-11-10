import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("cart.db");

// ✅ Định nghĩa kiểu dữ liệu cho 1 dòng trong bảng quiz_results
type QuizResultRow = {
  id: number;
  userId: string;
  courseId: string;
  contentId: string;
  score: number;
  total: number;
  answers: string; // lưu dạng JSON string trong DB
  createdAt: string;
};

// ✅ Khởi tạo bảng lưu kết quả quiz
async function initDB() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      courseId TEXT NOT NULL,
      contentId TEXT NOT NULL,
      score INTEGER,
      total INTEGER,
      answers TEXT, -- JSON string
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// ✅ Lưu kết quả quiz
export async function saveQuizResult({
  userId,
  courseId,
  contentId,
  score,
  total,
  answers,
}: {
  userId: string;
  courseId: string;
  contentId: string;
  score: number;
  total: number;
  answers: Record<number, number>;
}) {
  await db.runAsync(
    `INSERT INTO quiz_results (userId, courseId, contentId, score, total, answers)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, courseId, contentId, score, total, JSON.stringify(answers)]
  );
}
export async function getQuizResult(userId: string, contentId: string) {
  const result = (await db.getFirstAsync(
    `SELECT * FROM quiz_results
     WHERE userId = ? AND contentId = ?
     ORDER BY createdAt DESC
     LIMIT 1`,
    [userId, contentId]
  )) as QuizResultRow | undefined;

  return result
    ? { ...result, answers: JSON.parse(result.answers) }
    : null;
}
