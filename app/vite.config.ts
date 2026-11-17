import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' para funcionar em qualquer hospedagem (inclusive subpastas)
export default defineConfig({ plugins: [react()], base: './' })
