import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tokokue.kasirku',
  appName: 'Kasir Toko Berkah - Bahan Kue & Plastik',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
