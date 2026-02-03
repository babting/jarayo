import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // TODO: 만약 GitHub 저장소 이름이 'omniscient-baby-view'가 아니라면 아래 값을 실제 저장소 이름으로 변경해주세요.
    // 예: base: '/my-repo-name/'
    base: '/jarayo/',
    build: {
      outDir: 'dist'
    }
  };
});
