// บทที่ 8: Data Modeling — Embed vs Reference
//
// Embed (ฝังไว้ใน document เดียว)   → อ่านพร้อมกันเสมอ, ข้อมูลลูกไม่เยอะ, ไม่ถูกแชร์ข้าม parent
//   เช่น reviews ใน books, items ใน orders, address ใน customer
// Reference (เก็บ id แล้ว $lookup)  → ข้อมูลใหญ่/โตไม่จำกัด, ถูกใช้ร่วมกันหลายที่, อัปเดตบ่อย
//   เช่น books.authorId → authors, orders.customerId → customers
//
// หลักจำ: "Data that is accessed together should be stored together"
// ข้อจำกัด: document หนึ่งใหญ่ได้ไม่เกิน 16MB
import { withDb, title, show } from "../src/db.js";

await withDb(async (db) => {
  show("order + items", await db.collection("orders").find().toArray());

  title("Embed: อ่านครั้งเดียวได้ครบ");

  show(
    "order + items",
    await db
      .collection("orders")
      .findOne({}, { projection: { _id: 0, customerId: 1, items: 1 } }),
  );

  title("Reference: ต้องใช้ $lookup (หรือ query 2 ครั้ง)");
  show(
    "หนังสือพร้อมข้อมูลผู้เขียน",
    await db
      .collection("books")
      .aggregate([
        { $match: { authorId: "a1" } },
        {
          $lookup: {
            from: "authors",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $set: { author: { $first: "$author" } } },
        {
          $project: { _id: 0, title: 1, "author.name": 1, "author.country": 1 },
        },
      ])
      .toArray(),
  );

  title("ตัวอย่าง customer");
  show("customer", await db.collection("customers").findOne({}));

  title("ตัวอย่าง order");
  show("order", await db.collection("orders").findOne({}));

  title("One-to-many ฝั่งกลับ: ลูกค้า + orders ทั้งหมดของเขา");
  show(
    "customers ⟶ orders",
    await db
      .collection("customers")
      .aggregate([
        {
          $lookup: {
            from: "orders",
            let: { cid: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$customerId", "$$cid"] } } },
              { $project: { _id: 0, status: 1, createdAt: 1 } },
            ],
            as: "orders",
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            orderCount: { $size: "$orders" },
            orders: 1,
          },
        },
      ])
      .toArray(),
  );

  title("Pattern: Extended Reference (ก๊อปบาง field มาเก็บด้วย)");
  console.log(
    "  เช่นเก็บ { bookId, title, price } ใน order.items → แสดงผลได้ไม่ต้อง $lookup",
  );
  console.log(
    "  และ price ใน order ควรเป็นราคา ณ วันที่ซื้อ อยู่แล้ว (ไม่ควรตามราคาปัจจุบัน)",
  );
});
