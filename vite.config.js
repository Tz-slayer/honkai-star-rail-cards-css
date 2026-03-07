import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeBase(path = '/') {
  if (!path) return '/'
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export default defineConfig(({ mode }) => {
  const venv = loadEnv(mode, process.cwd(), '')
  const env = Object.keys(venv)
    .filter((item) => item.startsWith('VITE_'))
    .reduce((current, key) => Object.assign(current, { [key]: venv[key] }), {})

  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const configuredBase = env.VITE_BASE_PATH || (mode === 'production' && repoName ? `/${repoName}/` : '/')

  const htmlPlugin = () => ({
    name: 'html-transform',
    transformIndexHtml(html) {
      return html.replace(/%(.*?)%/g, function (match, p1) {
        return env[p1] ?? ''
      })
    },
  })

  return {
    base: normalizeBase(configuredBase),
    plugins: [react(), htmlPlugin()],
    server: {
      watch: {
        usePolling: false,
      },
    },
  }
})