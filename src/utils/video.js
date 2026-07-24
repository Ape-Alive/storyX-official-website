/**
 * 国产浏览器 / WebView 视频内联与劫持检测
 *
 * 夸克、UC、小米/华为/vivo 系统浏览器等常会把 <video> 拉起成独立播放页。
 * 系统浏览器 UA 往往伪装成 Chrome，仅靠品牌关键词会漏检，因此 Android / 鸿蒙一律走兼容模式。
 */

/** 明确带品牌标识的劫持型浏览器 / 应用内 WebView */
const HIJACK_BRAND_UA_RE =
  /Quark|UCBrowser|UCWEB|Baidu|baidubrowser|bidubrowser|MQQBrowser|QQBrowser|MiuiBrowser|XiaoMi\/|HuaweiBrowser|VivoBrowser|HeyTapBrowser|OPPOBrowser|SogouMobileBrowser|Mb2345Browser|LieBao|360Browser|QihooBrowser|MicroMessenger|miniProgram|Douyin|Toutiao|NewsArticle|BytedanceWebview|\bswan\b|OpenHarmony|HarmonyOS|HMSCore/i

/**
 * 汇总 UA + Client Hints brands，避免只看 userAgent 漏检
 * @returns {string}
 */
function collectUaBlob() {
  if (typeof navigator === 'undefined') return ''
  const parts = [navigator.userAgent || '', navigator.vendor || '']
  try {
    const brands = navigator.userAgentData?.brands
    if (Array.isArray(brands) && brands.length) {
      parts.push(brands.map((b) => b.brand || '').join(' '))
    }
  } catch (_) {
    /* ignore */
  }
  return parts.join(' ')
}

/**
 * 是否为会强行打开独立视频页的环境（应改用封面背景，不要挂载 video）
 * @returns {boolean}
 */
export function isAggressiveVideoHijackBrowser() {
  const ua = collectUaBlob()
  if (!ua) return false

  if (HIJACK_BRAND_UA_RE.test(ua)) return true

  // Android / 鸿蒙：OEM 系统浏览器常无品牌 token，却仍劫持背景视频
  if (/Android|HarmonyOS|HMSCore|OpenHarmony/i.test(ua)) return true

  return false
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
