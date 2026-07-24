/**
 * 桌面端应用下载配置
 *
 * 发布规范（与 GitHub Release 资源名一致）：
 *   macOS Apple Silicon → huihuoai-{version}-arm64.dmg
 *   macOS Intel         → huihuoai-{version}-x64.dmg
 *   Windows x64（预留） → huihuoai-{version}-x64.exe
 *   Windows arm64（预留）→ huihuoai-{version}-arm64.exe
 */
export const APP_RELEASE_VERSION = '1.0.0'
export const APP_RELEASE_TAG = `v${APP_RELEASE_VERSION}`
export const APP_RELEASE_BASE =
  `https://github.com/Ape-Alive/huihuoai/releases/download/${APP_RELEASE_TAG}`

const assetUrl = (filename) => `${APP_RELEASE_BASE}/${filename}`

/**
 * @typedef {'mac-arm64' | 'mac-x64' | 'windows-x64' | 'windows-arm64'} AppDownloadId
 * @typedef {{
 *   id: AppDownloadId
 *   os: 'mac' | 'windows'
 *   arch: 'arm64' | 'x64'
 *   label: string
 *   shortLabel: string
 *   badge: string
 *   url: string
 *   available: boolean
 * }} AppDownloadInfo
 */

/** @type {Record<AppDownloadId, AppDownloadInfo>} */
export const appDownloads = {
  'mac-arm64': {
    id: 'mac-arm64',
    os: 'mac',
    arch: 'arm64',
    label: '下载 macOS 应用（Apple Silicon）',
    shortLabel: '下载应用',
    badge: 'Mac M',
    url: assetUrl(`huihuoai-${APP_RELEASE_VERSION}-arm64.dmg`),
    available: true,
  },
  'mac-x64': {
    id: 'mac-x64',
    os: 'mac',
    arch: 'x64',
    label: '下载 macOS 应用（Intel）',
    shortLabel: '下载应用',
    badge: 'Mac Intel',
    url: assetUrl(`huihuoai-${APP_RELEASE_VERSION}-x64.dmg`),
    available: true,
  },
  'windows-x64': {
    id: 'windows-x64',
    os: 'windows',
    arch: 'x64',
    label: '下载 Windows 应用',
    shortLabel: '下载应用',
    badge: 'Win',
    url: assetUrl(`huihuoai-${APP_RELEASE_VERSION}-x64.exe`),
    available: true,
  },
  'windows-arm64': {
    id: 'windows-arm64',
    os: 'windows',
    arch: 'arm64',
    label: '下载 Windows 应用（ARM）',
    shortLabel: '下载应用',
    badge: 'Win ARM',
    url: assetUrl(`huihuoai-${APP_RELEASE_VERSION}-arm64.exe`),
    available: false,
  },
}

/**
 * @returns {'mac' | 'windows'}
 */
export const detectDesktopOs = () => {
  if (typeof navigator === 'undefined') return 'windows'
  const ua = navigator.userAgent.toLowerCase()
  const platform = (
    navigator.userAgentData?.platform ||
    navigator.platform ||
    ''
  ).toLowerCase()

  if (platform.includes('mac') || ua.includes('mac os') || ua.includes('macintosh')) {
    return 'mac'
  }
  if (platform.includes('win') || ua.includes('windows')) {
    return 'windows'
  }
  return 'windows'
}

/** @deprecated 使用 detectDesktopOs */
export const detectDesktopPlatform = () => detectDesktopOs()

/**
 * 同步推断 CPU 架构（尽量准确；Mac 上 platform 常伪报 MacIntel）
 * @param {'mac' | 'windows'} [os]
 * @returns {'arm64' | 'x64'}
 */
export const detectCpuArch = (os = detectDesktopOs()) => {
  if (typeof navigator === 'undefined') {
    return os === 'mac' ? 'arm64' : 'x64'
  }

  const ua = navigator.userAgent || ''
  const platform = navigator.platform || ''

  if (/aarch64|arm64|Apple Silicon/i.test(ua) || /arm64/i.test(platform)) {
    return 'arm64'
  }
  if (/Win64|WOW64|x86_64|x64/i.test(ua) && !/arm/i.test(ua)) {
    return 'x64'
  }

  // WebGL：Apple M 系列 / Apple GPU 多为 Apple Silicon
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    if (ext && gl) {
      const renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '')
      if (/Apple\s+M\d|Apple GPU/i.test(renderer)) return 'arm64'
      if (/Intel|AMD|NVIDIA/i.test(renderer) && os === 'mac') return 'x64'
    }
  } catch (_) {
    /* ignore */
  }

  // 2026：Mac 默认 Apple Silicon；Windows 默认 x64
  return os === 'mac' ? 'arm64' : 'x64'
}

/**
 * 异步读取 Client Hints 架构（更准），失败则回退同步推断
 * @param {'mac' | 'windows'} [os]
 * @returns {Promise<'arm64' | 'x64'>}
 */
export const detectCpuArchAsync = async (os = detectDesktopOs()) => {
  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const { architecture } = await navigator.userAgentData.getHighEntropyValues([
        'architecture',
      ])
      if (architecture && /arm/i.test(architecture)) return 'arm64'
      if (architecture && /x86|x64|amd64/i.test(architecture)) return 'x64'
    }
  } catch (_) {
    /* ignore */
  }
  return detectCpuArch(os)
}

/**
 * @param {'mac' | 'windows'} os
 * @param {'arm64' | 'x64'} arch
 * @returns {AppDownloadInfo}
 */
export const resolveAppDownload = (os, arch) => {
  const id = /** @type {AppDownloadId} */ (`${os}-${arch}`)
  return appDownloads[id] || (os === 'mac' ? appDownloads['mac-arm64'] : appDownloads['windows-x64'])
}

/** 同步解析当前环境对应的安装包 */
export const getCurrentAppDownload = () => {
  const os = detectDesktopOs()
  const arch = detectCpuArch(os)
  return resolveAppDownload(os, arch)
}

/** 异步精炼架构后再解析（推荐在 UI 挂载后调用） */
export const getCurrentAppDownloadAsync = async () => {
  const os = detectDesktopOs()
  const arch = await detectCpuArchAsync(os)
  return resolveAppDownload(os, arch)
}
