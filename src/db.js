// ตัวช่วยเชื่อมต่อ MongoDB ที่ทุกบทเรียนใช้ร่วมกัน
import 'dotenv/config';
import { MongoClient } from 'mongodb';

export const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/?directConnection=true';
export const dbName = process.env.DB_NAME ?? 'bookstore';

export const client = new MongoClient(uri);

/** เปิด connection แล้วส่ง db ให้ callback ใช้งาน จากนั้นปิดให้อัตโนมัติ */
export async function withDb(fn) {
  try {
    await client.connect();
    const db = client.db(dbName);
    await fn(db, client);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

/** พิมพ์หัวข้อให้อ่านง่าย */
export const title = (t) => console.log(`\n=== ${t} ===`);
/** พิมพ์ผลลัพธ์แบบ JSON สวย ๆ */
export const show = (label, data) => console.log(`\n▶ ${label}\n`, JSON.stringify(data, null, 2));
