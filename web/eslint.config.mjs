import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

export default [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // CLAUDE.md のルールで localStorage をコンポーネント先頭で直接読むため warn に留める
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
]
