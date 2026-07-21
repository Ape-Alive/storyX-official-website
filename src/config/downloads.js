/**
 * 桌面端应用下载配置（按平台）
 * 填入正式安装包地址后即可生效
 */
export const appDownloads = {
  windows: {
    id: 'windows',
    label: '下载 Windows 应用',
    shortLabel: '下载应用',
    url: ''
  },
  mac: {
    id: 'mac',
    label: '下载 macOS 应用',
    shortLabel: '下载应用',
    url: ''
  }
}

export const detectDesktopPlatform = () => {
  if (typeof navigator === 'undefined') return 'windows'
  const ua = navigator.userAgent.toLowerCase()
  const platform = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase()
  if (platform.includes('mac') || ua.includes('mac os') || ua.includes('macintosh')) {
    return 'mac'
  }
  if (platform.includes('win') || ua.includes('windows')) {
    return 'windows'
  }
  // 其他平台默认提供 Windows 包
  return 'windows'
}

export const getCurrentAppDownload = () => {
  const platform = detectDesktopPlatform()
  return appDownloads[platform] || appDownloads.windows
}
