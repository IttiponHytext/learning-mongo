# 🍃 MongoDB Learning Project

โปรเจคฝึก MongoDB ด้วย **Node.js** แบบลงมือทำทีละบท ใช้ข้อมูลตัวอย่างเป็น "ร้านหนังสือ"
(authors, books, customers, orders)

## เริ่มต้นใช้งาน

ต้องมี [Docker Desktop](https://www.docker.com/products/docker-desktop/) และ Node.js 18+

```bash
cd ~/Desktop/mongo-learning
npm install          # ติดตั้ง mongodb driver, mongoose, dotenv
npm run db:up        # เปิด MongoDB (port 27017) + Mongo Express UI (port 8081)
npm run seed         # ใส่ข้อมูลตัวอย่าง
npm run l1           # เริ่มบทที่ 1
```

- ดูข้อมูลผ่านเว็บ: http://localhost:8081 (Mongo Express)
- หรือใช้ [MongoDB Compass](https://www.mongodb.com/products/compass) ต่อที่ `mongodb://localhost:27017/?directConnection=true`
- เข้า shell: `npm run db:shell` (mongosh)
- ปิด: `npm run db:down` (ข้อมูลยังอยู่ใน volume) · ลบข้อมูลทิ้งด้วย `docker compose down -v`

## 📚 บทเรียน

| บท | คำสั่ง | เนื้อหา |
|---|---|---|
| 1 | `npm run l1` | เชื่อมต่อ, database / collection / document, เทียบกับ SQL |
| 2 | `npm run l2` | Create — `insertOne`, `insertMany`, `_id`, duplicate key |
| 3 | `npm run l3` | Read — filter operators, array query, dot notation, projection, sort / skip / limit |
| 4 | `npm run l4` | Update — `$set` `$inc` `$push` `$addToSet` `$pull`, upsert, `findOneAndUpdate` |
| 5 | `npm run l5` | Delete — `deleteOne`, `deleteMany`, `findOneAndDelete`, soft delete |
| 6 | `npm run l6` | Indexes — `explain()`, COLLSCAN vs IXSCAN, compound / unique / TTL, กฎ ESR |
| 7 | `npm run l7` | Aggregation — `$match` `$group` `$unwind` `$project` `$lookup` `$facet` |
| 8 | `npm run l8` | Data modeling — embed vs reference, `$lookup` แบบ pipeline |
| 9 | `npm run l9` | Transactions — โอนเงินแบบ all-or-nothing |
| 10 | `npm run l10` | Mongoose — schema, validation, virtuals, methods, hooks, populate |

แนะนำ: เปิดไฟล์ใน `lessons/` อ่านคู่กับผลลัพธ์ในเทอร์มินัล แล้วลองแก้ query เองดู
ถ้าข้อมูลเพี้ยนเมื่อไหร่ รัน `npm run seed` ใหม่ได้เสมอ

## ✍️ แบบฝึกหัด

เติมโค้ดใน `exercises/exercises.js` (6 ข้อ ตั้งแต่ find ง่าย ๆ ไปจนถึง aggregation + $lookup) แล้วรัน

```bash
npm run ex            # ตรวจคำตอบ
npm run ex:solutions  # ดูว่าเฉลยผ่านทุกข้อ
```

## 🧠 mongosh cheat sheet

```js
show dbs
use bookstore
show collections
db.books.find({ price: { $gt: 500 } }, { title: 1, _id: 0 }).sort({ price: -1 })
db.books.countDocuments({ stock: 0 })
db.books.updateOne({ title: "Sapiens" }, { $inc: { stock: 1 } })
db.books.aggregate([{ $group: { _id: "$authorId", n: { $sum: 1 } } }])
db.books.getIndexes()
db.books.find({ authorId: "a2" }).explain("executionStats")
```

## โครงสร้างโปรเจค

```
mongo-learning/
├── docker-compose.yml   # MongoDB 7 (replica set 1 โหนด) + Mongo Express
├── .env                 # MONGODB_URI, DB_NAME
├── src/db.js            # ตัวช่วยเชื่อมต่อที่ทุกบทใช้
├── seed/seed.js         # ข้อมูลตัวอย่าง
├── lessons/             # บทเรียน 01–10
└── exercises/           # แบบฝึกหัด + ตัวตรวจ + เฉลย
```

## ไปต่อ

- MongoDB University (คอร์สฟรี): https://learn.mongodb.com
- เอกสาร Node.js driver: https://www.mongodb.com/docs/drivers/node/current/
- ลองต่อยอด: ทำ REST API ด้วย Express + Mongoose สำหรับร้านหนังสือนี้ หรือย้ายไป MongoDB Atlas (แก้แค่ `MONGODB_URI` ใน `.env`)

## แก้ปัญหาเบื้องต้น

- **`connect ECONNREFUSED`** → ยังไม่ได้ `npm run db:up` หรือ Docker Desktop ยังไม่เปิด
- **Transaction error / "not a replica set"** → รอ container ขึ้นสถานะ healthy (`docker ps`) แล้วลองใหม่
- **port 27017 ถูกใช้อยู่** → อาจมี MongoDB จาก Homebrew รันอยู่ ให้ `brew services stop mongodb-community`
# learning-mongo
