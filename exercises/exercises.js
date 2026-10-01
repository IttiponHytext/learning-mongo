// แบบฝึกหัด — เติมโค้ดในแต่ละฟังก์ชันแล้วรัน `npm run ex` ระบบจะตรวจให้
// ติดตรงไหนดูเฉลยได้ที่ exercises/solutions/solutions.js (แต่ลองเองก่อนนะ!)
import { show } from '../src/db.js';
import { runChecks } from './checker.js';
const titles = (arr) => arr.map((b) => b.title);

export const answers = {
  // 1) หาชื่อหนังสือ (title) ทั้งหมดที่ราคาน้อยกว่า 300 เรียงตามราคาจากน้อยไปมาก → คืน array ของ string
  async ex1(db) {
    // TODO
    const books = db.collection('books');
    const result = await books.find({ price: { $lt: 300 } }).sort({ price: 1 }).toArray();
    return titles(result);
  },

  // 2) นับจำนวนลูกค้าที่อยู่ Bangkok → คืนตัวเลข
  async ex2(db) {
    // TODO
    const customers = db.collection('customers');
    const result = await customers.find({ city: 'Bangkok' }).toArray();
    return result.length; 

  },

  // 3) หาหนังสือที่อยู่ในหมวด 'fantasy' และยังมี stock → คืน array ของ title
  async ex3(db) {
    // TODO
    const books = db.collection('books');
    const result = await books.find({ genres: 'fantasy', stock: { $gt: 0} }).toArray();
    return titles(result);
  },

  // 4) เพิ่ม tag 'reader' ให้ลูกค้าทุกคน (ห้ามซ้ำถ้ารันหลายรอบ) → คืน modifiedCount หรือ undefined ก็ได้
  //    ตัวตรวจจะเช็คว่าลูกค้าทุกคนมี 'reader' อยู่ใน tags เพียงครั้งเดียว
  async ex4(db) {
    // TODO
    const customers = db.collection('customers');
    const modified = await customers.updateMany({}, { $addToSet: { tags: 'reader' } });
    return modified.modifiedCount;
  },

  // 5) Aggregation: ยอดใช้จ่ายรวมของลูกค้าแต่ละคน (ไม่นับ cancelled)
  //    คืน array รูปแบบ [{ _id: 'c1', total: 1970 }, ...] เรียง total มากไปน้อย
  async ex5(db) {
    // TODO
    const customers = db.collection('customers');
    const results = await customers.aggregate([
      { $lookup: { from: 'orders', localField: '_id', foreignField: 'customerId', as: 'orders' } },
      { $unwind: '$orders' },
      { $match: { 'orders.status': { $ne: 'cancelled' } } },
      { $unwind: '$orders.items' },  
      { $group: { _id: '$_id', total: { $sum: { $multiply: ['$orders.items.price', '$orders.items.qty'] } } } },
      { $sort: { total: -1 } },
    ]).toArray();
    return results;
  },

  // 6) Aggregation + $lookup: ชื่อผู้เขียน (name) ที่มีหนังสือ rating เฉลี่ยสูงที่สุด → คืน string
  async ex6(db) {
    // TODO
    const books = db.collection('books');
    const results = await books.aggregate([
      { $lookup: { from: 'authors', localField: 'authorId', foreignField: '_id', as: 'author' } },
      { $project: { _id: 0, title: 1,authorId:1, author: { $first: '$author.name' }, rating: 1 } },
      { $group: { _id: '$authorId', author: { $first: '$author' }, avgRating: { $avg: '$rating' } } },
     
      { $sort: { avgRating: -1 } },
      { $project: { _id: 0, author: 1, } },
      { $limit:1 }
      
    ]).toArray();
    return results[0].author
  },
  
};

runChecks(answers);
