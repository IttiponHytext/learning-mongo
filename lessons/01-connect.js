// บทที่ 1: เชื่อมต่อ MongoDB และรู้จักโครงสร้าง  Server → Database → Collection → Document
//
// SQL        | MongoDB
// -----------|-----------
// database   | database
// table      | collection
// row        | document (JSON/BSON)
// column     | field
// primary key| _id (สร้างให้อัตโนมัติถ้าไม่ใส่)
import { withDb, title, show } from "../src/db.js";

await withDb(async (db, client) => {
  title("1. Ping server");
  const ping = await db.command({ ping: 1 });
  show("ping", ping);

  title("2. รายชื่อ databases บน server");
  const { databases } = await client.db().admin().listDatabases();
  show(
    "databases",
    databases.map((d) => d.name),
  );

  title("3. รายชื่อ collections ใน " + db.databaseName);
  const cols = await db.listCollections().toArray();
  show(
    "collections",
    cols.map((c) => c.name),
  );

  title("4. หน้าตา document หนึ่งตัว");
  show("books.findOne()", await db.collection("books").find().toArray());
  // สังเกต: _id เป็น ObjectId, reviews เป็น array ของ object — ซ้อนกันได้ ไม่ต้องมี schema ตายตัว
});
