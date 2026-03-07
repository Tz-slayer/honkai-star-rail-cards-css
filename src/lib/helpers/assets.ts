const ABSOLUTE_URL_PATTERN = /^(?:[a-z]+:)?\/\//i

export function withBase(path: string): string {
  if (!path) return import.meta.env.BASE_URL
  if (ABSOLUTE_URL_PATTERN.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }

  const normalizedPath = path.replace(/^public\//, '').replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${normalizedPath}`
}