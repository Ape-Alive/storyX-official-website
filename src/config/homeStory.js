/**
 * 首页故事视频分段配置
 *
 * 修改 segments 即可调整每一段的起止时间与文案。
 * - start / end：秒，按视频真实时间轴
 * - label：底部时间轴显示名
 * - theme：核心主题（eyebrow）
 * - title：网站主标题
 * - desc：副标题
 * - cta：主入口按钮文案
 * - ctaLink：主入口跳转
 * - links：可挂载入口 [{ label, to }]
 *
 * 跳转约定（首页不直接进登录/注册页）：
 * - 功能体验 / 创作能力 → /workflow
 * - 开始使用 / 转化入口 → /pricing
 * - 进入工作台 → /dashboard/usage（未登录由路由守卫转到登录）
 */
import { HOME_STORY_POSTER } from '@/config/cdn'

export const homeStoryConfig = {
  /** 首帧封面，避免 preload 大视频时长时间黑/白屏 */
  poster: HOME_STORY_POSTER,
  /** 滚轮触发下一段的最小位移（像素），与播放速度无关 */
  wheelThreshold: 48,
  /** 触控滑动触发下一段的最小位移（像素） */
  touchThreshold: 56,
  segments: [
    {
      id: 'seg-01',
      label: '创造起点',
      start: 0,
      end: 5,
      theme: '创造的起点',
      title: '一切创造，都始于一个念头',
      desc: '从第一束火焰，到今天的人工智能，人类一直在寻找创造世界的方式。',
      cta: '开始创造',
      ctaLink: '/pricing',
      links: [
        { label: '为什么是绘火', to: '/resources' },
        { label: '立即创作', to: '/workflow' },
      ],
    },
    {
      id: 'seg-02',
      label: '点燃灵感',
      start: 5,
      end: 12,
      theme: '点燃灵感',
      title: '点燃你的第一个故事',
      desc: '一个简单的想法，可以成长为完整的故事、角色和电影世界。',
      cta: '生成故事',
      ctaLink: '/workflow',
      links: [
        { label: 'AI故事创作', to: '/workflow' },
        { label: '灵感库', to: '/workflow' },
      ],
    },
    {
      id: 'seg-03',
      label: '想象成真',
      start: 12,
      end: 20,
      theme: '让想象成为真实',
      title: '创造属于你的世界',
      desc: '从一个角色开始，构建独属于你的故事宇宙。',
      cta: '创造角色',
      ctaLink: '/workflow',
      links: [
        { label: 'AI角色创作', to: '/workflow' },
        { label: '世界观生成', to: '/workflow' },
      ],
    },
    {
      id: 'seg-04',
      label: '故事成片',
      start: 20,
      end: 25,
      theme: '故事成为电影',
      title: '让故事拥有无限可能',
      desc: '将文字、角色和场景连接，生成属于你的影视作品。',
      cta: '创建影片',
      ctaLink: '/workflow',
      links: [
        { label: 'AI视频生成', to: '/workflow' },
        { label: '作品展示', to: '/pricing' },
      ],
    },
    {
      id: 'seg-05',
      label: '无限世界',
      start: 25,
      end: 35,
      theme: '无限世界，无限故事',
      title: '每一个世界，都值得被创造',
      desc: '无论东方幻想、未来科技，还是奇幻冒险，绘火让想象成为现实。',
      cta: '探索世界',
      ctaLink: '/pricing',
      links: [
        { label: '创作风格库', to: '/workflow' },
        { label: 'AI短剧工厂', to: '/workflow' },
      ],
    },
    {
      id: 'seg-06',
      label: '进入绘火',
      start: 35,
      end: 45,
      theme: '从想象到作品',
      title: '你的 AI 电影工厂',
      desc: '从灵感、剧本、角色、分镜，到最终视频，一站式完成创作。',
      cta: '立即开始创作',
      ctaLink: '/pricing',
      links: [
        { label: '进入工作台', to: '/dashboard/usage' },
        { label: '新手教程', to: '/workflow' },
        { label: '免费注册', to: '/pricing' },
      ],
    },
  ],
}
