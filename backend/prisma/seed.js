import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const categories = [
  "Lập trình",
  "Kinh doanh",
  "Kỹ năng sống",
  "Văn học Việt Nam",
  "Văn học nước ngoài",
  "Thiếu nhi",
  "Tâm lý học",
  "Lịch sử",
  "Khoa học",
  "Công nghệ",
  "Marketing",
  "Tài chính",
  "Ngoại ngữ",
  "Sức khỏe",
  "Du lịch",
  "Ẩm thực",
  "Truyện tranh",
  "Giáo dục",
  "Nghệ thuật",
  "Tiểu thuyết"
];

const authors = [
  "Nguyễn Minh Quân",
  "Trần Hà Linh",
  "Lê Bảo An",
  "Phạm Gia Huy",
  "Đỗ Nhật Nam",
  "Hoàng Tuệ Nhi",
  "Vũ Thanh Phong",
  "Bùi Khánh Vy",
  "Đặng Quang Hiếu",
  "Mai Anh Thư",
  "Robert Martin",
  "James Clear",
  "Eric Ries",
  "Dale Carnegie",
  "Daniel Kahneman",
  "Yuval Harari",
  "Haruki Murakami",
  "J. K. Rowling",
  "George Orwell",
  "Paulo Coelho",
  "Malcolm Gladwell",
  "Simon Sinek",
  "Adam Grant",
  "Morgan Housel",
  "Philip Kotler",
  "Seth Godin",
  "Cal Newport",
  "Nassim Taleb",
  "Stephen King",
  "Neil Gaiman"
];

const publishers = [
  "NXB Trẻ",
  "NXB Kim Đồng",
  "NXB Tổng hợp",
  "NXB Lao động",
  "NXB Giáo dục",
  "Alpha Books",
  "First News",
  "O'Reilly",
  "Manning",
  "Penguin Books"
];

const titleTemplates = [
  "Nhập môn {category}",
  "Cẩm nang {category} thực chiến",
  "Tư duy mới về {category}",
  "Bí quyết học {category}",
  "{category} trong đời sống",
  "Hành trình cùng {category}",
  "Nền tảng {category}",
  "Ứng dụng {category} hiện đại",
  "30 ngày với {category}",
  "Thực hành {category}",
  "Góc nhìn mới về {category}",
  "Những bài học {category}",
  "Chuyên sâu về {category}",
  "Bản đồ {category}",
  "Khám phá {category}",
  "Dự án nhỏ về {category}",
  "Đọc nhanh hiểu sâu {category}",
  "Từ cơ bản đến nâng cao {category}",
  "101 ý tưởng {category}",
  "Sổ tay {category}"
];

const coverPhotos = [
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=520&q=80",
  "https://images.unsplash.com/photo-1455885666463-27b9f3d90580?auto=format&fit=crop&w=520&q=80"
];

function coverFor(index) {
  return coverPhotos[index % coverPhotos.length];
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  await prisma.user.createMany({
    data: [
      { name: "Quản trị BookNest", email: "admin@booknest.test", password: adminPassword, role: "ADMIN" },
      {
        name: "Nguyễn Văn A",
        email: "user@booknest.test",
        password: userPassword,
        phone: "0900000000",
        address: "TP. Ho Chi Minh"
      }
    ]
  });

  await prisma.category.createMany({ data: categories.map((name) => ({ name })) });
  await prisma.author.createMany({ data: authors.map((name) => ({ name, bio: `Tác giả ${name}` })) });
  await prisma.publisher.createMany({ data: publishers.map((name) => ({ name })) });

  const categoryRows = await prisma.category.findMany();
  const authorRows = await prisma.author.findMany();
  const publisherRows = await prisma.publisher.findMany();

  const books = [];
  categories.forEach((categoryName, categoryIndex) => {
    titleTemplates.forEach((template, bookIndex) => {
      const title = template.replace("{category}", categoryName);
      const slug = `${slugify(categoryName)}-${slugify(title)}-${bookIndex + 1}`;
      const authorName = authors[(categoryIndex * 3 + bookIndex) % authors.length];
      const publisherName = publishers[(categoryIndex + bookIndex) % publishers.length];
      const price = 65000 + ((categoryIndex * 17 + bookIndex * 11) % 28) * 10000;
      const stock = 12 + ((categoryIndex * 7 + bookIndex * 5) % 45);
      const book = {
        title,
        slug,
        description: `Cuốn sách ${title} cung cấp kiến thức dễ đọc, ví dụ thực tế và gợi ý áp dụng cho người mới bắt đầu. Nội dung phù hợp để học theo từng chương, ghi chú nhanh và sử dụng như tài liệu tham khảo trong học tập hoặc công việc.`,
        price,
        stock,
        pages: 120 + ((categoryIndex * 23 + bookIndex * 19) % 380),
        publishedAt: new Date(2020 + ((categoryIndex + bookIndex) % 5), bookIndex % 12, 1),
        categoryName,
        authorName,
        publisherName
      };

      books.push({
        ...book,
        coverImage: coverFor(books.length),
        categoryId: categoryRows.find((item) => item.name === categoryName).id,
        authorId: authorRows.find((item) => item.name === authorName).id,
        publisherId: publisherRows.find((item) => item.name === publisherName).id
      });
    });
  });

  await prisma.book.createMany({
    data: books.map(({ categoryName, authorName, publisherName, ...book }) => book)
  });

  console.log(`Seeded ${categories.length} categories and ${books.length} books with real photo cover images.`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
