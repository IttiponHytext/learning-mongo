import { withDb } from '../src/db.js';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const checks = {
  ex1: async (db, ans) => same(ans, ['ความน่าจะเป็น', 'คำพิพากษา', 'เวลา']),
  ex2: async (db, ans) => ans === 2,
  ex3: async (db, ans) => same(ans?.slice().sort(), ['1Q84']),
  ex4: async (db) => {
    const all = await db.collection('customers').find().toArray();
    return all.length > 0 && all.every((c) => c.tags.filter((t) => t === 'reader').length === 1);
  },
  ex5: async (db, ans) => same(ans, [
    { _id: 'c4', total: 1560 },
    { _id: 'c1', total: 1970 },
    { _id: 'c2', total: 1630 },
    { _id: 'c3', total: 1080 },
  ].sort((a, b) => b.total - a.total)),
  ex6: async (db, ans) => ans === 'ชาติ กอบจิตติ',
};

export function runChecks(answers) {
  return withDb(async (db) => {
    let pass = 0;
    for (const [name, check] of Object.entries(checks)) {
      try {
        const ans = await answers[name](db);
        const ok = await check(db, ans);
        if (ok) pass++;
        console.log(`${ok ? '✅' : '⬜'} ${name}${ok ? '' : '  → ได้: ' + JSON.stringify(ans)}`);
      } catch (e) {
        console.log(`❌ ${name}  → error: ${e.message}`);
      }
    }
    console.log(`\nผ่าน ${pass}/${Object.keys(checks).length} ข้อ${pass === 6 ? ' 🎉' : ''}`);
    console.log('(ถ้าข้อมูลเพี้ยน รัน `npm run seed` เพื่อรีเซ็ตได้)');
  });
}
