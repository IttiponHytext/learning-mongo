// บทที่ 9: Multi-document Transactions (ต้องรันแบบ replica set — docker-compose ตั้งไว้ให้แล้ว)
// ตัวอย่าง: โอนเงินระหว่างบัญชี ต้องสำเร็จทั้งคู่หรือไม่เกิดอะไรเลย
import { withDb, title, show } from '../src/db.js';

await withDb(async (db, client) => {
  const accounts = db.collection('accounts');
  await accounts.drop().catch(() => {});
  await accounts.insertMany([{ _id: 'alice', balance: 1000 }, { _id: 'bob', balance: 200 }]);

  async function transfer(from, to, amount) {
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const res = await accounts.updateOne(
          { _id: from, balance: { $gte: amount } },
          { $inc: { balance: -amount } },
          { session },
        );
        if (res.modifiedCount !== 1) throw new Error(`ยอดเงินของ ${from} ไม่พอ`);
        await accounts.updateOne({ _id: to }, { $inc: { balance: amount } }, { session });
      });
      console.log(`  ✔ โอน ${amount} จาก ${from} → ${to}`);
    } catch (e) {
      console.log(`  ✘ rollback: ${e.message}`);
    } finally {
      await session.endSession();
    }
  }

  title('โอนสำเร็จ');
  await transfer('alice', 'bob', 300);
  show('balances', await accounts.find().toArray());

  title('โอนไม่สำเร็จ → ไม่มีอะไรเปลี่ยน');
  await transfer('bob', 'alice', 9999);
  show('balances', await accounts.find().toArray());

  console.log('\nหมายเหตุ: การอัปเดต document เดียวเป็น atomic อยู่แล้ว — ใช้ transaction เฉพาะเมื่อแตะหลาย document');
});
