/**
 * 国产浏览器 / WebView 视频内联与劫持检测
 */

/** 易把 video 拉起成系统/内置播放器的 UA（夸克、UC、百度等） */
const AGGRESSIVE_HIJACK_UA_RE =
  /Quark|UCBrowser|UCWEB|Baidu|baidubrowser|bidubrowser|MQQBrowser|MiuiBrowser|HuaweiBrowser|VivoBrowser|HeyTapBrowser|SogouMobileBrowser|Mb2345Browser|LieBao|QQBrowser/i

/**
 * 是否为会强行打开独立视频页的国产浏览器
 * @returns {boolean}
 */
export function isAggressiveVideoHijackBrowser() {
  if (typeof navigator === 'undefined') return false
  return AGGRESSIVE_HIJACK_UA_RE.test(navigator.userAgent || '')
}

/**
 * 写入 video 防劫持 / 同层播放属性（需在 play 前设置）
 * @param {HTMLVideoElement | null | undefined} video
 */
export function applyInlineVideoAttrs(video) {
  if (!video) return

  const attrs = {
    playsinline: 'true',
    'webkit-playsinline': 'true',
    'x5-playsinline': 'true',
    'x5-video-player-type': 'h5-page',
    'x5-video-player-fullscreen': 'false',
    'x5-video-orientation': 'portrait',
    't7-video-player-type': 'inline',
    'x-webkit-airplay': 'allow',
    controlslist: 'nodownload nofullscreen noremoteplayback',
    disablePictureInPicture: 'true',
  }

  Object.entries(attrs).forEach(([key, value]) => {
    video.setAttribute(key, value)
  })

  video.playsInline = true
  video.disablePictureInPicture = true
  try {
    video.disableRemotePlayback = true
  } catch (_) {
    /* ignore */
  }
}
