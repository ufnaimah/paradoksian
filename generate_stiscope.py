import random
import uuid

# Konfigurasi
NUM_STUDENTS = 100
CURRENT_YEAR = 2026

# Kumpulan nama untuk generate nama mahasiswa yang realistis
FIRST_NAMES = ['Rizky', 'Andi', 'Budi', 'Siti', 'Ayu', 'Dimas', 'Putri', 'Muhammad', 'Rina', 'Dwi', 'Kevin', 'Sarah', 'Reza', 'Nisa', 'Fajar', 'Tia', 'Bayu', 'Annisa', 'Eka', 'Aditya']
LAST_NAMES = ['Pratama', 'Saputra', 'Wijaya', 'Sari', 'Lestari', 'Santoso', 'Hidayat', 'Setiawan', 'Ramadhan', 'Kusuma', 'Maulana', 'Nugroho', 'Siregar', 'Wulandari', 'Rahman']

def generate_student_name():
    num_words = random.choices([1, 2], weights=[0.2, 0.8])[0]
    first = random.choice(FIRST_NAMES)
    if num_words == 1:
        return first
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"

def get_kelas_info(tingkat, prodi):
    if prodi == 'D3 Statistika':
        return 'Umum', 'D3'
    if prodi == 'D4 Statistika':
        if tingkat < 3:
            return 'Umum', 'ST'
        else:
            peminatan = random.choice(['Statistika Ekonomi', 'Statistika Kependudukan'])
            singkatan = 'SE' if peminatan == 'Statistika Ekonomi' else 'SK'
            return peminatan, singkatan
    if prodi == 'D4 Komputasi Statistik':
        if tingkat < 3:
            return 'Umum', 'KS'
        else:
            peminatan = random.choice(['Sistem Informasi', 'Sains Data'])
            singkatan = 'SI' if peminatan == 'Sistem Informasi' else 'SD'
            return peminatan, singkatan

def generate_raw_grades(is_teori):
    base = random.gauss(75, 15)
    base = max(40, min(100, base)) 
    
    tugas = max(40, min(100, random.gauss(base + 5, 10)))
    praktikum = 0 if is_teori else max(40, min(100, random.gauss(base, 10)))
    uts = max(40, min(100, random.gauss(base - 5, 12)))
    uas = max(40, min(100, random.gauss(base - 5, 12)))
    
    return round(tugas, 1), round(praktikum, 1), round(uts, 1), round(uas, 1)

# 1. Buka File Output
with open('seed_database.sql', 'w', encoding='utf-8') as f:
    f.write("-- RE-SEED DATABASE STISCOPE (RAW DATA ONLY)\n")
    f.write("TRUNCATE TABLE public.analytics_cache, public.grades, public.enrollments, public.syllabus_config, public.courses, public.mahasiswa, public.dosen, public.admins CASCADE;\n\n")

    # 2. Insert Admins & Dosen
    f.write("INSERT INTO public.admins (admin_id, nama, email) VALUES\n")
    f.write("('A001', 'Admin Pusat STIS', 'admin@stis.ac.id');\n\n")

    dosen_list = [
        ('D001', 'Dr. Sari Permata', '19800101', 'sari@stis.ac.id'),
        ('D002', 'Dr. Budi Santoso', '19750202', 'budi@stis.ac.id'),
        ('D003', 'Prof. Andi Rahman', '19820303', 'andi@stis.ac.id'),
        ('D004', 'Ir. Hendra Pratama', '19780404', 'hendra@stis.ac.id'),
        ('D005', 'M. Farhan, M.Kom', '19850505', 'farhan@stis.ac.id'),
        ('D006', 'Dr. Rina Agustina', '19810606', 'rina@stis.ac.id'),
        ('D007', 'Prof. Dedi Kusnandar', '19730707', 'dedi@stis.ac.id')
    ]
    f.write("INSERT INTO public.dosen (dosen_id, nama, nip, email) VALUES\n")
    f.write(",\n".join([f"('{d[0]}', '{d[1]}', '{d[2]}', '{d[3]}')" for d in dosen_list]) + ";\n\n")

    # 3. Generate Mahasiswa
    mahasiswa_data = []
    class_counter = {} 
    
    # Generate 100 akhiran NIM unik
    unique_nim_suffixes = random.sample(range(1000, 9999), NUM_STUDENTS)
    
    for i in range(NUM_STUDENTS):
        user_id = f"U{str(i+1).zfill(3)}"
        nim = f"22{unique_nim_suffixes[i]}"
        nama = generate_student_name()
        
        tahun_masuk = random.choice([2022, 2023, 2024, 2025])
        tingkat = CURRENT_YEAR - tahun_masuk
        
        # --- PERBAIKAN LOGIKA D3 DI SINI ---
        if tingkat == 4:
            # Jika tingkat 4, hanya boleh D4
            prodi = random.choice(['D4 Statistika', 'D4 Komputasi Statistik'])
        else:
            # Jika tingkat 1, 2, 3, boleh semuanya termasuk D3
            prodi = random.choice(['D3 Statistika', 'D4 Statistika', 'D4 Komputasi Statistik'])
        
        peminatan, singkatan = get_kelas_info(tingkat, prodi)
        
        counter_key = f"{tingkat}{singkatan}"
        if counter_key not in class_counter:
            class_counter[counter_key] = 0
        
        urutan_kelas = (class_counter[counter_key] // 30) + 1
        kelas = f"{tingkat}{singkatan}{urutan_kelas}"
        class_counter[counter_key] += 1
        
        # Batas IPK Baseline di set mulai 2.50 agar logis dengan standar DO
        ipk_base = round(random.uniform(2.5, 4.0), 2)
        email_prefix = nama.lower().replace(" ", "")
        
        mahasiswa_data.append(f"('{user_id}', '{nama}', '{nim}', '{prodi}', '{peminatan}', {tingkat}, 'mahasiswa', {ipk_base}, '{email_prefix}@stis.ac.id', {tahun_masuk}, '{kelas}')")

    f.write("INSERT INTO public.mahasiswa (user_id, nama, nim, prodi, peminatan, tingkat, role, ipk_baseline, email, tahun_masuk, kelas) VALUES\n")
    f.write(",\n".join(mahasiswa_data) + ";\n\n")

    # 4. Generate Courses & Syllabus Config
    courses = [
        ('C001', 'STK101', 'Metode Statistika', 3, 'D3 Statistika', 1, 'D001', 'Praktikum'),
        ('C002', 'STK201', 'Statistika Matematika I', 3, 'D4 Statistika', 3, 'D002', 'Teori'),
        ('C003', 'KS301', 'Data Mining', 3, 'D4 Komputasi Statistik', 5, 'D003', 'Praktikum'),
        ('C004', 'STK302', 'Analisis Deret Waktu', 3, 'D4 Statistika', 5, 'D004', 'Praktikum'),
        ('C005', 'KS201', 'Algoritma Pemrograman', 3, 'D4 Komputasi Statistik', 1, 'D005', 'Praktikum'),
        ('C006', 'STK102', 'Pengantar Demografi', 2, 'D3 Statistika', 1, 'D006', 'Teori'),
        ('C007', 'STK202', 'Aljabar Linier', 3, 'D4 Statistika', 1, 'D007', 'Teori')
    ]
    
    f.write("INSERT INTO public.courses (course_id, kode_matkul, nama_matkul, sks, prodi_target, semester, dosen_id) VALUES\n")
    f.write(",\n".join([f"('{c[0]}', '{c[1]}', '{c[2]}', {c[3]}, '{c[4]}', {c[5]}, '{c[6]}')" for c in courses]) + ";\n\n")
    
    syllabus_data = []
    for c in courses:
        is_teori = (c[7] == 'Teori')
        if is_teori:
            syllabus_data.append(f"('{c[0]}', 30, 0, 35, 35)")
        else:
            syllabus_data.append(f"('{c[0]}', 10, 30, 30, 30)")

    f.write("INSERT INTO public.syllabus_config (course_id, bobot_tugas, bobot_praktikum, bobot_uts, bobot_uas) VALUES\n")
    f.write(",\n".join(syllabus_data) + ";\n\n")

    # 5. Generate Enrollments & Grades (Tanpa Analytics Cache)
    enrollments, grades = [], []
    for i in range(NUM_STUDENTS):
        user_id = f"U{str(i+1).zfill(3)}"
        num_courses_taken = random.choice([3, 4])
        taken_courses = random.sample(courses, num_courses_taken)
        
        for c in taken_courses:
            enrollment_id = f"E{uuid.uuid4().hex[:8].upper()}"
            enrollments.append(f"('{enrollment_id}', '{user_id}', '{c[0]}', 'aktif')")
            
            is_teori = (c[7] == 'Teori')
            t, p, uts, uas = generate_raw_grades(is_teori)
            grades.append(f"('{enrollment_id}', {t}, {p}, {uts}, {uas})")

    f.write("INSERT INTO public.enrollments (enrollment_id, user_id, course_id, status) VALUES\n")
    f.write(",\n".join(enrollments) + ";\n\n")
    
    f.write("INSERT INTO public.grades (enrollment_id, nilai_tugas, nilai_praktikum, nilai_uts, nilai_uas) VALUES\n")
    f.write(",\n".join(grades) + ";\n\n")
    
    f.write("-- Tabel analytics_cache dibiarkan kosong.\n")

print("File seed_database.sql berhasil dibuat! (Tingkat 4 bebas dari D3)")