export const API_BASE_URL =
  'https://script.google.com/macros/s/AKfycbygVU0b38kPdnJtcekZVStcAWwXg2ChHwGbfUd_rp36KhJaQaqONLuRkCH0W8GKyRjvFg/exec'

export interface NhanSuPayload {
  ten_ns: string
  nam_sinh: string
  dia_chi: string
  sdt?: string
  tai_khoan?: string
  mat_khau?: string
  vai_tro: string
  quyen?: string
  ghi_chu?: string
  [key: string]: any
}

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,

  LOGIN: (tai_khoan: string, mat_khau: string) =>
    `${API_BASE_URL}?action=login&tai_khoan=${encodeURIComponent(tai_khoan)}&mat_khau=${encodeURIComponent(mat_khau)}`,

  GET_ALL_NHAN_SU: `${API_BASE_URL}?action=layTatCaNhanSu`,

  LAY_TAT_CA_TEN_NHAN_SU: `${API_BASE_URL}?action=layTatCaTenNhanSu`,

  GET_NHAN_SU_BY_TAI_KHOAN: (tai_khoan: string) =>
    `${API_BASE_URL}?action=getNhanSuInfo&tai_khoan=${encodeURIComponent(tai_khoan)}`,

  GET_NHAN_SU_BY_MA_NS: (ma_ns: string) =>
    `${API_BASE_URL}?action=getNhanSuByMaNS&ma_ns=${encodeURIComponent(ma_ns)}`,

  CAPNHAT_THONGTIN_NHANSU_BY_NV: (p: {
    ma_ns: string
    ten_ns?: string
    nam_sinh?: string
    dia_chi?: string
    sdt?: string
  }) => {
    const params = new URLSearchParams({ action: 'capNhatThongTinNhanSuByNV', ma_ns: p.ma_ns })
    if (p.ten_ns) params.append('ten_ns', p.ten_ns)
    if (p.nam_sinh) params.append('nam_sinh', p.nam_sinh)
    if (p.dia_chi) params.append('dia_chi', p.dia_chi)
    if (p.sdt) params.append('sdt', p.sdt)
    return `${API_BASE_URL}?${params.toString()}`
  },

  DOI_MAT_KHAU_BY_NV: (ma_ns: string, mat_khau_moi: string) =>
    `${API_BASE_URL}?action=doiMatKhauByNV&ma_ns=${encodeURIComponent(ma_ns)}&mat_khau_moi=${encodeURIComponent(mat_khau_moi)}`,

  THEM_NHAN_SU: (p: NhanSuPayload) => {
    const params = new URLSearchParams({
      action: 'themNhanSu',
      ten_ns: p.ten_ns || '',
      nam_sinh: p.nam_sinh || '',
      dia_chi: p.dia_chi || '',
      sdt: p.sdt || '',
      tai_khoan: p.tai_khoan || '',
      mat_khau: p.mat_khau || '',
      vai_tro: p.vai_tro || '',
      quyen: p.quyen || '',
      ghi_chu: p.ghi_chu || ''
    })
    return `${API_BASE_URL}?${params.toString()}`
  },

  DELETE_NHAN_SU: (ma_ns: string | number) =>
    `${API_BASE_URL}?action=xoaNhanSu&ma_ns=${encodeURIComponent(ma_ns)}`,

  CAP_NHAT_NHAN_SU_ADMIN: (params: Record<string, any>) => {
    const searchParams = new URLSearchParams({ action: 'capNhatNSAdmin' })
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, String(params[key]))
      }
    })
    return `${API_BASE_URL}?${searchParams.toString()}`
  },

  LAY_TAT_CA_SHOW: `${API_BASE_URL}?action=layTatCaShow`,
  GET_SHOW_DA_DIEN: `${API_BASE_URL}?action=layShowDaDien`,
  GET_SHOW_CHUA_DIEN: `${API_BASE_URL}?action=layShowChuaDien`,
  THONG_KE_SHOW_NAM_NAY: `${API_BASE_URL}?action=thongKeShowNamNay`,

  GET_SHOW_THEO_TRANG_THAI: (trang_thai: string) =>
    `${API_BASE_URL}?action=lay_show_theo_trangthai&trang_thai=${encodeURIComponent(trang_thai)}`,

  GET_DETAIL_SHOW_BY_MA_SHOW: (ma_show: string) =>
    `${API_BASE_URL}?action=getDetailShowByMaShow&ma_show=${encodeURIComponent(ma_show)}`,

  GET_VAI_TRO_BY_MA_SHOW: (ma_show: string) =>
    `${API_BASE_URL}?action=getVaiTroByMaShow&ma_show=${encodeURIComponent(ma_show)}`,

  LAY_SHOW_THEO_NHAN_SU: (ten_ns: string) =>
    `${API_BASE_URL}?action=layShowTheoNhanSu&ten_ns=${encodeURIComponent(ten_ns)}`,

  THEM_SHOW: (p: {
    ten_show: string
    ngay: string
    diachi: string
    gio?: string
    ten_khachhang?: string
    sdt?: string
    ma_loai_show?: string
    trang_thai?: string
  }) => {
    const params = new URLSearchParams({
      action: 'themShow',
      ten_show: p.ten_show,
      ngay: p.ngay,
      diachi: p.diachi
    })
    if (p.gio) params.append('gio', p.gio)
    if (p.ten_khachhang) params.append('ten_khachhang', p.ten_khachhang)
    if (p.sdt) params.append('sdt', p.sdt)
    if (p.ma_loai_show) params.append('ma_loai_show', p.ma_loai_show)
    if (p.trang_thai) params.append('trang_thai', p.trang_thai)
    return `${API_BASE_URL}?${params.toString()}`
  },

  UPDATE_SHOW: (p: {
    ma_show: string
    ten_show?: string
    ngay?: string
    gio?: string
    diachi?: string
    ten_khachhang?: string
    sdt?: string
    ma_loai_show?: string
    trang_thai?: string
  }) => {
    const params = new URLSearchParams({ action: 'capNhatShow', ma_show: p.ma_show })
    if (p.ten_show) params.append('ten_show', p.ten_show)
    if (p.ngay) params.append('ngay', p.ngay)
    if (p.gio) params.append('gio', p.gio)
    if (p.diachi) params.append('diachi', p.diachi)
    if (p.ten_khachhang) params.append('ten_khachhang', p.ten_khachhang)
    if (p.sdt) params.append('sdt', p.sdt)
    if (p.ma_loai_show) params.append('ma_loai_show', p.ma_loai_show)
    if (p.trang_thai) params.append('trang_thai', p.trang_thai)
    return `${API_BASE_URL}?${params.toString()}`
  },

  UPDATE_TRANG_THAI_SHOW: (ma_show: string, trang_thai: string) =>
    `${API_BASE_URL}?action=doiTrangThaiShow&ma_show=${encodeURIComponent(ma_show)}&trang_thai=${encodeURIComponent(trang_thai)}`,

  DANG_KY_SHOW: (ma_show: string, vai_tro: string, ten_ns: string) =>
    `${API_BASE_URL}?action=dangKyShow&ma_show=${encodeURIComponent(ma_show)}&vai_tro=${encodeURIComponent(vai_tro)}&ten_ns=${encodeURIComponent(ten_ns)}`,

  HUY_DANG_KY_SHOW: (ma_show: string, vai_tro: string, ten_ns: string) =>
    `${API_BASE_URL}?action=huyDangKyShow&ma_show=${encodeURIComponent(ma_show)}&vai_tro=${encodeURIComponent(vai_tro)}&ten_ns=${encodeURIComponent(ten_ns)}`,

  CAP_NHAT_TAT_CA_NHAN_SU: (maShow: string, tenShow: string, ngay: string, dataJson: string) =>
    `${API_BASE_URL}?action=capNhatTatCaNhanSuShow&ma_show=${encodeURIComponent(maShow)}&ten_show=${encodeURIComponent(tenShow)}&ngay=${encodeURIComponent(ngay)}&data=${encodeURIComponent(dataJson)}`,

  CAP_NHAT_CHI_TIET_SHOW: (p: {
    ma_show: string
    ten_ns: string
    vai_tro: string
    luong: string
    ghi_chu: string
    row_index: number
  }) => {
    const params = new URLSearchParams({
      action: 'capNhatChiTietShow',
      ma_show: p.ma_show,
      ten_ns: p.ten_ns,
      vai_tro: p.vai_tro,
      luong: p.luong,
      ghi_chu: p.ghi_chu,
      row_index: p.row_index.toString()
    })
    return `${API_BASE_URL}?${params.toString()}`
  },

  THEM_DANH_SACH_VAI_TRO_SHOW: (p: {
    ma_show: string
    ten_show: string
    ngay_lamviec: string
    so_lan?: number
    so_trong_hoi?: number
    so_chinh?: number
    co_than_tai?: boolean
    co_xoa?: boolean
    co_lo?: boolean
    co_rong_don?: boolean
    co_rong_gay?: boolean
    so_rong_khuc?: number
    co_ngo_khong?: boolean
    co_bat_gioi?: boolean
    co_ong_dia?: boolean
  }) => {
    const params = new URLSearchParams({
      action: 'themDanhSachVaiTroShow',
      ma_show: p.ma_show,
      ten_show: p.ten_show,
      ngay_lamviec: p.ngay_lamviec,
      so_lan: (p.so_lan ?? 0).toString(),
      so_trong_hoi: (p.so_trong_hoi ?? 0).toString(),
      so_chinh: (p.so_chinh ?? 0).toString(),
      co_than_tai: p.co_than_tai ? 'true' : 'false',
      co_xoa: p.co_xoa ? 'true' : 'false',
      co_lo: p.co_lo ? 'true' : 'false',
      co_rong_don: p.co_rong_don ? 'true' : 'false',
      co_rong_gay: p.co_rong_gay ? 'true' : 'false',
      so_rong_khuc: (p.so_rong_khuc ?? 0).toString(),
      co_ngo_khong: p.co_ngo_khong ? 'true' : 'false',
      co_bat_gioi: p.co_bat_gioi ? 'true' : 'false',
      co_ong_dia: p.co_ong_dia ? 'true' : 'false'
    })
    return `${API_BASE_URL}?${params.toString()}`
  },

  TONG_TIEN_DIEN_THEO_TEN_NS: (ten_ns: string) =>
    `${API_BASE_URL}?action=tongTienDienTheoTenNS&ten_ns=${encodeURIComponent(ten_ns)}`,

  LAY_SO_TIEN_UNG_THEO_NS: (ten_ns?: string, thang?: string | number, nam?: string | number) => {
  const params = new URLSearchParams({ action: 'laySoTienUngTheoNS' })
  if (ten_ns && ten_ns.trim() !== '') params.append('ten_ns', ten_ns.trim())
  if (thang !== undefined && thang !== null && String(thang).trim() !== '') params.append('thang', String(thang).trim())
  if (nam !== undefined && nam !== null && String(nam).trim() !== '') params.append('nam', String(nam).trim())
  return `${API_BASE_URL}?${params.toString()}`
},

  LAY_ALL_CHAM_CONG_BY_THANG_NAM: (thang_chamcong?: string | number, nam_chamcong?: string | number) => {
    const params = new URLSearchParams({ action: 'layAllChamCongByThangNam' })
    if (thang_chamcong !== undefined && thang_chamcong !== null) {
      params.append('thang_chamcong', thang_chamcong.toString())
    }
    if (nam_chamcong !== undefined && nam_chamcong !== null) {
      params.append('nam_chamcong', nam_chamcong.toString())
    }
    return `${API_BASE_URL}?${params.toString()}`
  }
}