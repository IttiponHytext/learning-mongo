// บทที่ 7: Aggregation Pipeline — $match $group $sort $project $unwind $lookup $facet
// คิดเหมือนสายพาน: document ไหลผ่าน stage ทีละขั้น แต่ละ stage แปลงข้อมูลส่งต่อ
import { withDb, title, show } from '../src/db.js';

await withDb(async (db) => {
  const books = db.collection('books');
  const orders = db.collection('orders');

  title('$group — ราคาเฉลี่ยและจำนวนเล่มต่อผู้เขียน');
  show('result', await books.aggregate([
    { $group: { _id: '$authorId', books: { $sum: 1 }, avgPrice: { $avg: '$price' }, totalStock: { $sum: '$stock' } } },
    { $sort: { books: -1, _id: 1 } },
  ]).toArray());

  title('$unwind — แตก array ออกเป็นหลาย document');
  show('นับจำนวนเล่มต่อ genre', await books.aggregate([
    { $unwind: '$genres' },
    { $group: { _id: '$genres', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]).toArray());

  title('$project + expressions — คำนวณ field ใหม่');
  show('มูลค่า stock และจำนวนรีวิว', await books.aggregate([
    { $project: { _id: 0, title: 1, stockValue: { $multiply: ['$price', '$stock'] }, reviewCount: { $size: '$reviews' } } },
    { $sort: { stockValue: -1 } },
    { $limit: 5 },
  ]).toArray());

  title('ยอดขายต่อเดือน (ไม่นับ cancelled)');
  show('result', await orders.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
      units: { $sum: '$items.qty' },
    } },
    { $sort: { _id: 1 } },
  ]).toArray());

  title('$lookup — JOIN กับ collection อื่น: หนังสือขายดี + ชื่อผู้เขียน');
  show('top sellers', await orders.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.bookId', sold: { $sum: '$items.qty' } } },
    { $sort: { sold: -1 } },
    { $limit: 3 },
    { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
    { $unwind: '$book' },
    { $lookup: { from: 'authors', localField: 'book.authorId', foreignField: '_id', as: 'author' } },
    { $project: { _id: 0, title: '$book.title', author: { $first: '$author.name' }, sold: 1 } },
  ]).toArray());

  title('$facet — หลายผลลัพธ์ใน query เดียว (เช่นหน้า dashboard)');
  show('facet', await books.aggregate([
    { $facet: {
      priceBuckets: [{ $bucket: { groupBy: '$price', boundaries: [0, 300, 600, 2000], default: 'other', output: { count: { $sum: 1 } } } }],
      outOfStock: [{ $match: { stock: 0 } }, { $project: { _id: 0, title: 1 } }],
      stats: [{ $group: { _id: null, avgRating: { $avg: '$rating' }, maxPrice: { $max: '$price' } } }, { $project: { _id: 0 } }],
    } },
  ]).toArray());
});
