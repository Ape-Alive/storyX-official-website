<template>
  <div class="resources-page">
    <section class="resources-hero">
      <p class="resources-hero__eyebrow">{{ hero.eyebrow }}</p>
      <h1 class="resources-hero__title">{{ hero.title }}</h1>
      <p class="resources-hero__desc">{{ hero.desc }}</p>
      <div class="resources-hero__actions">
        <router-link :to="cta.primary.to" class="resources-btn resources-btn--primary">
          {{ cta.primary.label }}
        </router-link>
        <router-link :to="cta.secondary.to" class="resources-btn resources-btn--ghost">
          {{ cta.secondary.label }}
        </router-link>
      </div>
    </section>

    <section class="resources-cards" aria-label="产品优势短句">
      <article
        v-for="card in cards"
        :key="card.title"
        class="resources-card"
      >
        <h3 class="resources-card__title">{{ card.title }}</h3>
        <p class="resources-card__desc">{{ card.desc }}</p>
      </article>
    </section>

    <section class="resources-advantages" aria-label="产品优势详解">
      <article
        v-for="item in advantages"
        :key="item.index"
        class="resources-advantage"
      >
        <p class="resources-advantage__index">优势 {{ item.index }}</p>
        <h2 class="resources-advantage__title">{{ item.title }}</h2>
        <p
          v-for="(paragraph, index) in item.paragraphs"
          :key="index"
          class="resources-advantage__desc"
        >
          {{ paragraph }}
        </p>
      </article>
    </section>

    <section class="resources-compare" aria-label="为什么不是传统工具">
      <div class="resources-compare__head">
        <h2 class="resources-section__title">为什么不是传统工具</h2>
        <p class="resources-section__desc">同样做视频，起点与链路完全不同。</p>
      </div>
      <div class="resources-compare__table">
        <div class="resources-compare__row resources-compare__row--head">
          <span>传统方式</span>
          <span>绘火</span>
        </div>
        <div
          v-for="(row, index) in comparisons"
          :key="index"
          class="resources-compare__row"
        >
          <span>{{ row.traditional }}</span>
          <span class="is-highlight">{{ row.storyx }}</span>
        </div>
      </div>
    </section>

    <section class="resources-faq" aria-label="常见问题">
      <div class="resources-faq__head">
        <h2 class="resources-section__title">{{ faq.hero.title }}</h2>
        <p class="resources-section__desc">{{ faq.hero.desc }}</p>
      </div>

      <div class="resources-faq__list">
        <details
          v-for="(item, index) in faq.items"
          :key="item.q"
          class="resources-faq__item"
          :open="index === 0"
        >
          <summary class="resources-faq__question">
            <span>{{ item.q }}</span>
            <span class="resources-faq__mark" aria-hidden="true" />
          </summary>
          <div class="resources-faq__answer">
            <p v-for="(paragraph, pIndex) in item.a" :key="pIndex">
              {{ paragraph }}
            </p>
          </div>
        </details>
      </div>
    </section>

    <section class="resources-mid-cta">
      <h2 class="resources-mid-cta__title">{{ cta.title }}</h2>
      <p class="resources-mid-cta__desc">{{ cta.desc }}</p>
      <div class="resources-hero__actions">
        <router-link :to="cta.primary.to" class="resources-btn resources-btn--primary">
          {{ cta.primary.label }}
        </router-link>
        <router-link :to="cta.secondary.to" class="resources-btn resources-btn--ghost">
          {{ cta.secondary.label }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  resourceHero,
  advantageCards,
  advantages,
  comparisons,
  resourceCta,
  faqHero,
  faqs,
} from '@/config/resources'

const hero = resourceHero
const cards = advantageCards
const cta = resourceCta
const faq = { hero: faqHero, items: faqs }
</script>

<style scoped>
.resources-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(196, 92, 58, 0.07), transparent 42%),
    radial-gradient(ellipse at 88% 12%, rgba(91, 141, 239, 0.08), transparent 46%),
    #f3eee6;
  color: #1c1917;
  padding: 0 0 96px;
}

.resources-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  max-width: none;
  margin: 0 0 56px;
  padding: 120px 28px 72px;
  text-align: center;
  border-radius: 0;
  border: 0;
  box-shadow: none;
  background:
    linear-gradient(180deg, rgba(250, 247, 242, 0.42), rgba(250, 247, 242, 0.58)),
    url('/images/banner.webp') center / cover no-repeat;
}

.resources-hero__eyebrow {
  margin: 0 0 14px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(28, 25, 23, 0.55);
}

.resources-hero__title {
  margin: 0 0 18px;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #1c1917;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
}

.resources-hero__desc {
  margin: 0 auto 28px;
  max-width: 640px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 16px;
  line-height: 1.75;
  color: rgba(28, 25, 23, 0.72);
}

.resources-hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.resources-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 999px;
  text-decoration: none;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  font-weight: 600;
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
}

.resources-btn:hover {
  transform: translateY(-1px);
}

.resources-btn--primary {
  background: #2f2a27;
  color: #faf7f2;
}

.resources-btn--primary:hover {
  opacity: 0.92;
}

.resources-btn--ghost {
  background: rgba(255, 255, 255, 0.55);
  color: #1c1917;
  border: 1px solid rgba(28, 25, 23, 0.08);
}

.resources-cards {
  max-width: 1280px;
  margin: 0 auto 72px;
  padding: 0 28px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.resources-card {
  flex: 0 1 calc((100% - 42px) / 4);
  width: calc((100% - 42px) / 4);
  max-width: calc((100% - 42px) / 4);
  box-sizing: border-box;
  padding: 22px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(28, 25, 23, 0.06);
  text-align: center;
}

.resources-card__title {
  margin: 0 0 8px;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.resources-card__desc {
  margin: 0;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(28, 25, 23, 0.58);
}

.resources-advantages {
  max-width: 1280px;
  margin: 0 auto 80px;
  padding: 0 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  text-align: center;
}

.resources-advantage {
  width: 100%;
  max-width: 800px;
}

.resources-advantage__index {
  margin: 0 0 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: rgba(28, 25, 23, 0.35);
}

.resources-advantage__title {
  margin: 0 0 14px;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.resources-advantage__desc {
  margin: 0 0 10px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(28, 25, 23, 0.62);
}

.resources-advantage__desc:last-child {
  margin-bottom: 0;
}

.resources-section__title {
  margin: 0 0 10px;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
  font-size: clamp(28px, 3.5vw, 40px);
  font-weight: 500;
  letter-spacing: -0.02em;
}

.resources-section__desc {
  margin: 0;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(28, 25, 23, 0.58);
}

.resources-compare {
  max-width: 1280px;
  margin: 0 auto 72px;
  padding: 0 28px;
}

.resources-compare__head {
  text-align: center;
  margin-bottom: 28px;
}

.resources-compare__table {
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(28, 25, 23, 0.08);
  background: rgba(255, 255, 255, 0.5);
}

.resources-compare__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 22px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(28, 25, 23, 0.62);
  border-top: 1px solid rgba(28, 25, 23, 0.06);
}

.resources-compare__row--head {
  border-top: 0;
  background: rgba(28, 25, 23, 0.04);
  font-weight: 700;
  color: #1c1917;
}

.resources-compare__row .is-highlight {
  color: #1c1917;
  font-weight: 600;
}

.resources-mid-cta {
  max-width: 1280px;
  margin: 72px auto 0;
  text-align: center;
  padding: 48px 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(28, 25, 23, 0.06);
  width: calc(100% - 56px);
  box-sizing: border-box;
}

.resources-mid-cta__title {
  margin: 0 0 12px;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
  font-size: 28px;
  font-weight: 500;
}

.resources-mid-cta__desc {
  margin: 0 0 24px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  color: rgba(28, 25, 23, 0.58);
}

.resources-faq {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 28px;
}

.resources-faq__head {
  text-align: center;
  margin-bottom: 28px;
}

.resources-faq__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: none;
  margin: 0;
}

.resources-faq__item {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(28, 25, 23, 0.06);
  overflow: hidden;
}

.resources-faq__question {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  font-family: 'Space Grotesk', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.resources-faq__question::-webkit-details-marker {
  display: none;
}

.resources-faq__mark {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  position: relative;
}

.resources-faq__mark::before,
.resources-faq__mark::after {
  content: '';
  position: absolute;
  background: rgba(28, 25, 23, 0.55);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.resources-faq__mark::before {
  left: 0;
  top: 6px;
  width: 14px;
  height: 1.5px;
}

.resources-faq__mark::after {
  left: 6px;
  top: 0;
  width: 1.5px;
  height: 14px;
}

.resources-faq__item[open] .resources-faq__mark::after {
  opacity: 0;
  transform: scaleY(0);
}

.resources-faq__answer {
  padding: 0 20px 18px;
}

.resources-faq__answer p {
  margin: 0 0 10px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(28, 25, 23, 0.62);
}

.resources-faq__answer p:last-child {
  margin-bottom: 0;
}

@media (max-width: 960px) {
  .resources-page {
    padding: 0 0 calc(72px + 64px + env(safe-area-inset-bottom, 0px));
  }

  .resources-hero {
    margin-bottom: 40px;
    padding: 88px 16px 48px;
    border-radius: 0;
  }

  .resources-hero__actions {
    gap: 8px;
  }

  .resources-btn {
    padding: 9px 16px;
    font-size: 12px;
  }

  .resources-cards {
    margin-bottom: 56px;
    padding: 0 16px;
  }

  .resources-card {
    flex: 0 1 calc((100% - 14px) / 2);
    width: calc((100% - 14px) / 2);
    max-width: calc((100% - 14px) / 2);
  }

  .resources-advantages,
  .resources-compare,
  .resources-faq {
    padding: 0 16px;
  }

  .resources-mid-cta {
    width: calc(100% - 32px);
    margin: 48px auto 0;
    padding: 36px 20px;
  }

  .resources-compare__row {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 14px 16px;
  }

  .resources-compare__row--head span:last-child,
  .resources-compare__row .is-highlight {
    padding-top: 4px;
  }

  .resources-compare__row--head span:last-child::before,
  .resources-compare__row .is-highlight::before {
    display: none;
  }

  .resources-mid-cta__title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .resources-cards {
    gap: 10px;
  }

  .resources-card {
    flex: 0 1 100%;
    width: 100%;
    max-width: 100%;
  }

  .resources-hero__actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .resources-btn {
    width: auto;
    padding: 8px 14px;
    font-size: 12px;
  }

  .resources-mid-cta .resources-hero__actions {
    flex-direction: row;
  }

  .resources-mid-cta .resources-btn {
    width: auto;
  }
}
</style>
