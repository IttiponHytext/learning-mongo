// บทที่ 3: Read — find, filter operators, projection, sort, limit, skip
import { withDb, title, show } from "../src/db.js";

await withDb(async (db) => {
  const books = db.collection("books");
  const titles = (arr) => arr.map((b) => b.title);

  title("เท่ากับ (equality)");
  show(
    "{ authorId: 'a2' }",
    titles(await books.find({ authorId: "a2" }).toArray()),
  );

  title("Comparison: $gt $gte $lt $lte $ne $in $nin");
  show(
    "ราคา > 500",
    titles(await books.find({ price: { $gt: 500 } }).toArray()),
  );
  show(
    "ราคา 200–400",
    titles(await books.find({ price: { $gte: 200, $lte: 400 } }).toArray()),
  );
  show(
    "authorId in [a1,a5]",
    titles(await books.find({ authorId: { $in: ["a1", "a5"] } }).toArray()),
  );

  title("Logical: $and (โดยนัย) / $or / $not");
  show(
    "หมวด novel และ stock > 0",
    titles(await books.find({ genres: "novel", stock: { $gt: 0 } }).toArray()),
  );
  show(
    "ราคา < 250 หรือ rating >= 4.6",
    titles(
      await books
        .find({ $or: [{ price: { $lt: 250 } }, { rating: { $gte: 4.6 } }] })
        .toArray(),
    ),
  );

  title("Array queries");
  // genres เป็น array — ค้นค่าเดียวจะ match ถ้ามีค่านั้นอยู่ใน array
  show(
    "genres: 'fantasy'",
    titles(await books.find({ genres: "fantasy" }).toArray()),
  );
  show(
    "$all ต้องมีครบทุกค่า",
    titles(
      await books
        .find({ genres: { $all: ["novel", "thai-literature"] } })
        .toArray(),
    ),
  );
  show(
    "$size = 0 (ไม่มีรีวิว)",
    titles(await books.find({ reviews: { $size: 0 } }).toArray()),
  );

  title("Nested field (dot notation) และ $elemMatch");
  show(
    "reviews.user = 'bee'",
    titles(await books.find({ "reviews.user": "bee" }).toArray()),
  );
  show(
    "มีรีวิวของ tan ที่ให้ 4 ดาวขึ้นไป",
    titles(
      await books
        .find({ reviews: { $elemMatch: { user: "tan", stars: { $gte: 4 } } } })
        .toArray(),
    ),
  );

  title("$exists / $regex");
  show(
    "title ขึ้นต้นด้วย Clean",
    titles(await books.find({ title: { $regex: "^Clean" } }).toArray()),
  );
  show(
    "มี field pages",
    await books.countDocuments({ pages: { $exists: true } }),
  );

  title("Projection — เลือก field ที่จะคืน");
  show(
    "เฉพาะ title, price (ไม่เอา _id)",
    await books
      .find({}, { projection: { _id: 0, title: 1, price: 1 } })
      .limit(3)
      .toArray(),
  );

  title("sort / limit / skip (pagination)");
  const page = (n, size = 3) =>
    books
      .find({}, { projection: { _id: 0, title: 1, price: 1 } })
      .sort({ price: -1 })
      .skip((n - 1) * size)
      .limit(size)
      .toArray();
  show("แพงสุด หน้า 1", await page(1));
  show("หน้า 2", await page(2));

  title("countDocuments / distinct");
  show("จำนวนเล่มที่หมด stock", await books.countDocuments({ stock: 0 }));
  show("genres ทั้งหมด", await books.distinct("genres"));
});
