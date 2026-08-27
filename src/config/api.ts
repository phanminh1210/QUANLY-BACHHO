export const API_BASE_URL =
  'https://script.google.com/macros/s/AKfycbyFvoC4TSpDNoDPKe6i73G0NMMnE1BwxNLZAamuml1zZMiLoX3YjrOnlpVlApw1faBd4A/exec'

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,

  LOGIN: (tai_khoan: string, mat_khau: string) =>
    `${API_BASE_URL}?action=login&tai_khoan=${encodeURIComponent(tai_khoan)}&mat_khau=${encodeURIComponent(mat_khau)}`,

  // ==================== NHÂN SỰ ENDPOINTS ====================
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
  }) =>
    `${API_BASE_URL}?action=capNhatThongTinNhanSuByNV`
    + `&ma_ns=${encodeURIComponent(p.ma_ns)}`
    + (p.ten_ns   ? `&ten_ns=${encodeURIComponent(p.ten_ns)}`     : '')
    + (p.nam_sinh ? `&nam_sinh=${encodeURIComponent(p.nam_sinh)}` : '')
    + (p.dia_chi  ? `&dia_chi=${encodeURIComponent(p.dia_chi)}`   : '')
    + (p.sdt      ? `&sdt=${encodeURIComponent(p.sdt)}`           : ''),

  DOI_MAT_KHAU_BY_NV: (ma_ns: string, mat_khau_moi: string) =>
    `${API_BASE_URL}?action=doiMatKhauByNV&ma_ns=${encodeURIComponent(ma_ns)}&mat_khau_moi=${encodeURIComponent(mat_khau_moi)}`,

  LAY_TAT_CA_TEN_NHAN_SU: `${API_BASE_URL}?action=layTatCaTenNhanSu`,

  THEM_NHAN_SU: (p: {
    ten_ns: string
    nam_sinh: string
    dia_chi: string
    sdt?: string
    tai_khoan?: string
    mat_khau?: string
    vai_tro: string
    quyen?: string
    ghi_chu?: string
  }) =>
    `${API_BASE_URL}?action=themNhanSu`
    + `&ten_ns=${encodeURIComponent(p.ten_ns)}`
    + `&nam_sinh=${encodeURIComponent(p.nam_sinh)}`
    + `&dia_chi=${encodeURIComponent(p.dia_chi)}`
    + `&sdt=${encodeURIComponent(p.sdt || '')}`
    + `&tai_khoan=${encodeURIComponent(p.tai_khoan || '')}`
    + `&mat_khau=${encodeURIComponent(p.mat_khau || '')}`
    + `&vai_tro=${encodeURIComponent(p.vai_tro)}`
    + `&quyen=${encodeURIComponent(p.quyen || '')}`
    + `&ghi_chu=${encodeURIComponent(p.ghi_chu || '')}`,

  // ==================== SHOW ENDPOINTS ====================
  LAY_TAT_CA_SHOW: `${API_BASE_URL}?action=layTatCaShow`,
  GET_SHOW_DA_DIEN: `${API_BASE_URL}?action=layShowDaDien`,
  GET_SHOW_CHUA_DIEN: `${API_BASE_URL}?action=layShowChuaDien`,

  CAP_NHAT_TAT_CA_NHAN_SU: (maShow: string, tenShow: string, ngay: string, dataJson: string) =>
    `${API_BASE_URL}?action=capNhatTatCaNhanSuShow` +
    `&ma_show=${encodeURIComponent(maShow)}` +
    `&ten_show=${encodeURIComponent(tenShow)}` +
    `&ngay=${encodeURIComponent(ngay)}` +
    `&data=${encodeURIComponent(dataJson)}`,

  GET_SHOW_THEO_TRANG_THAI: (trang_thai: string) =>
    `${API_BASE_URL}?action=lay_show_theo_trangthai&trang_thai=${encodeURIComponent(trang_thai)}`,

  THONG_KE_SHOW_NAM_NAY: `${API_BASE_URL}?action=thongKeShowNamNay`,

  THEM_SHOW: (p: {
    ten_show: string
    ngay: string
    diachi: string
    gio?: string
    ten_khachhang?: string
    sdt?: string
    ma_loai_show?: string
    trang_thai?: string
  }) =>
    `${API_BASE_URL}?action=themShow`
    + `&ten_show=${encodeURIComponent(p.ten_show)}`
    + `&ngay=${encodeURIComponent(p.ngay)}`
    + `&diachi=${encodeURIComponent(p.diachi)}`
    + (p.gio           ? `&gio=${encodeURIComponent(p.gio)}`                   : '')
    + (p.ten_khachhang ? `&ten_khachhang=${encodeURIComponent(p.ten_khachhang)}`   : '')
    + (p.sdt           ? `&sdt=${encodeURIComponent(p.sdt)}`                   : '')
    + (p.ma_loai_show  ? `&ma_loai_show=${encodeURIComponent(p.ma_loai_show)}`     : '')
    + (p.trang_thai    ? `&trang_thai=${encodeURIComponent(p.trang_thai)}`         : ''),

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
  }) =>
    `${API_BASE_URL}?action=themDanhSachVaiTroShow`
    + `&ma_show=${encodeURIComponent(p.ma_show)}`
    + `&ten_show=${encodeURIComponent(p.ten_show)}`
    + `&ngay_lamviec=${encodeURIComponent(p.ngay_lamviec)}`
    + `&so_lan=${p.so_lan ?? 0}`
    + `&so_trong_hoi=${p.so_trong_hoi ?? 0}`
    + `&so_chinh=${p.so_chinh ?? 0}`
    + `&co_than_tai=${p.co_than_tai  ? 'true' : 'false'}`
    + `&co_xoa=${p.co_xoa            ? 'true' : 'false'}`
    + `&co_lo=${p.co_lo              ? 'true' : 'false'}`
    + `&co_rong_don=${p.co_rong_don  ? 'true' : 'false'}`
    + `&co_rong_gay=${p.co_rong_gay  ? 'true' : 'false'}`
    + `&so_rong_khuc=${p.so_rong_khuc ?? 0}`
    + `&co_ngo_khong=${p.co_ngo_khong ? 'true' : 'false'}`
    + `&co_bat_gioi=${p.co_bat_gioi   ? 'true' : 'false'}`
    + `&co_ong_dia=${p.co_ong_dia     ? 'true' : 'false'}`,

  GET_DETAIL_SHOW_BY_MA_SHOW: (ma_show: string) =>
    `${API_BASE_URL}?action=getDetailShowByMaShow&ma_show=${encodeURIComponent(ma_show)}`,

  GET_VAI_TRO_BY_MA_SHOW: (ma_show: string) =>
    `${API_BASE_URL}?action=getVaiTroByMaShow&ma_show=${encodeURIComponent(ma_show)}`,

  DANG_KY_SHOW: (ma_show: string, vai_tro: string, ten_ns: string) =>
    `${API_BASE_URL}?action=dangKyShow`
    + `&ma_show=${encodeURIComponent(ma_show)}`
    + `&vai_tro=${encodeURIComponent(vai_tro)}`
    + `&ten_ns=${encodeURIComponent(ten_ns)}`,

  HUY_DANG_KY_SHOW: (ma_show: string, vai_tro: string, ten_ns: string) =>
    `${API_BASE_URL}?action=huyDangKyShow`
    + `&ma_show=${encodeURIComponent(ma_show)}`
    + `&vai_tro=${encodeURIComponent(vai_tro)}`
    + `&ten_ns=${encodeURIComponent(ten_ns)}`,

  UPDATE_TRANG_THAI_SHOW: (ma_show: string, trang_thai: string) =>
    `${API_BASE_URL}?action=doiTrangThaiShow&ma_show=${encodeURIComponent(ma_show)}&trang_thai=${encodeURIComponent(trang_thai)}`,

  UPDATE_SHOW: (p: { ma_show: string; ten_show?: string; ngay?: string; gio?: string; diachi?: string; ten_khachhang?: string; sdt?: string; ma_loai_show?: string; trang_thai?: string }) =>
    `${API_BASE_URL}?action=capNhatShow`
    + `&ma_show=${encodeURIComponent(p.ma_show)}`
    + (p.ten_show      ? `&ten_show=${encodeURIComponent(p.ten_show)}`           : '')
    + (p.ngay          ? `&ngay=${encodeURIComponent(p.ngay)}`                   : '')
    + (p.gio           ? `&gio=${encodeURIComponent(p.gio)}`                     : '')
    + (p.diachi        ? `&diachi=${encodeURIComponent(p.diachi)}`               : '')
    + (p.ten_khachhang ? `&ten_khachhang=${encodeURIComponent(p.ten_khachhang)}` : '')
    + (p.sdt           ? `&sdt=${encodeURIComponent(p.sdt)}`                     : '')
    + (p.ma_loai_show  ? `&ma_loai_show=${encodeURIComponent(p.ma_loai_show)}`   : '')
    + (p.trang_thai    ? `&trang_thai=${encodeURIComponent(p.trang_thai)}`       : ''),

  CAP_NHAT_CHI_TIET_SHOW: (p: { ma_show: string; ten_ns: string; vai_tro: string; luong: string; ghi_chu: string; row_index: number }) =>
    `${API_BASE_URL}?action=capNhatChiTietShow`
    + `&ma_show=${encodeURIComponent(p.ma_show)}`
    + `&ten_ns=${encodeURIComponent(p.ten_ns)}`
    + `&vai_tro=${encodeURIComponent(p.vai_tro)}`
    + `&luong=${encodeURIComponent(p.luong)}`
    + `&ghi_chu=${encodeURIComponent(p.ghi_chu)}`
    + `&row_index=${p.row_index}`,

  LAY_SHOW_THEO_NHAN_SU: (ten_ns: string) =>
    `${API_BASE_URL}?action=layShowTheoNhanSu&ten_ns=${encodeURIComponent(ten_ns)}`,

  
}