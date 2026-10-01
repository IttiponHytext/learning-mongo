// บทที่ 4: Update — updateOne / updateMany / update operators / upsert / findOneAndUpdate
import { withDb, title, show } from '../src/db.js';

await withDb(async (db) => {
  const books = db.collection('books');
  const peek = (t) => books.findOne({ title: t }, { projection: { _id: 0, title: 1, price: 1, stock: 1, genres: 1, onSale: 1, reviews: 1 } });

  title('$set / $unset');
  await books.updateOne({ title: 'Sapiens' }, { $set: { onSale: true, price: 450 } });
  show('หลัง $set', await peek('Sapiens'));
  await books.updateOne({ title: 'Sapiens' }, { $unset: { onSale: '' }, $set: { price: 520 } });
  show('หลัง $unset (คืนราคาเดิม)', await peek('Sapiens'));

  title('$inc — เพิ่ม/ลดตัวเลขแบบ atomic');
  await books.updateOne({ title: 'เวลา' }, { $inc: { stock: -1 } });
  show('stock ลดลง 1', await peek('เวลา'));
  await books.updateOne({ title: 'เวลา' }, { $inc: { stock: 1 } });

  title('Array operators: $push / $addToSet / $pull');
  await books.updateOne({ title: 'Homo Deus' }, { $push: { reviews: { user: 'demo', stars: 3 } } });
  await books.updateOne({ title: 'Homo Deus' }, { $addToSet: { genres: 'history' } }); // ไม่เพิ่มซ้ำ
  await books.updateOne({ title: 'Homo Deus' }, { $addToSet: { genres: 'history' } });
  show('หลัง push + addToSet', await peek('Homo Deus'));
  await books.updateOne({ title: 'Homo Deus' }, { $pull: { reviews: { user: 'demo' }, genres: 'history' } });
  show('หลัง $pull', await peek('Homo Deus'));

  title('updateMany + $mul');
  const r = await books.updateMany({ genres: 'programming' }, { $mul: { price: 0.9 } });
  show('ลดราคาหนังสือ programming 10%', { matched: r.matchedCount, modified: r.modifiedCount });
  await books.updateMany({ genres: 'programming' }, [{ $set: { price: { $round: [{ $divide: ['$price', 0.9] }, 0] } } }]); // คืนราคา (update ด้วย pipeline)

  title('upsert — ไม่มีก็สร้างใหม่');
  const up = await db.collection('customers').updateOne(
    { email: 'new@example.com' },
    { $set: { name: 'Newbie', city: 'Phuket' }, $setOnInsert: { joinedAt: new Date(), tags: [] } },
    { upsert: true },
  );
  show('upsertedId', up.upsertedId);
  await db.collection('customers').deleteOne({ email: 'new@example.com' });

  title('findOneAndUpdate — อัปเดตแล้วคืน document');
  const doc = await books.findOneAndUpdate(
    { title: 'Clean Code', stock: { $gt: 0 } },
    { $inc: { stock: -1 } },
    { returnDocument: 'after', projection: { _id: 0, title: 1, stock: 1 } },
  );
  show('ขายไป 1 เล่ม (after)', doc);
  await books.updateOne({ title: 'Clean Code' }, { $inc: { stock: 1 } });

  title('replaceOne — แทนที่ทั้ง document (ระวัง! field อื่นหายหมด)');
  console.log('  ส่วนใหญ่จึงใช้ $set แทน replaceOne');
});
