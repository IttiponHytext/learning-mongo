// เฉลยแบบฝึกหัด
import { runChecks } from '../checker.js';

export const answers = {
  async ex1(db) {
    const docs = await db.collection('books').find({ price: { $lt: 300 } }).sort({ price: 1 }).project({ title: 1 }).toArray();
    return docs.map((d) => d.title);
  },
  async ex2(db) {
    return db.collection('customers').countDocuments({ city: 'Bangkok' });
  },
  async ex3(db) {
    const docs = await db.collection('books').find({ genres: 'fantasy', stock: { $gt: 0 } }).toArray();
    return docs.map((d) => d.title);
  },
  async ex4(db) {
    const r = await db.collection('customers').updateMany({}, { $addToSet: { tags: 'reader' } });
    return r.modifiedCount;
  },
  async ex5(db) {
    return db.collection('orders').aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$customerId', total: { $sum: { $multiply: ['$items.qty', '$items.price'] } } } },
      { $sort: { total: -1 } },
    ]).toArray();
  },
  async ex6(db) {
    const [top] = await db.collection('books').aggregate([
      { $group: { _id: '$authorId', avgRating: { $avg: '$rating' } } },
      { $sort: { avgRating: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'authors', localField: '_id', foreignField: '_id', as: 'author' } },
    ]).toArray();
    return top.author[0].name;
  },
};

runChecks(answers);
