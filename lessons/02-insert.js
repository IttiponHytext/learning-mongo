// บทที่ 2: Create — insertOne / insertMany
import { withDb, title, show } from '../src/db.js';

await withDb(async (db) => {
  const books = db.collection('books');

  title('insertOne');
  const r1 = await books.insertOne({
    title: 'MongoDB เบื้องต้น',
    authorId: 'a5',
    genres: ['programming'],
    price: 199,
    stock: 1,
    tags: ['demo'], // field ใหม่ที่ document อื่นไม่มี ก็ใส่ได้เลย (flexible schema)
  });
  show('insertedId', r1.insertedId);

  title('insertMany');
  const r2 = await books.insertMany([
    { title: 'Demo A', price: 100, genres: ['demo'], tags: ['demo'] },
    { title: 'Demo B', price: 150, genres: ['demo'], tags: ['demo'] },
  ]);
  show('insertedCount', r2.insertedCount);

  title('ใส่ _id เอง + duplicate key error');
  await db.collection('authors').insertOne({ _id: 'a1', name: 'ซ้ำ' }).catch((e) => {
    console.log('  คาดไว้แล้ว → code', e.code, '(E11000 duplicate key)');
  });

  title('ordered: false — insert ต่อแม้บางตัว error');
  const r3 = await db.collection('authors')
    .insertMany([{ _id: 'a1', name: 'ซ้ำ' }, { _id: 'a99', name: 'Demo Author' }], { ordered: false })
    .catch((e) => e.result);
  show('insertedCount (ควรได้ 1)', r3.insertedCount);

  // เก็บกวาด demo ที่สร้าง
  await books.deleteMany({ tags: 'demo' });
  await db.collection('authors').deleteOne({ _id: 'a99' });
  console.log('\n(ลบข้อมูล demo ทิ้งแล้ว)');
});
