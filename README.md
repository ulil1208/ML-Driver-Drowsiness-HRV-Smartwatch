Deteksi Kantuk Pengemudi Berbasis Smartwatch
Sistem ini mendeteksi kantuk pengemudi menggunakan data fisiologis dari smartwatch (PPG/HRV) dan algoritma machine learning.
​

Deskripsi Singkat
- Menggunakan fitur: HeartRate, StepsTaken, dan Temperature dari smartwatch.
​- Label kantuk dibagi menjadi dua kelas: kantuk rendah dan kantuk tinggi.
​- Dua model utama: Random Forest dan Decision Tree.
​

Metode
- Pra-pemrosesan: pembersihan noise, normalisasi, dan pembagian data latih/uji (mis. 80:20).
​- Penyeimbangan kelas dengan SMOTE pada data training.
​- Evaluasi menggunakan accuracy, precision, recall, F1-score, dan confusion matrix.
​
Hasil Utama
- Kedua model menghasilkan akurasi sekitar 94–95% pada konfigurasi terbaik.
​- Decision Tree sedikit lebih tinggi akurasinya, sedangkan Random Forest lebih stabil dan robust.
​
