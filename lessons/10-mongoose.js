// บทที่ 10: Mongoose — ODM ที่ใช้บ่อยในโปรเจค Node.js/Express
// เพิ่ม schema, validation, default, middleware, populate ให้ MongoDB
import 'dotenv/config';
import mongoose from 'mongoose';
import { uri, dbName } from '../src/db.js';

const authorSchema = new mongoose.Schema({ _id: String, name: String, country: String, born: Number }, { versionKey: false });
const Author = mongoose.model('Author', authorSchema, 'authors');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    authorId: { type: String, ref: 'Author' },
    genres: [String],
    price: { type: Number, required: true, min: [0, 'ราคาต้องไม่ติดลบ'] },
    stock: { type: Number, default: 0 },
    rating: Number,
    reviews: [{ user: String, stars: { type: Number, min: 1, max: 5 } }],
  },
  { timestamps: true },
);

// virtual field — คำนวณ ไม่ได้เก็บจริง
bookSchema.virtual('inStock').get(function () { return this.stock > 0; });
// instance method
bookSchema.methods.avgStars = function () {
  return this.reviews.length ? this.reviews.reduce((s, r) => s + r.stars, 0) / this.reviews.length : null;
};
// static method
bookSchema.statics.cheap = function (max = 300) { return this.find({ price: { $lte: max } }).sort({ price: 1 }); };
// middleware (hook)
bookSchema.pre('save', function () { console.log(`  [pre-save hook] กำลังบันทึก "${this.title}"`); });

const Book = mongoose.model('Book', bookSchema, 'books');

try {
  await mongoose.connect(uri, { dbName });

  console.log('\n=== Query ด้วย Model ===');
  const cheap = await Book.cheap(300).select('title price -_id').lean();
  console.log(cheap);

  console.log('\n=== populate (reference → document) ===');
  // authorId เป็น string ref ไปยัง Author._id
  const b = await Book.findOne({ title: 'Sapiens' }).populate('authorId', 'name country -_id');
  console.log({ title: b.title, author: b.authorId, inStock: b.inStock, avgStars: b.avgStars() });

  console.log('\n=== Validation ===');
  try {
    await Book.create({ title: 'ราคาผิด', price: -5 });
  } catch (e) {
    console.log('  ✘', e.errors.price.message);
  }

  console.log('\n=== create + default + timestamps ===');
  const doc = await Book.create({ title: '  Mongoose Demo  ', price: 99, genres: ['demo'] });
  console.log({ title: doc.title, stock: doc.stock, createdAt: doc.createdAt });
  await Book.deleteOne({ _id: doc._id });

  console.log('\nเปรียบเทียบ: native driver ยืดหยุ่นและเร็ว / Mongoose มีโครงสร้าง เหมาะกับแอปขนาดกลาง-ใหญ่');
} catch (e) {
  console.error('❌', e.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
