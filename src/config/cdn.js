/** 统一媒体 CDN */
export const CDN_BASE = 'https://cdn.huihuoai.com'

export const cdnUrl = (path) =>
  `${CDN_BASE}/${String(path).replace(/^\/+/, '')}`

/** 页面 Hero 背景图 */
export const BANNER_IMAGE = cdnUrl(
  'images/avatar/054507226b1d4b3aac3701a4661282cd.webp',
)

/** 制作流程页阶段配图（原 public/images/*.webp） */
export const WORKFLOW_IMAGES = {
  storyWriting: cdnUrl('images/cover/c77f99dd1e564302890fed3c928d1cfa.webp'),
  visualDirection: cdnUrl('images/cover/8b5a069d34e34c329f6526b5bd372bfc.webp'),
  storyboard: cdnUrl('images/cover/4163f361091f44e28b0f7668d17dd637.webp'),
  assetCreation: cdnUrl('images/cover/618aec38b5424c27a1ba92e962c899f2.webp'),
  avGeneration: cdnUrl('images/cover/5590a98e6f1e45d1884e5a54cbe29ae5.webp'),
  composePreview: cdnUrl('images/cover/31f820fbb76f4fe597c6c9dd5c56a313.webp'),
}

/** 首页故事视频（原 public/videos/*） */
export const HOME_STORY_MEDIA = {
  poster: cdnUrl('images/cover/b5895546d6cf45059aec103133f32b52.jpg'),
  webm: cdnUrl('videos/preview/98d72b4844184ef09ac829fd2fc8c29f.webm'),
  mp4: cdnUrl('videos/preview/b1bbff9776834f0fbdf1c453e513579c.mp4'),
}
