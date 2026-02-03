import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/jarayo/', // 이 부분이 있어야 배포 후 화면이 보입니다!
})
