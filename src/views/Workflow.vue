<template>
  <div class="workflow-page">
    <section class="workflow-hero">
      <p class="workflow-hero__eyebrow">制作流程</p>
      <h1 class="workflow-hero__title">从文字到成片，一条清晰的创作路径</h1>
      <p class="workflow-hero__desc">
        不必在多个软件之间来回切换。绘火把影视创作的关键步骤串成一条可掌控的流水线。
      </p>
    </section>

    <div class="workflow-list">
      <section
        v-for="(phase, index) in phases"
        :key="phase.id"
        class="workflow-phase"
        :class="{ 'is-reverse': index % 2 === 1 }"
      >
        <div class="workflow-phase__copy">
          <p class="workflow-phase__index">{{ phase.index }}</p>
          <h2 class="workflow-phase__title">{{ phase.title }}</h2>
          <p
            v-for="(paragraph, pIndex) in phase.paragraphs"
            :key="pIndex"
            class="workflow-phase__desc"
          >
            {{ paragraph }}
          </p>
        </div>
        <div class="workflow-phase__visual">
          <img
            class="workflow-phase__image"
            :src="phase.image"
            :alt="phase.title"
            loading="lazy"
            decoding="async"
          />
          <span class="workflow-phase__visual-tag">{{ phase.tag }}</span>
        </div>
      </section>
    </div>

    <section class="workflow-cta">
      <h2 class="workflow-cta__title">用你的第一个故事，走完这一遍</h2>
      <p class="workflow-cta__desc">不必在工具之间来回切换，从文字到成片，一步一步走下去。</p>
      <div class="workflow-cta__actions">
        <router-link to="/pricing" class="workflow-cta__btn">开始创作</router-link>
        <router-link to="/resources" class="workflow-cta__btn workflow-cta__btn--ghost">为什么选择绘火</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
const phases = [
  {
    id: 'story',
    index: '01',
    title: '写下或导入你的故事',
    paragraphs: [
      '上传小说、剧本，或从零开始写。',
      '故事剧情、短剧脚本、种草内容都可以作为起点——创意从文字开始，而不是从空白时间线开始。',
    ],
    tag: '故事起点',
    image: '/images/story-writing.webp',
  },
  {
    id: 'style',
    index: '02',
    title: '定下作品的视觉方向',
    paragraphs: [
      '选定风格、画风与生成策略，一次设定贯穿全片。',
      '角色、场景、镜头图与视频都沿同一套美学前进，减少「每一镜都要重新找感觉」。',
    ],
    tag: '视觉方向',
    image: '/images/visual-direction.webp',
  },
  {
    id: 'storyboard',
    index: '03',
    title: '智能拆成可拍的分镜',
    paragraphs: [
      'AI 将长文本整理为幕、场景与镜头：画面、运镜、情绪、对白一目了然。',
      '你可以审阅、调整，让分镜真正成为可执行的拍摄蓝图，而不是不可改的黑盒结果。',
    ],
    tag: '智能分镜',
    image: '/images/storyboard.webp',
  },
  {
    id: 'assets',
    index: '04',
    title: '建立角色与道具资产',
    paragraphs: [
      '为关键角色建模，为重要道具定妆。',
      '服饰、造型可沉淀成资产库，同一人物在不同镜头里保持统一形象——这是动画感成立的基础。',
    ],
    tag: '角色资产',
    image: '/images/asset-creation.webp',
  },
  {
    id: 'generate',
    index: '05',
    title: '生成画面、镜头与声音',
    paragraphs: [
      '按场景与镜头推进：场景氛围图 → 故事板画面 → 镜头视频 → 对白配音。',
      '支持单镜与宫格分镜节奏，前后镜头可自然衔接，让生成结果更像「拍出来」而不像「拼出来」。',
    ],
    tag: '视听生成',
    image: '/images/av-generation.webp',
  },
  {
    id: 'polish',
    index: '06',
    title: '打磨、补镜与合成预览',
    paragraphs: [
      '在主流程之外，用画布灵活补镜，用音色库统一角色声线。',
      '素材可沉淀复用，任务进度一目了然——创作节奏由你掌控。',
    ],
    tag: '打磨合成',
    image: '/images/compose-preview.webp',
  },
]
</script>

<style scoped>
.workflow-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(124, 108, 240, 0.08), transparent 50%),
    radial-gradient(ellipse at 90% 20%, rgba(91, 141, 239, 0.08), transparent 45%),
    #f3eee6;
  color: #1c1917;
  padding: 0 0 96px;
}

.workflow-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  max-width: none;
  margin: 0 0 72px;
  min-height: 420px;
  padding: 140px 28px 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 0;
  border: 0;
  box-shadow: none;
  background:
    linear-gradient(180deg, rgba(250, 247, 242, 0.42), rgba(250, 247, 242, 0.58)),
    url('/images/banner.webp') center / cover no-repeat;
}

.workflow-hero__eyebrow {
  margin: 0 0 14px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 25, 23, 0.55);
}

.workflow-hero__title {
  margin: 0 0 18px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #1c1917;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
}

.workflow-hero__desc {
  margin: 0 auto;
  max-width: 640px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.75;
  color: rgba(28, 25, 23, 0.72);
}

.workflow-list {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.workflow-phase {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: center;
}

.workflow-phase.is-reverse .workflow-phase__copy {
  order: 2;
}

.workflow-phase.is-reverse .workflow-phase__visual {
  order: 1;
}

.workflow-phase__index {
  margin: 0 0 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: rgba(28, 25, 23, 0.35);
}

.workflow-phase__title {
  margin: 0 0 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(28px, 3.5vw, 42px);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.workflow-phase__desc {
  margin: 0 0 12px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(28, 25, 23, 0.62);
  max-width: 460px;
}

.workflow-phase__desc:last-child {
  margin-bottom: 0;
}

.workflow-phase__visual {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  aspect-ratio: 16 / 10;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(28, 25, 23, 0.06);
  box-shadow: 0 18px 50px rgba(28, 25, 23, 0.06);
}

.workflow-phase__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.workflow-phase__visual-tag {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 8px 14px;
  border-radius: 999px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #faf7f2;
  background: rgba(28, 25, 23, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.workflow-cta {
  max-width: 720px;
  margin: 88px auto 0;
  text-align: center;
  padding: 48px 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(28, 25, 23, 0.06);
  width: calc(100% - 56px);
}

.workflow-cta__title {
  margin: 0 0 12px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 500;
}

.workflow-cta__desc {
  margin: 0 0 24px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: rgba(28, 25, 23, 0.58);
}

.workflow-cta__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 999px;
  background: #2f2a27;
  color: #faf7f2;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.workflow-cta__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.workflow-cta__btn:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.workflow-cta__btn--ghost {
  background: rgba(255, 255, 255, 0.55);
  color: #1c1917;
  border: 1px solid rgba(28, 25, 23, 0.08);
}

@media (max-width: 900px) {
  .workflow-page {
    padding: 0 0 calc(72px + 64px + env(safe-area-inset-bottom, 0px));
  }

  .workflow-hero {
    margin-bottom: 48px;
    min-height: 320px;
    padding: 100px 16px 64px;
    border-radius: 0;
  }

  .workflow-list {
    padding: 0 16px;
  }

  .workflow-cta {
    width: calc(100% - 32px);
  }

  .workflow-phase,
  .workflow-phase.is-reverse {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .workflow-phase.is-reverse .workflow-phase__copy,
  .workflow-phase.is-reverse .workflow-phase__visual {
    order: 0;
  }

  .workflow-phase__visual {
    aspect-ratio: 16 / 10;
  }
}
</style>
