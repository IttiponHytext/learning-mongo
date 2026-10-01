// แบบฝึกหัด — เติมโค้ดในแต่ละฟังก์ชันแล้วรัน `npm run ex` ระบบจะตรวจให้
// ติดตรงไหนดูเฉลยได้ที่ exercises/solutions/solutions.js (แต่ลองเองก่อนนะ!)
import { runChecks } from './checker.js';

export const answers = {
  // 1) หาชื่อหนังสือ (title) ทั้งหมดที่ราคาน้อยกว่า 300 เรียงตามราคาจากน้อยไปมาก → คืน array ของ string
  async ex1(db) {
    // TODO
  },

  // 2) นับจำนวนลูกค้าที่อยู่ Bangkok → คืนตัวเลข
  async ex2(db) {
    // TODO
  },

  // 3) หาหนังสือที่อยู่ในหมวด 'fantasy' และยังมี stock → คืน array ของ title
  async ex3(db) {
    // TODO
  },

  // 4) เพิ่ม tag 'reader' ให้ลูกค้าทุกคน (ห้ามซ้ำถ้ารันหลายรอบ) → คืน modifiedCount หรือ undefined ก็ได้
  //    ตัวตรวจจะเช็คว่าลูกค้าทุกคนมี 'reader' อยู่ใน tags เพียงครั้งเดียว
  async ex4(db) {
    // TODO
  },

  // 5) Aggregation: ยอดใช้จ่ายรวมของลูกค้าแต่ละคน (ไม่นับ cancelled)
  //    คืน array รูปแบบ [{ _id: 'c1', total: 1970 }, ...] เรียง total มากไปน้อย
  async ex5(db) {
    // TODO
  },

  // 6) Aggregation + $lookup: ชื่อผู้เขียน (name) ที่มีหนังสือ rating เฉลี่ยสูงที่สุด → คืน string
  async ex6(db) {
    // TODO
  },
};

runChecks(answers);
