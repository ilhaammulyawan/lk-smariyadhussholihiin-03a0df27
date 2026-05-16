
-- Roles enum & table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Domain tables
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pengurus',
  photo_url TEXT,
  greeting TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.lab_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_url TEXT,
  category TEXT NOT NULL DEFAULT 'Pengumuman',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.tik_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'TIK',
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teacher_name TEXT NOT NULL,
  teacher_wa TEXT NOT NULL,
  subject TEXT NOT NULL,
  student_count INT NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE DEFAULT ('LP-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random()*10000)::text, 4, '0')),
  student_name TEXT NOT NULL,
  class TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'baru',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at triggers
CREATE TRIGGER trg_settings_upd BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_lab_info_upd BEFORE UPDATE ON public.lab_info FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_regulations_upd BEFORE UPDATE ON public.regulations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_posts_upd BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_bookings_upd BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_reports_upd BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tik_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles
CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_admin_manage" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- public-read tables (settings, staff, lab_info, regulations, tik_schedule, blocked_dates)
CREATE POLICY "settings_public_read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON public.settings FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "staff_public_read" ON public.staff FOR SELECT USING (true);
CREATE POLICY "staff_admin_write" ON public.staff FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "lab_info_public_read" ON public.lab_info FOR SELECT USING (true);
CREATE POLICY "lab_info_admin_write" ON public.lab_info FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "regulations_public_read" ON public.regulations FOR SELECT USING (true);
CREATE POLICY "regulations_admin_write" ON public.regulations FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "posts_admin_write" ON public.posts FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "tik_public_read" ON public.tik_schedule FOR SELECT USING (true);
CREATE POLICY "tik_admin_write" ON public.tik_schedule FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "blocked_public_read" ON public.blocked_dates FOR SELECT USING (true);
CREATE POLICY "blocked_admin_write" ON public.blocked_dates FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- bookings: public can read (to see slot availability) & create; admin manages
CREATE POLICY "bookings_public_read" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "bookings_public_insert" ON public.bookings FOR INSERT WITH CHECK (status = 'pending');
CREATE POLICY "bookings_admin_update" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "bookings_admin_delete" ON public.bookings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- reports: public can create; only admin reads
CREATE POLICY "reports_public_insert" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "reports_admin_read" ON public.reports FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reports_admin_write" ON public.reports FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reports_admin_delete" ON public.reports FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('public-files', 'public-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_files" ON storage.objects FOR SELECT USING (bucket_id = 'public-files');
CREATE POLICY "public_upload_reports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public-files');
CREATE POLICY "admin_manage_files" ON storage.objects FOR UPDATE USING (bucket_id = 'public-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_delete_files" ON storage.objects FOR DELETE USING (bucket_id = 'public-files' AND public.has_role(auth.uid(), 'admin'));

-- Seed defaults
INSERT INTO public.settings (key, value) VALUES
  ('lab_name', 'Lab Komputer SMA Riyadhussholihiin'),
  ('admin_wa', '628123456789'),
  ('operational_hours', '07:30 - 16:00'),
  ('operational_days', 'Senin - Sabtu'),
  ('visi', 'Menjadi pusat pengembangan literasi digital santri yang unggul, islami, dan berakhlakul karimah.'),
  ('misi', E'1. Menyediakan fasilitas komputasi modern\n2. Membentuk generasi cakap teknologi\n3. Menanamkan adab penggunaan teknologi secara islami\n4. Mendukung pembelajaran kurikulum nasional'),
  ('sambutan', 'Selamat datang di Lab Komputer SMA Riyadhussholihiin. Kami berkomitmen menghadirkan ruang belajar teknologi yang aman, inspiratif, dan berkah bagi seluruh santri.'),
  ('school_address', 'Jl. Pendidikan No. 45, Indonesia'),
  ('school_email', 'labkom@riyadhussholihiin.sch.id'),
  ('lab_total_pc', '42'),
  ('lab_internet', '200 Mbps'),
  ('lab_rooms', '2 Ruangan')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.staff (name, position, role, sort_order, greeting) VALUES
  ('Ust. Ahmad Fauzi, M.T.', 'Kepala Laboratorium Komputer', 'kepala', 0, 'Teknologi adalah wasilah bagi santri untuk menyebarkan kebaikan di era digital. Mari kita gunakan dengan bijak dan bertanggung jawab.'),
  ('Ust. Hanif Rahman, S.Kom', 'Wakil Kepala Lab', 'pengurus', 1, NULL),
  ('Ustz. Maryam Hasna, S.Pd', 'Koordinator Akademik', 'pengurus', 2, NULL),
  ('Ust. Yusuf Ibrahim', 'Teknisi & IT Support', 'pengurus', 3, NULL);

INSERT INTO public.lab_info (category, title, content, sort_order) VALUES
  ('spesifikasi', 'Spesifikasi Komputer', E'• Processor: Intel Core i5 Gen 12\n• RAM: 16 GB DDR4\n• Storage: SSD 512 GB\n• Monitor: 24" Full HD\n• OS: Windows 11 Pro', 0),
  ('fasilitas', 'Fasilitas Pendukung', E'• AC di setiap ruangan\n• Proyektor & layar lebar\n• Printer multifungsi\n• Internet 200 Mbps\n• Akses LMS sekolah\n• Loker penyimpanan', 1);

INSERT INTO public.regulations (title, content, type, sort_order) VALUES
  ('Peraturan Umum', E'1. Masuk lab dengan tertib dan tenang\n2. Tas dan jaket diletakkan di loker\n3. Tidak membawa makanan/minuman ke dalam lab\n4. Menjaga kebersihan dan kerapian ruangan\n5. Mengikuti instruksi guru/pengawas', 'peraturan', 0),
  ('Tata Tertib Penggunaan Komputer', E'1. Login dengan akun masing-masing\n2. Tidak mengubah pengaturan sistem\n3. Tidak menginstal software tanpa izin\n4. Logout setelah selesai\n5. Lapor jika menemukan kerusakan', 'tata_tertib', 1),
  ('Sanksi Pelanggaran', E'• Teguran lisan untuk pelanggaran ringan\n• Teguran tertulis untuk pelanggaran berulang\n• Pelarangan akses lab sementara\n• Ganti rugi untuk kerusakan akibat kelalaian', 'sanksi', 2);

INSERT INTO public.posts (title, slug, content, excerpt, category) VALUES
  ('Workshop Coding Santri Dibuka', 'workshop-coding-santri', 'Pendaftaran workshop Python dasar untuk kelas X dan XI telah dibuka. Daftar segera melalui kepala lab.', 'Pendaftaran workshop Python dasar untuk kelas X dan XI telah dibuka.', 'Kegiatan'),
  ('Pemeliharaan Jaringan Rutin', 'pemeliharaan-jaringan', 'Akan dilakukan upgrade jaringan pada hari Ahad. Akses internet lab mungkin terganggu.', 'Akan dilakukan upgrade jaringan pada hari Ahad.', 'Pengumuman'),
  ('Juara Lomba Desain Poster Dakwah', 'juara-desain-poster', 'Selamat kepada para pemenang lomba desain poster dakwah digital tingkat sekolah.', 'Selamat kepada para pemenang lomba desain poster dakwah digital.', 'Prestasi');

INSERT INTO public.tik_schedule (day_of_week, start_time, end_time, class_name) VALUES
  (1, '07:30', '09:00', 'X-A'),
  (1, '09:15', '10:45', 'X-B'),
  (2, '07:30', '09:00', 'XI-A'),
  (2, '09:15', '10:45', 'XI-B'),
  (3, '07:30', '09:00', 'XII-A'),
  (4, '07:30', '09:00', 'X-C'),
  (5, '07:30', '09:00', 'XI-C'),
  (6, '07:30', '09:00', 'XII-B');
