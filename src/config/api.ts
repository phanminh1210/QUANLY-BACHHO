
export const API_BASE_URL =
  'https://script.google.com/macros/s/AKfycbwL8ArMuBbXiAPHpUQLTZTWbrEFH3-DFBYkXtTUnYmsSGqB0okGtM3RuFXZcPE0ImdH6Q/exec'

export const GET_SAN_PHAM_API = `${API_BASE_URL}?action=get_sanpham`

export const SHOW_GANNHAT_SAPTOI_API = `${API_BASE_URL}?action=show_gannhat_saptoi`

export const TAT_CA_SHOW_API = `${API_BASE_URL}?action=tatcashow`

export const LAY_SHOW_CHUA_DIEN_API = `${API_BASE_URL}?action=layshowchuadien`

export const LAY_SHOW_DA_HUY_API = `${API_BASE_URL}?action=layshowdahuy`

export const LAY_SHOW_DA_DIEN_API = `${API_BASE_URL}?action=layshowdadien`

export const LOGIN_API = (tai_khoan: string, mat_khau: string) =>
  `${API_BASE_URL}?action=login&tai_khoan=${encodeURIComponent(tai_khoan)}&mat_khau=${encodeURIComponent(mat_khau)}`

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  GET_SAN_PHAM: GET_SAN_PHAM_API,
  SHOW_GANNHAT_SAPTOI: SHOW_GANNHAT_SAPTOI_API,
  TAT_CA_SHOW: TAT_CA_SHOW_API,
  LAY_SHOW_CHUA_DIEN: LAY_SHOW_CHUA_DIEN_API,
  LAY_SHOW_DA_HUY: LAY_SHOW_DA_HUY_API,
  LAY_SHOW_DA_DIEN: LAY_SHOW_DA_DIEN_API,
  LOGIN: LOGIN_API,
}
