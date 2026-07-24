/**
 * 首页故事视频源（单独 chunk，仅在非劫持浏览器动态 import）
 * 不要把 .mp4/.webm 写进首包，避免夸克等扫描地址并拉起播放器
 */
import { cdnUrl } from '@/config/cdn'

export const homeStoryVideoSources = [
  {
    src: cdnUrl('videos/preview/98d72b4844184ef09ac829fd2fc8c29f.webm'),
    type: 'video/webm',
  },
  {
    src: cdnUrl('videos/preview/b1bbff9776834f0fbdf1c453e513579c.mp4'),
    type: 'video/mp4',
  },
]
