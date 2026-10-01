// บทที่ 6: Indexes และ explain() — ทำให้ query เร็ว
import { withDb, title, show } from '../src/db.js';

const summary = (plan) => {
  const s = plan.executionStats;
  const stage = JSON.stringify(plan.queryPlanner.winningPlan).match(/"stage":"(COLLSCAN|IXSCAN)"/)?.[1];
  return { stage, docsExamined: s.totalDocsExamined, keysExamined: s.totalKeysExamined, returned: s.nReturned };
};

await withDb(async (db) => {
  const col = db.collection('big_orders');
  await col.drop().catch(() => {});

  title('สร้างข้อมูล 50,000 docs');
  const cities = ['Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen', 'Hat Yai'];
  const docs = Array.from({ length: 50_000 }, (_, i) => ({
    orderNo: i + 1,
    city: cities[i % cities.length],
    total: (i * 37) % 5000,
    email: `user${i}@example.com`,
  }));
  await col.insertMany(docs);

  const q = { city: 'Phuket', total: { $gt: 4900 } };

  title('ก่อนมี index → COLLSCAN (อ่านทุก document)');
  show('explain', summary(await col.find(q).explain('executionStats')));

  title('Compound index { city: 1, total: 1 }');
  await col.createIndex({ city: 1, total: 1 });
  show('explain', summary(await col.find(q).explain('executionStats')));
  // กฎ ESR: เรียง field ใน index เป็น Equality → Sort → Range

  title('Unique index');
  await col.createIndex({ email: 1 }, { unique: true });
  await col.insertOne({ email: 'user1@example.com' }).catch((e) => console.log('  ซ้ำไม่ได้ → code', e.code));

  title('Index อื่น ๆ ที่ควรรู้');
  console.log('  • Text index:     createIndex({ title: "text" }) → find({ $text: { $search: "..." } })');
  console.log('  • TTL index:      createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 }) ลบ doc อัตโนมัติ');
  console.log('  • Partial index:  { partialFilterExpression: { status: "active" } }');
  console.log('  • Multikey:       index บน field ที่เป็น array จะกลายเป็น multikey ให้เอง');

  show('indexes ทั้งหมด', (await col.indexes()).map((i) => ({ name: i.name, key: i.key, unique: i.unique })));

  title('ข้อควรระวัง');
  console.log('  index ช่วย read แต่ทำให้ write ช้าลงและกิน RAM — สร้างเฉพาะที่ query ใช้จริง');
  await col.drop();
});
