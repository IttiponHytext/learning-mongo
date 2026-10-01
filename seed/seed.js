// สร้างข้อมูลตัวอย่าง: ร้านหนังสือ (authors, books, customers, orders)
// รันซ้ำได้ — จะล้าง collection เดิมก่อนทุกครั้ง
import { withDb, title } from '../src/db.js';

const authors = [
  { _id: 'a1', name: 'ชาติ กอบจิตติ', country: 'TH', born: 1954 },
  { _id: 'a2', name: 'Haruki Murakami', country: 'JP', born: 1949 },
  { _id: 'a3', name: 'Yuval Noah Harari', country: 'IL', born: 1976 },
  { _id: 'a4', name: 'Robert C. Martin', country: 'US', born: 1952 },
  { _id: 'a5', name: 'ปราบดา หยุ่น', country: 'TH', born: 1973 },
];

const books = [
  { title: 'คำพิพากษา', authorId: 'a1', genres: ['novel', 'thai-literature'], price: 250, stock: 12, rating: 4.8, pages: 280, publishedYear: 1981, reviews: [{ user: 'nok', stars: 5 }, { user: 'bee', stars: 5 }] },
  { title: 'เวลา', authorId: 'a1', genres: ['novel', 'thai-literature'], price: 290, stock: 4, rating: 4.5, pages: 320, publishedYear: 1993, reviews: [{ user: 'nok', stars: 4 }] },
  { title: 'Norwegian Wood', authorId: 'a2', genres: ['novel', 'romance'], price: 390, stock: 7, rating: 4.3, pages: 296, publishedYear: 1987, reviews: [] },
  { title: 'Kafka on the Shore', authorId: 'a2', genres: ['novel', 'fantasy'], price: 450, stock: 0, rating: 4.4, pages: 505, publishedYear: 2002, reviews: [{ user: 'tan', stars: 4 }, { user: 'bee', stars: 5 }] },
  { title: '1Q84', authorId: 'a2', genres: ['novel', 'fantasy'], price: 690, stock: 3, rating: 4.0, pages: 925, publishedYear: 2009, reviews: [{ user: 'tan', stars: 3 }] },
  { title: 'Sapiens', authorId: 'a3', genres: ['non-fiction', 'history'], price: 520, stock: 20, rating: 4.6, pages: 443, publishedYear: 2011, reviews: [{ user: 'mai', stars: 5 }, { user: 'nok', stars: 4 }] },
  { title: 'Homo Deus', authorId: 'a3', genres: ['non-fiction', 'future'], price: 540, stock: 9, rating: 4.2, pages: 450, publishedYear: 2015, reviews: [] },
  { title: 'Clean Code', authorId: 'a4', genres: ['programming', 'non-fiction'], price: 1200, stock: 15, rating: 4.4, pages: 464, publishedYear: 2008, reviews: [{ user: 'dev', stars: 5 }] },
  { title: 'Clean Architecture', authorId: 'a4', genres: ['programming', 'non-fiction'], price: 1150, stock: 2, rating: 4.2, pages: 432, publishedYear: 2017, reviews: [{ user: 'dev', stars: 4 }] },
  { title: 'ความน่าจะเป็น', authorId: 'a5', genres: ['short-stories', 'thai-literature'], price: 220, stock: 6, rating: 4.1, pages: 180, publishedYear: 1999, reviews: [] },
];

const customers = [
  { _id: 'c1', name: 'Nok', email: 'nok@example.com', city: 'Bangkok', joinedAt: new Date('2024-01-15'), tags: ['vip'] },
  { _id: 'c2', name: 'Bee', email: 'bee@example.com', city: 'Chiang Mai', joinedAt: new Date('2024-06-02'), tags: [] },
  { _id: 'c3', name: 'Tan', email: 'tan@example.com', city: 'Bangkok', joinedAt: new Date('2025-02-20'), tags: ['newsletter'] },
  { _id: 'c4', name: 'Mai', email: 'mai@example.com', city: 'Khon Kaen', joinedAt: new Date('2025-08-11'), tags: ['vip', 'newsletter'] },
];

await withDb(async (db) => {
  title('Seeding database: ' + db.databaseName);
  for (const name of ['authors', 'books', 'customers', 'orders', 'accounts']) {
    await db.collection(name).drop().catch(() => {}); // ไม่มีก็ไม่เป็นไร
  }

  await db.collection('authors').insertMany(authors);
  const { insertedIds } = await db.collection('books').insertMany(books);
  await db.collection('customers').insertMany(customers);

  // สร้าง orders โดยอ้างอิง _id ของหนังสือที่เพิ่ง insert
  const bookIds = Object.values(insertedIds);
  const priceOf = (i) => books[i].price;
  const orders = [
    { customerId: 'c1', status: 'paid', createdAt: new Date('2026-07-01'), items: [{ bookId: bookIds[0], qty: 1, price: priceOf(0) }, { bookId: bookIds[5], qty: 1, price: priceOf(5) }] },
    { customerId: 'c2', status: 'paid', createdAt: new Date('2026-07-05'), items: [{ bookId: bookIds[3], qty: 2, price: priceOf(3) }] },
    { customerId: 'c1', status: 'shipped', createdAt: new Date('2026-08-10'), items: [{ bookId: bookIds[7], qty: 1, price: priceOf(7) }] },
    { customerId: 'c3', status: 'pending', createdAt: new Date('2026-08-22'), items: [{ bookId: bookIds[2], qty: 1, price: priceOf(2) }, { bookId: bookIds[4], qty: 1, price: priceOf(4) }] },
    { customerId: 'c4', status: 'paid', createdAt: new Date('2026-09-03'), items: [{ bookId: bookIds[5], qty: 3, price: priceOf(5) }] },
    { customerId: 'c3', status: 'cancelled', createdAt: new Date('2026-09-12'), items: [{ bookId: bookIds[8], qty: 1, price: priceOf(8) }] },
    { customerId: 'c2', status: 'shipped', createdAt: new Date('2026-09-20'), items: [{ bookId: bookIds[1], qty: 1, price: priceOf(1) }, { bookId: bookIds[9], qty: 2, price: priceOf(9) }] },
  ];
  await db.collection('orders').insertMany(orders);

  for (const name of ['authors', 'books', 'customers', 'orders']) {
    console.log(`  ✔ ${name}: ${await db.collection(name).countDocuments()} docs`);
  }
  console.log('\nเสร็จแล้ว! ลองดูข้อมูลได้ที่ http://localhost:8081');
});
