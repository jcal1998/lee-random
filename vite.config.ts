import { defineConfig } from "vitest/config";

export default defineConfig({
  // Caminhos relativos: o site funciona tanto em josecarloslee.online/ quanto em
  // jcal1998.github.io/lee-random/.
  base: "./",
  // Arquivos em public/ (CNAME, robots.txt) são copiados como estão para dist/.
  publicDir: "public",
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/main.ts", "src/vite-env.d.ts"],
    },
  },
});
