/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NO_OBS: boolean
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}