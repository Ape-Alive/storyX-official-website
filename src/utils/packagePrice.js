/**
 * 套餐价格：与后端 order.service 创建订单逻辑保持一致
 * discount=98 表示 98 折，实付 = 原价 × 0.98
 */

export function toPriceNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const n = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseDiscount(pkg) {
  if (pkg?.discount == null || pkg?.discount === '') return null
  const discount = toPriceNumber(pkg.discount, null)
  if (discount == null || discount <= 0 || discount > 100) return null
  return discount
}

/**
 * 应付金额（已应用套餐折扣）
 * @param {{ price?: number|string, discount?: number|string|null }} pkg
 */
export function getPackagePayableAmount(pkg) {
  const amount = toPriceNumber(pkg?.price)
  const discount = parseDiscount(pkg)
  if (discount != null) {
    return amount * (discount / 100)
  }
  return amount
}

/** 是否有实际折扣（小于 100 折） */
export function hasPackageDiscount(pkg) {
  const discount = parseDiscount(pkg)
  return discount != null && discount < 100
}

/**
 * 折扣展示信息
 * @returns {{ original: number, payable: number, discount: number|null, saved: number, hasDiscount: boolean }}
 */
export function getPackageDiscountInfo(pkg) {
  const original = toPriceNumber(pkg?.price)
  const discount = parseDiscount(pkg)
  const payable = getPackagePayableAmount(pkg)
  const hasDiscount = discount != null && discount < 100
  return {
    original,
    payable,
    discount: hasDiscount ? discount : null,
    saved: hasDiscount ? Math.max(0, original - payable) : 0,
    hasDiscount,
  }
}

/** 展示用价格文案 */
export function formatPackagePrice(price) {
  const priceNum = toPriceNumber(price)
  if (priceNum === 0) return '0'
  if (Number.isInteger(priceNum) || Math.abs(priceNum - Math.round(priceNum)) < 1e-9) {
    return String(Math.round(priceNum))
  }
  return parseFloat(priceNum.toFixed(2)).toString()
}

/** 折扣标签，如「98折」 */
export function formatDiscountLabel(discount) {
  const n = toPriceNumber(discount, null)
  if (n == null) return ''
  return `${formatPackagePrice(n)}折`
}
