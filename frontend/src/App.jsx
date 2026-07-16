import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, BookOpen, Boxes, Building2, CalendarDays, ChartNoAxesCombined, ChevronLeft, ChevronRight, Heart, LogOut, Menu, Minus, PackageCheck, Plus, Search, Shield, ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkles, Star, Truck, UserRound } from "lucide-react";
import { API_URL, SERVER_URL, http } from "./api/http";
import { useAuthStore } from "./stores/authStore";
import { useCartStore } from "./stores/cartStore";

const money = (value) => Number(value || 0).toLocaleString("vi-VN") + " VND";
const imageUrl = (url) => (!url ? "https://placehold.co/420x620?text=Book" : url.startsWith("/uploads") ? SERVER_URL + url : url);
const authErrorText = (error) => {
  const message = error?.response?.data?.message || "";
  if (message.includes("không tồn tại") || message.includes("khong ton tai") || message.includes("không hợp lệ") || message.includes("khong hop le")) {
    return "Phiên đăng nhập đã hết hạn sau khi dữ liệu được làm mới. Vui lòng đăng nhập lại.";
  }
  return message;
};

function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const nav = [
    { label: "Sách", to: "/", Icon: BookOpen },
    { label: "Giỏ hàng", to: "/cart", Icon: ShoppingCart },
    { label: "Đơn hàng", to: "/orders", Icon: ShoppingBag },
    { label: "Hồ sơ", to: "/profile", Icon: UserRound }
  ];
  if (user?.role === "ADMIN") nav.push({ label: "Admin", to: "/admin", Icon: Shield });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4efe6] text-ink">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e6dccb] bg-[#fffaf2]/95 shadow-md shadow-stone-300/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-brand">
            <BookOpen size={24} /> BookNest
          </Link>
          <button className="rounded border p-2 md:hidden" onClick={() => setOpen(!open)}>
            <Menu size={20} />
          </button>
          <nav className={`${open ? "absolute left-0 top-14 grid w-full gap-2 border-b bg-paper p-4" : "hidden"} md:static md:flex md:w-auto md:items-center md:gap-2 md:border-0 md:p-0`}>
            {nav.map(({ label, to, Icon }) => (
              <Link key={to} to={to} className="relative inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-semibold text-stone-700 hover:border-[#d8cdbd] hover:bg-white hover:text-brand">
                <Icon size={16} />
                {label}
                {to === "/cart" && cartCount > 0 ? <span className="ml-0.5 rounded-full bg-gold px-2 py-0.5 text-xs text-ink">{cartCount}</span> : null}
              </Link>
            ))}
            {user ? (
              <button onClick={logout} className="flex items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-semibold text-white shadow-sm">
                <LogOut size={16} /> Đăng xuất
              </button>
            ) : (
              <Link to="/login" className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800">Đăng nhập</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-5 pt-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
        </Routes>
      </main>
    </div>
  );
}

function Protected({ children }) {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const session = useQuery({
    queryKey: ["auth-me", token],
    queryFn: async () => (await http.get("/auth/me")).data,
    enabled: Boolean(token),
    retry: false
  });

  if (!token) return <Navigate to="/login" />;
  if (session.isLoading) return <Empty title="Đang kiểm tra phiên đăng nhập..." />;
  if (session.isError) {
    logout();
    return <Navigate to="/login" />;
  }
  return children;
}

function AdminOnly({ children }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" />;
  return user.role === "ADMIN" ? children : <Navigate to="/" />;
}

function Home() {
  const [params, setParams] = useSearchParams();
  const query = Object.fromEntries(params.entries());
  const { data: books, isLoading } = useQuery({ queryKey: ["books", query], queryFn: async () => (await http.get("/books", { params: query })).data });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: async () => (await http.get("/categories")).data });
  const { data: authors = [] } = useQuery({ queryKey: ["authors"], queryFn: async () => (await http.get("/authors")).data });
  const add = useCartStore((state) => state.add);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    if (key !== "page") next.set("page", "1");
    setParams(next);
  };

  return (
    <div>
      <section className="mb-6 overflow-hidden rounded-lg bg-[#173f3a] text-white shadow-lg">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 md:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-emerald-50">
              <Sparkles size={15} /> Khuyến mãi sách hay mỗi ngày
            </div>
            <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">BookNest - cửa hàng sách cho sinh viên và người yêu tri thức</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/90">Khám phá sách lập trình, kinh doanh, kỹ năng, văn học và hơn 20 thể loại khác với trải nghiệm đặt hàng nhanh gọn.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded bg-white/10 p-3 text-sm"><Truck size={18} /> Giao nhanh</div>
              <div className="flex items-center gap-2 rounded bg-white/10 p-3 text-sm"><ShieldCheck size={18} /> Đơn hàng rõ ràng</div>
              <div className="flex items-center gap-2 rounded bg-white/10 p-3 text-sm"><ShoppingBag size={18} /> 400 sách mẫu</div>
            </div>
          </div>
          <div className="relative min-h-56 overflow-hidden bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#173f3a]/45" />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
      <aside className="h-fit overflow-hidden rounded-xl border border-[#d9c9b2] bg-[#fff8eb] shadow-lg shadow-stone-300/30">
        <div className="bg-[#173f3a] p-4 text-white">
          <div className="flex items-center gap-2 text-base font-bold"><SlidersHorizontal size={18} /> Bộ lọc sách</div>
          <p className="mt-1 text-xs leading-5 text-emerald-50/85">Tìm nhanh sách theo tên, thể loại, tác giả và khoảng giá.</p>
        </div>

        <div className="grid gap-4 p-4">
          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-[#eadcc8]">
            <label className="mb-2 block text-xs font-bold uppercase text-stone-500">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-brand" size={17} />
              <input className="input border-[#cdbb9f] bg-[#fffaf2] pl-9" placeholder="Tên sách hoặc tác giả" defaultValue={query.search || ""} onChange={(e) => updateFilter("search", e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-[#eadcc8]">
            <label className="mb-2 block text-xs font-bold uppercase text-stone-500">Danh mục</label>
            <select className="input border-[#cdbb9f] bg-[#fffaf2]" value={query.categoryId || ""} onChange={(e) => updateFilter("categoryId", e.target.value)}>
              <option value="">Tất cả danh mục</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-[#eadcc8]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase text-stone-500">Tác giả</label>
              {query.authorId ? <button className="text-xs font-semibold text-brand" onClick={() => updateFilter("authorId", "")}>Bỏ chọn</button> : null}
            </div>
            <div className="max-h-44 overflow-y-auto pr-1">
              <button onClick={() => updateFilter("authorId", "")} className={`mb-2 w-full rounded px-3 py-2 text-left text-sm font-semibold transition ${!query.authorId ? "bg-brand text-white" : "bg-[#f4efe6] text-stone-700 hover:bg-[#efe1cc]"}`}>
                Tất cả tác giả
              </button>
              <div className="grid gap-2">
                {authors.map((item) => (
                  <button key={item.id} onClick={() => updateFilter("authorId", String(item.id))} className={`rounded px-3 py-2 text-left text-sm transition ${String(item.id) === query.authorId ? "bg-gold text-ink font-bold" : "bg-[#fff8eb] text-stone-700 hover:bg-[#efe1cc]"}`}>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-[#eadcc8]">
            <label className="mb-2 block text-xs font-bold uppercase text-stone-500">Khoảng giá</label>
            <div className="grid grid-cols-2 gap-2">
              <input className="input border-[#cdbb9f] bg-[#fffaf2]" placeholder="Giá từ" value={query.minPrice || ""} onChange={(e) => updateFilter("minPrice", e.target.value)} />
              <input className="input border-[#cdbb9f] bg-[#fffaf2]" placeholder="Giá đến" value={query.maxPrice || ""} onChange={(e) => updateFilter("maxPrice", e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-[#eadcc8]">
            <label className="mb-2 block text-xs font-bold uppercase text-stone-500">Sắp xếp</label>
            <select className="input border-[#cdbb9f] bg-[#fffaf2]" value={query.sort || "newest"} onChange={(e) => updateFilter("sort", e.target.value)}>
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="title_asc">Tên sách A-Z</option>
            </select>
          </div>

          <button className="rounded bg-[#d99b3d] px-3 py-3 text-sm font-extrabold text-ink shadow-sm transition hover:bg-[#c98928]" onClick={() => setParams(new URLSearchParams({ page: "1" }))}>
            Xóa tất cả bộ lọc
          </button>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Sách nổi bật</h2>
            <p className="text-sm text-stone-600">Tìm sách, xem chi tiết và đặt hàng trong vài bước.</p>
          </div>
          <span className="text-sm text-stone-600">{books?.pagination?.total || 0} sách</span>
        </div>
        {isLoading ? <p>Đang tải...</p> : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 xl:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
              {books?.items?.map((book) => (
                <article key={book.id} className="group overflow-hidden rounded-lg border border-[#e1d6c3] bg-[#fffaf2] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <Link to={`/books/${book.id}`} className="block bg-[#efe7d9] p-3">
                    <img className="mx-auto h-52 w-full max-w-36 rounded object-cover shadow-sm ring-1 ring-black/5 transition group-hover:scale-[1.02]" src={imageUrl(book.coverImage)} />
                  </Link>
                  <div className="p-3">
                    <Link to={`/books/${book.id}`} className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 hover:text-brand">{book.title}</Link>
                    <p className="mt-1 truncate text-xs text-stone-500">{book.author?.name}</p>
                    <p className="mt-2 text-sm font-bold text-brand">{money(book.price)}</p>
                    <button onClick={() => add(book)} className="btn mt-3 h-9 w-full px-3 text-xs shadow-sm"><ShoppingCart size={15} /> Thêm vào giỏ</button>
                  </div>
                </article>
              ))}
            </div>
            <Pagination page={books?.pagination?.page || 1} totalPages={books?.pagination?.totalPages || 1} onPage={(page) => updateFilter("page", String(page))} />
          </>
        )}
      </section>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  const pages = Array.from(
    new Set([1, page - 1, page, page + 1, totalPages].filter((item) => item >= 1 && item <= totalPages))
  ).sort((a, b) => a - b);
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="pager-btn disabled:opacity-40"><ChevronLeft size={16} /></button>
      {pages.map((item, index) => (
        <span key={item} className="flex items-center gap-2">
          {index > 0 && item - pages[index - 1] > 1 ? <span className="px-1 text-stone-400">...</span> : null}
          <button onClick={() => onPage(item)} className={`pager-btn ${page === item ? "bg-brand text-white" : "bg-[#fffaf2]"}`}>
            {item}
          </button>
        </span>
      ))}
      <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="pager-btn disabled:opacity-40"><ChevronRight size={16} /></button>
    </div>
  );
}

function BookDetail() {
  const { id } = useParams();
  const add = useCartStore((state) => state.add);
  const { data: book, isLoading } = useQuery({ queryKey: ["book", id], queryFn: async () => (await http.get(`/books/${id}`)).data });
  if (isLoading) return <p>Đang tải...</p>;
  return (
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-emerald-800">
        <ArrowLeft size={16} /> Quay lại danh sách sách
      </Link>

      <section className="overflow-hidden rounded-lg border border-[#e1d6c3] bg-[#fffaf2] shadow-md">
        <div className="grid gap-0 lg:grid-cols-[390px_minmax(0,1fr)]">
          <div className="bg-[#efe7d9] p-5 md:p-7">
            <img className="mx-auto h-[430px] w-full max-w-[310px] rounded-lg object-cover shadow-lg ring-1 ring-black/10" src={imageUrl(book.coverImage)} />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-stone-600">
              <div className="rounded bg-white/70 p-2"><Truck className="mx-auto mb-1" size={17} /> Giao nhanh</div>
              <div className="rounded bg-white/70 p-2"><BadgeCheck className="mx-auto mb-1" size={17} /> Chính hãng</div>
              <div className="rounded bg-white/70 p-2"><PackageCheck className="mx-auto mb-1" size={17} /> Đóng gói kỹ</div>
            </div>
          </div>

          <div className="p-5 md:p-7">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">{book.category?.name}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-amber-800">
                <Star size={14} fill="currentColor" /> 4.8
              </span>
            </div>
            <h1 className="max-w-3xl text-2xl font-bold leading-tight md:text-4xl">{book.title}</h1>
            <p className="mt-3 text-stone-600">Tác giả: <span className="font-semibold text-stone-800">{book.author?.name}</span></p>
            <p className="mt-4 text-3xl font-extrabold text-brand">{money(book.price)}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoItem icon={Building2} label="Nhà xuất bản" value={book.publisher?.name || "Đang cập nhật"} />
              <InfoItem icon={BookOpen} label="Số trang" value={book.pages ? `${book.pages} trang` : "Đang cập nhật"} />
              <InfoItem icon={CalendarDays} label="Năm phát hành" value={book.publishedAt ? new Date(book.publishedAt).getFullYear() : "Đang cập nhật"} />
              <InfoItem icon={PackageCheck} label="Tồn kho" value={`${book.stock} cuốn`} />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => add(book)} className="btn h-12 flex-1 text-base shadow-sm"><ShoppingCart size={20} /> Thêm vào giỏ</button>
              <button onClick={() => add(book)} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded border border-brand bg-white px-4 text-base font-bold text-brand hover:bg-brand/5">
                <Heart size={19} /> Lưu sách
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-[#e1d6c3] bg-[#fffaf2] p-5 shadow-sm">
          <h2 className="text-lg font-bold">Mô tả sản phẩm</h2>
          <p className="mt-3 leading-7 text-stone-700">{book.description || "Chưa có mô tả cho cuốn sách này."}</p>
          <ul className="mt-4 grid gap-2 text-sm text-stone-700">
            <li>• Phù hợp cho sinh viên, người đi làm và bạn đọc muốn mở rộng kiến thức.</li>
            <li>• Nội dung được trình bày dễ đọc, có tính ứng dụng và phù hợp để tự học.</li>
            <li>• Có thể thêm vào giỏ hàng, đặt mua và tải hóa đơn PDF sau khi đặt hàng thành công.</li>
          </ul>
        </div>
        <aside className="rounded-lg border border-[#e1d6c3] bg-[#173f3a] p-5 text-white shadow-sm">
          <h2 className="text-lg font-bold">Ưu đãi BookNest</h2>
          <div className="mt-4 grid gap-3 text-sm text-emerald-50">
            <div className="rounded bg-white/10 p-3">Miễn phí đổi trả nếu đơn hàng bị lỗi do vận chuyển.</div>
            <div className="rounded bg-white/10 p-3">Hỗ trợ xuất hóa đơn PDF ngay sau khi đặt hàng.</div>
            <div className="rounded bg-white/10 p-3">Giao diện responsive cho mobile, tablet và desktop.</div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded border border-[#e1d6c3] bg-white/70 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-stone-500">
        <Icon size={15} /> {label}
      </div>
      <p className="mt-1 font-bold text-stone-800">{value}</p>
    </div>
  );
}

function Cart() {
  const { items, updateQuantity, remove } = useCartStore();
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [items]);
  if (!items.length) return <Empty title="Giỏ hàng đang trống" />;
  return (
    <div>
      <div className="mb-5 rounded-lg bg-[#173f3a] p-5 text-white shadow-md">
        <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
        <p className="mt-1 text-sm text-emerald-50/85">Kiểm tra lại sách, số lượng và tổng tiền trước khi đặt hàng.</p>
      </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-lg border border-[#d9c9b2] bg-[#fff8eb] p-4 shadow-sm">
            <img className="h-32 w-24 rounded-lg object-cover shadow-sm" src={imageUrl(item.coverImage)} />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{item.author?.name || "BookNest"}</p>
                <p className="mt-2 font-bold text-brand">{money(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={16} /></button>
                <span className="w-10 rounded bg-white py-1 text-center font-bold">{item.quantity}</span>
                <button className="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></button>
                <button className="ml-3 rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100" onClick={() => remove(item.id)}>Xóa</button>
              </div>
            </div>
          </div>
        ))}
      </section>
      <aside className="h-fit rounded-lg border border-[#d9c9b2] bg-[#fff8eb] p-5 shadow-md">
        <p className="text-sm font-bold uppercase text-stone-500">Tóm tắt đơn hàng</p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><span>Số sản phẩm</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
          <div className="flex justify-between"><span>Tạm tính</span><strong>{money(total)}</strong></div>
          <div className="flex justify-between text-brand"><span>Phí vận chuyển</span><strong>Miễn phí</strong></div>
        </div>
        <div className="mt-4 border-t border-[#d9c9b2] pt-4">
          <p className="text-sm text-stone-600">Tổng thanh toán</p>
          <p className="mt-1 text-3xl font-extrabold text-brand">{money(total)}</p>
        </div>
        <Link to="/checkout" className="btn mt-4 h-12 w-full text-base">Đặt hàng</Link>
      </aside>
    </div>
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { items, clear } = useCartStore();
  const [form, setForm] = useState({ receiverName: user?.name || "", receiverPhone: user?.phone || "", shippingAddress: user?.address || "", note: "" });
  const [formError, setFormError] = useState("");
  const checkoutProfile = useQuery({
    queryKey: ["checkout-profile"],
    queryFn: async () => (await http.get("/auth/me")).data,
    retry: false
  });
  const profileUser = checkoutProfile.data?.user;
  useEffect(() => {
    if (!profileUser) return;
    updateUser(profileUser);
    setForm((current) => ({
      receiverName: current.receiverName || profileUser.name || "",
      receiverPhone: current.receiverPhone || profileUser.phone || "",
      shippingAddress: current.shippingAddress || profileUser.address || "",
      note: current.note || ""
    }));
  }, [profileUser, updateUser]);
  const order = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        receiverName: form.receiverName.trim(),
        receiverPhone: form.receiverPhone.trim(),
        shippingAddress: form.shippingAddress.trim(),
        note: form.note.trim(),
        items: items.map(({ id, quantity }) => ({ bookId: id, quantity }))
      };
      return (await http.post("/orders", payload)).data;
    },
    onSuccess: (data) => { clear(); navigate(`/orders?success=${data.id}`); }
  });
  if (!items.length) return <Navigate to="/cart" />;
  const submitOrder = () => {
    setFormError("");
    if (!form.receiverName.trim()) return setFormError("Vui lòng nhập tên người nhận.");
    if (!form.receiverPhone.trim() || form.receiverPhone.trim().length < 8) return setFormError("Vui lòng nhập số điện thoại hợp lệ.");
    if (!form.shippingAddress.trim()) return setFormError("Vui lòng nhập địa chỉ nhận hàng.");
    order.mutate();
  };
  const orderError = formError || authErrorText(order.error);
  return (
    <FormCard title="Thông tin nhận hàng" error={orderError}>
      <input className="input" placeholder="Người nhận" value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} />
      <input className="input" placeholder="Số điện thoại" value={form.receiverPhone} onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })} />
      <input className="input" placeholder="Địa chỉ nhận hàng" value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
      <input className="input" placeholder="Ghi chú" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      {orderError?.includes("Giỏ hàng") ? (
        <button className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700" onClick={() => { clear(); navigate("/"); }}>
          Xóa giỏ hàng và chọn lại sách
        </button>
      ) : null}
      <button className="btn w-full" onClick={submitOrder} disabled={order.isPending}>{order.isPending ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}</button>
    </FormCard>
  );
}

function Orders() {
  const [params] = useSearchParams();
  const { data = [] } = useQuery({ queryKey: ["my-orders"], queryFn: async () => (await http.get("/orders/mine")).data });
  return (
    <div>
      <div className="mb-5 rounded-lg bg-[#173f3a] p-5 text-white shadow-md">
        <h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
        <p className="mt-1 text-sm text-emerald-50/85">Theo dõi trạng thái đơn và tải hóa đơn PDF sau khi đặt hàng.</p>
      </div>
      {params.get("success") && <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 font-semibold text-green-700">Đặt hàng thành công. Bạn có thể tải hóa đơn PDF bên dưới.</div>}
      <OrderTable orders={data} invoice />
    </div>
  );
}

function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", address: user?.address || "" });
  const profile = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => (await http.get("/auth/me")).data,
    onSuccess: (data) => {
      updateUser(data.user);
      setForm({ name: data.user?.name || "", phone: data.user?.phone || "", address: data.user?.address || "" });
    },
    retry: false
  });
  const mutation = useMutation({ mutationFn: async () => (await http.put("/auth/profile", form)).data, onSuccess: (data) => updateUser(data.user) });
  if (profile.isLoading) return <Empty title="Đang tải thông tin cá nhân..." />;
  return (
    <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg bg-[#173f3a] p-5 text-white shadow-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl font-black text-ink">{form.name?.[0]?.toUpperCase() || "U"}</div>
        <h1 className="mt-4 text-xl font-bold">{form.name || "Người dùng BookNest"}</h1>
        <p className="mt-1 text-sm text-emerald-50/85">Cập nhật thông tin để đặt hàng nhanh hơn.</p>
      </aside>
      <FormCard title="Thông tin cá nhân" error={authErrorText(mutation.error || profile.error)} success={mutation.isSuccess ? "Đã cập nhật hồ sơ" : ""}>
        {["name", "phone", "address"].map((key) => (
          <input key={key} className="input" placeholder={{ name: "Họ tên", phone: "Số điện thoại", address: "Địa chỉ" }[key]} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        ))}
        <button className="btn w-full" onClick={() => mutation.mutate()}>Lưu thay đổi</button>
      </FormCard>
    </div>
  );
}

function Auth({ mode }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const mutation = useMutation({
    mutationFn: async () => (await http.post(`/auth/${mode}`, form)).data,
    onSuccess: (data) => { setAuth(data); navigate(data.user.role === "ADMIN" ? "/admin" : "/"); }
  });
  const title = mode === "login" ? "Đăng nhập" : "Đăng ký";
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-xl border border-[#d9c9b2] bg-[#fff8eb] shadow-xl lg:grid-cols-[1fr_0.9fr]">
      <section className="relative min-h-[460px] bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-[#173f3a]/75" />
        <div className="relative flex h-full flex-col justify-end p-8 text-white">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            <BookOpen size={15} /> BookNest Library
          </div>
          <h1 className="max-w-md text-4xl font-black leading-tight">Mở cánh cửa tri thức với những cuốn sách hay</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-emerald-50/90">Đăng nhập để lưu giỏ hàng, theo dõi đơn mua sách và tải hóa đơn nhanh chóng.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded bg-white/10 p-3 text-sm font-semibold">400 sách mẫu</div>
            <div className="rounded bg-white/10 p-3 text-sm font-semibold">20 thể loại</div>
            <div className="rounded bg-white/10 p-3 text-sm font-semibold">PDF hóa đơn</div>
          </div>
        </div>
      </section>
      <section className="p-6 md:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-brand">{mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}</p>
          <h2 className="mt-1 text-3xl font-black">{title}</h2>
          <p className="mt-2 text-sm text-stone-600">{mode === "login" ? "Tiếp tục mua sách và xem lịch sử đơn hàng của bạn." : "Tạo tài khoản để bắt đầu mua sách tại BookNest."}</p>
        </div>
        {mutation.error?.response?.data?.message ? <p className="mb-3 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{mutation.error.response.data.message}</p> : null}
        <div className="grid gap-3">
          {mode === "register" && <input className="input bg-white" placeholder="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
          <input className="input bg-white" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input bg-white" type="password" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn h-12 w-full text-base" onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? "Đang xử lý..." : title}</button>
          <Link className="text-center text-sm font-semibold text-brand hover:text-emerald-800" to={mode === "login" ? "/register" : "/login"}>
            {mode === "login" ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
          </Link>
        </div>
      </section>
    </div>
  );
}

function Admin() {
  const [tab, setTab] = useState("dashboard");
  const tabs = [
    ["dashboard", "Thống kê", ChartNoAxesCombined],
    ["books", "Sách", BookOpen],
    ["catalog", "Danh mục", Boxes],
    ["orders", "Đơn hàng", ShoppingCart],
    ["users", "Người dùng", UserRound]
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded border bg-white p-3">
        {tabs.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`mb-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left ${tab === key ? "bg-brand text-white" : "hover:bg-stone-50"}`}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </aside>
      <section>
        {tab === "dashboard" && <AdminDashboard />}
        {tab === "books" && <AdminBooks />}
        {tab === "catalog" && <AdminCatalog />}
        {tab === "orders" && <AdminOrders />}
        {tab === "users" && <AdminUsers />}
      </section>
    </div>
  );
}

function AdminDashboard() {
  const { data } = useQuery({ queryKey: ["admin-dashboard"], queryFn: async () => (await http.get("/admin/dashboard")).data });
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Doanh thu" value={money(data?.revenue)} />
        <Stat label="Đơn hàng" value={data?.orders || 0} />
        <Stat label="Sách" value={data?.books || 0} />
        <Stat label="Người dùng" value={data?.users || 0} />
      </div>
      <h2 className="mt-6 font-semibold">Sách bán chạy</h2>
      <div className="mt-3 grid gap-2">{data?.bestSellers?.map((item) => <div className="rounded border bg-white p-3" key={item.book?.id}>{item.book?.title} · {item.sold} cuốn</div>)}</div>
    </div>
  );
}

function AdminBooks() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", price: "", stock: "", description: "", categoryId: "", authorId: "", publisherId: "" });
  const [cover, setCover] = useState(null);
  const emptyBookForm = { title: "", price: "", stock: "", description: "", categoryId: "", authorId: "", publisherId: "" };
  const { data } = useQuery({ queryKey: ["books-admin"], queryFn: async () => (await http.get("/books", { params: { limit: 50 } })).data });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: async () => (await http.get("/categories")).data });
  const { data: authors = [] } = useQuery({ queryKey: ["authors"], queryFn: async () => (await http.get("/authors")).data });
  const { data: publishers = [] } = useQuery({ queryKey: ["publishers"], queryFn: async () => (await http.get("/publishers")).data });
  const save = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      if (cover) fd.append("cover", cover);
      return editing ? http.put(`/books/${editing.id}`, fd) : http.post("/books", fd);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["books-admin"] }); setEditing(null); setForm(emptyBookForm); setCover(null); }
  });
  const remove = useMutation({ mutationFn: (id) => http.delete(`/books/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ["books-admin"] }) });
  const edit = (book) => { setEditing(book); setCover(null); setForm({ title: book.title, price: book.price, stock: book.stock, description: book.description || "", categoryId: book.categoryId, authorId: book.authorId, publisherId: book.publisherId }); };
  const closeEdit = () => { setEditing(null); setCover(null); setForm(emptyBookForm); };
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Quản lý sách</h1>
      <div className="mb-4 overflow-hidden rounded-lg border border-[#d9c9b2] bg-[#fff8eb] shadow-sm">
        <div className="bg-[#173f3a] px-4 py-3 text-white">
          <h2 className="font-bold">Thêm sách mới</h2>
          <p className="text-xs text-emerald-50/85">Nhập thông tin cơ bản và chọn ảnh bìa cho sách.</p>
        </div>
      <div className="grid gap-3 p-4 md:grid-cols-3">
        <input className="input" placeholder="Tên sách" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input" placeholder="Giá" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input className="input" placeholder="Tồn kho" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Danh mục</option>{categories.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select className="input" value={form.authorId} onChange={(e) => setForm({ ...form, authorId: e.target.value })}><option value="">Tác giả</option>{authors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <select className="input" value={form.publisherId} onChange={(e) => setForm({ ...form, publisherId: e.target.value })}><option value="">NXB</option>{publishers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <input className="input md:col-span-2" placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" type="file" onChange={(e) => setCover(e.target.files?.[0])} />
        <button className="btn md:col-span-3" onClick={() => save.mutate()} disabled={save.isPending || editing}>{save.isPending && !editing ? "Đang thêm..." : "Thêm sách"}</button>
      </div>
      </div>
      <DataTable rows={data?.items || []} columns={["title", "price", "stock"]} labels={{ title: "Tên sách", price: "Giá", stock: "Tồn kho" }} actions={(book) => (
        <>
          <button className="text-brand" onClick={() => edit(book)}>Sửa</button>
          <button className="text-red-600" onClick={() => remove.mutate(book.id)}>Xóa</button>
        </>
      )} />
      {editing ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#d9c9b2] bg-[#fff8eb] shadow-2xl">
            <div className="flex items-start justify-between gap-4 bg-[#173f3a] px-5 py-4 text-white">
              <div>
                <h2 className="text-xl font-bold">Sửa thông tin sách</h2>
                <p className="text-sm text-emerald-50/85">Cập nhật nội dung, giá, tồn kho và ảnh bìa mới.</p>
              </div>
              <button className="rounded bg-white/10 px-3 py-1 text-sm font-bold hover:bg-white/20" onClick={closeEdit}>Đóng</button>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-[190px_1fr]">
              <div>
                <p className="mb-2 text-sm font-bold text-stone-700">Ảnh hiện tại</p>
                <img className="h-64 w-full rounded-lg object-cover shadow-sm ring-1 ring-[#d9c9b2]" src={imageUrl(editing.coverImage)} />
                <label className="mt-4 block text-sm font-bold text-stone-700">Cập nhật ảnh bìa</label>
                <input className="input mt-2" type="file" onChange={(e) => setCover(e.target.files?.[0])} />
                {cover ? <p className="mt-2 text-xs font-semibold text-brand">Ảnh mới: {cover.name}</p> : null}
              </div>
              <div className="grid gap-3">
                <input className="input" placeholder="Tên sách" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="input" placeholder="Giá" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  <input className="input" placeholder="Tồn kho" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Danh mục</option>{categories.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                  <select className="input" value={form.authorId} onChange={(e) => setForm({ ...form, authorId: e.target.value })}><option value="">Tác giả</option>{authors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                  <select className="input" value={form.publisherId} onChange={(e) => setForm({ ...form, publisherId: e.target.value })}><option value="">NXB</option>{publishers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                </div>
                <textarea className="input min-h-32" placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button className="btn flex-1" onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Đang cập nhật..." : "Cập nhật sách"}</button>
                  <button className="flex-1 rounded border border-[#cdbb9f] bg-white px-4 py-2 text-sm font-bold text-stone-700 hover:border-brand hover:text-brand" onClick={closeEdit}>Hủy</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminCatalog() {
  return <div className="grid gap-4 md:grid-cols-3"><CatalogBox title="Danh mục" endpoint="categories" /><CatalogBox title="Tác giả" endpoint="authors" /><CatalogBox title="Nhà xuất bản" endpoint="publishers" /></div>;
}

function CatalogBox({ title, endpoint }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const { data = [] } = useQuery({ queryKey: [endpoint], queryFn: async () => (await http.get(`/${endpoint}`)).data });
  const create = useMutation({ mutationFn: () => http.post(`/${endpoint}`, { name }), onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: [endpoint] }); } });
  const remove = useMutation({ mutationFn: (id) => http.delete(`/${endpoint}/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] }) });
  return (
    <div className="rounded border bg-white p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="mb-3 flex gap-2"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên mới" /><button className="btn" onClick={() => create.mutate()}>Thêm</button></div>
      {data.map((item) => <div key={item.id} className="flex justify-between border-t py-2 text-sm"><span>{item.name}</span><button className="text-red-600" onClick={() => remove.mutate(item.id)}>Xóa</button></div>)}
    </div>
  );
}

function AdminOrders() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: async () => (await http.get("/orders")).data });
  const update = useMutation({ mutationFn: ({ id, status }) => http.patch(`/orders/${id}/status`, { status }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }) });
  return <OrderTable orders={data} admin onStatus={(id, status) => update.mutate({ id, status })} invoice />;
}

function AdminUsers() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await http.get("/admin/users")).data });
  const role = useMutation({ mutationFn: ({ id, value }) => http.patch(`/admin/users/${id}/role`, { role: value }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }) });
  const remove = useMutation({ mutationFn: (id) => http.delete(`/admin/users/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }) });
  return <DataTable rows={data} columns={["name", "email", "role"]} actions={(user) => <><button className="text-brand" onClick={() => role.mutate({ id: user.id, value: user.role === "ADMIN" ? "USER" : "ADMIN" })}><Shield size={16} /></button><button className="text-red-600" onClick={() => remove.mutate(user.id)}>Xóa</button></>} />;
}

function OrderTable({ orders, admin, onStatus, invoice }) {
  const token = useAuthStore((state) => state.token);
  if (!orders.length) return <Empty title="Chưa có đơn hàng" />;
  return (
    <div className="overflow-x-auto rounded-lg border border-[#d9c9b2] bg-[#fff8eb] shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[#173f3a] text-white"><tr><th className="p-3">Mã</th><th>Khách hàng</th><th>Tổng</th><th>Trạng thái</th><th>Ngày</th><th></th></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-3">#{order.id}</td>
              <td>{order.receiverName}</td>
              <td>{money(order.total)}</td>
              <td>{admin ? <select className="input max-w-40" value={order.status} onChange={(e) => onStatus(order.id, e.target.value)}>{["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"].map((x) => <option key={x}>{x}</option>)}</select> : <span className="rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-amber-800">{order.status}</span>}</td>
              <td>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
              <td>{invoice && <a className="font-semibold text-brand" href={`${API_URL}/orders/${order.id}/invoice?token=${token}`} target="_blank">Hóa đơn PDF</a>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DataTable({ rows, columns, labels = {}, actions }) {
  return (
    <div className="overflow-x-auto rounded border bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-stone-50"><tr>{columns.map((column) => <th className="p-3" key={column}>{labels[column] || column}</th>)}<th></th></tr></thead>
        <tbody>{rows.map((row) => <tr className="border-t" key={row.id}>{columns.map((column) => <td className="p-3" key={column}>{column === "price" ? money(row[column]) : row[column]}</td>)}<td className="flex gap-3 p-3">{actions?.(row)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="rounded border bg-white p-4"><p className="text-sm text-stone-600">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}

function FormCard({ title, children, error, success }) {
  return <div className="mx-auto grid max-w-md gap-3 rounded border bg-white p-5"><h1 className="text-2xl font-bold">{title}</h1>{error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}{success && <p className="rounded bg-green-50 p-2 text-sm text-green-700">{success}</p>}{children}</div>;
}

function Empty({ title }) {
  return <div className="rounded border bg-white p-8 text-center text-stone-600">{title}</div>;
}

export default function App() {
  return <Layout />;
}
