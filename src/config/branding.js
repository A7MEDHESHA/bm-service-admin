export const BRAND_NAME = 'Mekawy'
export const LEGACY_BRAND_NAME = 'BM auto service'

export function getShopName() {
  const storedName = localStorage.getItem('bm_shop_name')
  return storedName && storedName !== LEGACY_BRAND_NAME ? storedName : BRAND_NAME
}
