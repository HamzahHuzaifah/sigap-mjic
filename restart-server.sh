#!/bin/bash
# =============================================================
# SCRIPT DEPLOY & RESTART OTOMATIS - SIGAP MJIC
# Lokasi: /home/mjir4837/repositories/sigap-mjic/restart-server.sh
# Cara pakai di cPanel Terminal:
#   cd ~/repositories/sigap-mjic
#   bash restart-server.sh
# =============================================================

run_deploy() {
  echo "========================================================"
  echo "🚀 MEMULAI UPDATE & RESTART SIGAP MJIC..."
  echo "========================================================"

  # 1. Masuk ke folder root repository
  cd /home/mjir4837/repositories/sigap-mjic 2>/dev/null || cd "$(dirname "$0")"

  # Aktifkan Node.js Virtual Environment cPanel
  source /home/mjir4837/nodevenv/repositories/sigap-mjic/sigap-backend/22/bin/activate 2>/dev/null || true

  # 2. Tarik kode terbaru dari GitHub
  echo ""
  echo "[1/4] 📥 Menarik pembaruan kode dari GitHub..."
  git fetch origin
  git reset --hard origin/main
  echo "✅ Kode repository berhasil disinkronkan."

  # 3. Periksa dependensi Backend
  echo ""
  echo "[2/4] 📦 Memeriksa dependensi Backend..."
  if [ ! -d "sigap-backend/node_modules" ] || [ "$1" = "--install" ]; then
    echo "⚡ Menginstall / memperbarui node_modules backend..."
    cd sigap-backend
    npm install --omit=dev
    cd ..
    echo "✅ Dependensi backend selesai diperbarui."
  else
    echo "⚡ node_modules backend sudah ada (melewati npm install)."
  fi

  # 4. Pastikan folder public & build frontend siap
  echo ""
  echo "[3/4] 🎨 Memverifikasi bundle Frontend..."
  if [ -f "sigap-backend/public/index.html" ]; then
    chmod -R 755 sigap-backend/public 2>/dev/null || true
    echo "✅ Asset Frontend (public/index.html) siap disajikan oleh Express."
  else
    echo "⚠️ PERINGATAN: File sigap-backend/public/index.html tidak ditemukan!"
    echo "   Pastikan sudah build frontend di lokal dan push ke GitHub."
  fi

  # 5. Restart Node.js via Phusion Passenger
  echo ""
  echo "[4/4] 🔄 Merestart Phusion Passenger / Node.js..."
  # Matikan ghost/zombie node processes milik user mjir4837
  # Matikan hanya proses SIGAP secara spesifik tanpa menyentuh SPMB dan SIKMA
  pkill -9 -f "sigap-backend" 2>/dev/null || true
  ps ux | grep 'sigap-backend' | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true

  # Trigger Phusion Passenger untuk memuat ulang kode baru
  mkdir -p sigap-backend/tmp
  touch sigap-backend/tmp/restart.txt
  echo "✅ Trigger restart (tmp/restart.txt) berhasil dibuat."

  # 6. Uji koneksi API
  sleep 3
  echo ""
  echo "🔍 Menguji respons web SIGAP MJIC..."
  HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://sigap.mjic.sch.id/api/students)
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✅ Server AKTIF dan merespons dengan status HTTP $HTTP_CODE!"
  else
    echo "ℹ️ Respons server HTTP code: $HTTP_CODE (Jika baru direstart, silakan buka browser dalam 5 detik)."
  fi

  echo ""
  echo "========================================================"
  echo "🎉 SELESAI! Web SIGAP MJIC siap diakses di:"
  echo "   https://sigap.mjic.sch.id"
  echo "========================================================"
}

run_deploy "$@"
