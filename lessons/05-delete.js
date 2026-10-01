// บทที่ 5: Delete — deleteOne / deleteMany / findOneAndDelete
import { withDb, title, show } from '../src/db.js';

await withDb(async (db) => {
  const tmp = db.collection('tmp_delete_demo');
  await tmp.drop().catch(() => {});
  await tmp.insertMany([
    { n: 1, type: 'a' }, { n: 2, type: 'a' }, { n: 3, type: 'b' }, { n: 4, type: 'b' }, { n: 5, type: 'c' },
  ]);

  title('deleteOne — ลบตัวแรกที่ match');
  show('result', await tmp.deleteOne({ type: 'a' }));

  title('deleteMany');
  show("ลบ type 'b' ทั้งหมด", await tmp.deleteMany({ type: 'b' }));

  title('findOneAndDelete — ลบแล้วได้ document คืนมา (เหมาะกับ queue)');
  show('popped', await tmp.findOneAndDelete({}, { sort: { n: 1 } }));

  show('เหลือ', await tmp.find({}, { projection: { _id: 0 } }).toArray());

  title('deleteMany({}) vs drop()');
  console.log('  deleteMany({}) ลบทุก document แต่เก็บ collection + index ไว้');
  console.log('  drop() ลบทิ้งทั้ง collection รวม index');
  await tmp.drop();

  title('Soft delete (แนวปฏิบัติ)');
  console.log('  งานจริงมักไม่ลบจริง แต่ $set: { deletedAt: new Date() } แล้ว filter { deletedAt: null }');
});
