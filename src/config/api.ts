export const API_BASE_URL =
  'https://script.google.com/macros/s/AKfycbwqiYH9SA6ScI0muado8_o0uHMCHi4sy2hXhjZAlNMdg_V-qZaSq1UF6rDI2rXMpiSIwg/exec'

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,

  GET_ALL_SHOW:       `${API_BASE_URL}?action=all`,
  GET_SHOW_DA_DIEN:   `${API_BASE_URL}?action=da_dien`,
  GET_SHOW_CHUA_DIEN: `${API_BASE_URL}?action=chua_dien`,
  GET_ALL_NHAN_SU:    `${API_BASE_URL}?action=get_all_nhan_su`,

  GET_DETAIL_SHOW_BY_MA_SHOW: (ma_show: string) =>
    `${API_BASE_URL}?action=get_detail_show_by_ma_show&ma_show=${encodeURIComponent(ma_show)}`,

  GET_VAI_TRO_BY_MA_SHOW: (ma_show: string) =>
    `${API_BASE_URL}?action=get_vai_tro_by_ma_show&ma_show=${encodeURIComponent(ma_show)}`,

  LOGIN: (tai_khoan: string, mat_khau: string) =>
    `${API_BASE_URL}?action=login&tai_khoan=${encodeURIComponent(tai_khoan)}&mat_khau=${encodeURIComponent(mat_khau)}`,

  CHAM_CONG_CHI_TIET: (thang: number | string, nam: number | string) =>
    `${API_BASE_URL}?action=cham_cong_chi_tiet&thang_chamcong=${encodeURIComponent(String(thang))}&nam_chamcong=${encodeURIComponent(String(nam))}`,

  DANG_KY_SHOW: (ma_show: string, vai_tro: string, ten_ns: string) =>
    `${API_BASE_URL}?action=dang_ky_show&ma_show=${encodeURIComponent(ma_show)}&vai_tro=${encodeURIComponent(vai_tro)}&ten_ns=${encodeURIComponent(ten_ns)}`,

  HUY_DANG_KY_SHOW: (ma_show: string, vai_tro: string, ten_ns: string) =>
    `${API_BASE_URL}?action=huy_dang_ky_show&ma_show=${encodeURIComponent(ma_show)}&vai_tro=${encodeURIComponent(vai_tro)}&ten_ns=${encodeURIComponent(ten_ns)}`,

  SAVE_REGISTER_ASSIGNMENT: `${API_BASE_URL}?action=save_register_assignment`,

  UPDATE_TRANG_THAI_SHOW: (ma_show: string, trang_thai: string) =>
    `${API_BASE_URL}?action=capnhat_trangthai_show&ma_show=${encodeURIComponent(ma_show)}&trang_thai=${encodeURIComponent(trang_thai)}`,

  DELETE_SHOW: (ma_show: string) =>
    `${API_BASE_URL}?action=xoa_show&ma_show=${encodeURIComponent(ma_show)}`,

  GET_NHAN_SU_BY_TAI_KHOAN: (tai_khoan: string) =>
    `${API_BASE_URL}?action=get_nhan_su_by_tai_khoan&tai_khoan=${encodeURIComponent(tai_khoan)}`,

  DOI_MAT_KHAU_BY_NV: (ma_ns: string, mat_khau_moi: string) =>
    `${API_BASE_URL}?action=doi_mat_khau_by_nv&ma_ns=${encodeURIComponent(ma_ns)}&mat_khau_moi=${encodeURIComponent(mat_khau_moi)}`,

  CAPNHAT_THONGTIN_NHANSU_BY_NV: (payload: {
    ma_ns: string; ten_ns: string; nam_sinh: string; dia_chi: string; sdt: string
  }) =>
    `${API_BASE_URL}?action=capnhat_thongtin_nhansu_by_nv` +
    `&ma_ns=${encodeURIComponent(payload.ma_ns)}` +
    `&ten_ns=${encodeURIComponent(payload.ten_ns)}` +
    `&nam_sinh=${encodeURIComponent(payload.nam_sinh)}` +
    `&dia_chi=${encodeURIComponent(payload.dia_chi)}` +
    `&sdt=${encodeURIComponent(payload.sdt)}`,

  UPDATE_SHOW: (payload: {
    ma_show: string; ten_show?: string; ngay?: string; gio?: string
    diachi?: string; ten_khachhang?: string; sdt?: string; ma_loai_show?: string
  }) => [
    `${API_BASE_URL}?action=update_show`,
    `ma_show=${encodeURIComponent(payload.ma_show || '')}`,
    `ten_show=${encodeURIComponent(payload.ten_show || '')}`,
    `ngay=${encodeURIComponent(payload.ngay || '')}`,
    `gio=${encodeURIComponent(payload.gio || '')}`,
    `diachi=${encodeURIComponent(payload.diachi || '')}`,
    `ten_khachhang=${encodeURIComponent(payload.ten_khachhang || '')}`,
    `sdt=${encodeURIComponent(payload.sdt || '')}`,
    `ma_loai_show=${encodeURIComponent(payload.ma_loai_show || '')}`,
  ].join('&'),

  ADD_NHAN_SU: (payload: {
    ten_ns: string; dob: string; dia_chi: string; sdt?: string; ghi_chu?: string
  }) =>
    `${API_BASE_URL}?action=add_nhan_su` +
    `&ten_ns=${encodeURIComponent(payload.ten_ns)}` +
    `&dob=${encodeURIComponent(payload.dob)}` +
    `&dia_chi=${encodeURIComponent(payload.dia_chi)}` +
    `&sdt=${encodeURIComponent(payload.sdt || '')}` +
    `&ghi_chu=${encodeURIComponent(payload.ghi_chu || '')}`,

  DELETE_NHAN_SU: (ma_ns: string) =>
    `${API_BASE_URL}?action=delete_nhan_su&ma_ns=${encodeURIComponent(ma_ns)}`,

  ADD_SHOW_AND_CHAMCONG_CHITIET: (payload: {
    ten_show: string; ma_loai_show?: string; ngay: string; gio?: string
    diachi: string; ten_khachhang?: string; sdt?: string; so_lan?: number
    co_trong?: boolean; co_than_tai?: boolean; co_xoa?: boolean; co_lo?: boolean
    co_trong_hoi?: boolean; so_trong_hoi?: number; co_rong_don?: boolean
    co_rong_gay?: boolean; co_rong_khuc?: boolean; so_rong_khuc?: number
    co_ngo_khong?: boolean; co_bat_gioi?: boolean; co_ong_dia?: boolean
  }) => {
    const q = [
      `action=add_show_and_chamcong_chitiet`,
      `ten_show=${encodeURIComponent(payload.ten_show || '')}`,
      `ma_loai_show=${encodeURIComponent(payload.ma_loai_show || '')}`,
      `ngay=${encodeURIComponent(payload.ngay || '')}`,
      `gio=${encodeURIComponent(payload.gio || '')}`,
      `diachi=${encodeURIComponent(payload.diachi || '')}`,
      `ten_khachhang=${encodeURIComponent(payload.ten_khachhang || '')}`,
      `sdt=${encodeURIComponent(payload.sdt || '')}`,
      `so_lan=${encodeURIComponent(String(payload.so_lan ?? 0))}`,
      `co_trong=${encodeURIComponent(String(!!payload.co_trong))}`,
      `co_than_tai=${encodeURIComponent(String(!!payload.co_than_tai))}`,
      `co_xoa=${encodeURIComponent(String(!!payload.co_xoa))}`,
      `co_lo=${encodeURIComponent(String(!!payload.co_lo))}`,
      `co_trong_hoi=${encodeURIComponent(String(!!payload.co_trong_hoi))}`,
      `so_trong_hoi=${encodeURIComponent(String(payload.so_trong_hoi ?? 0))}`,
      `co_rong_don=${encodeURIComponent(String(!!payload.co_rong_don))}`,
      `co_rong_gay=${encodeURIComponent(String(!!payload.co_rong_gay))}`,
      `co_rong_khuc=${encodeURIComponent(String(!!payload.co_rong_khuc))}`,
      `so_rong_khuc=${encodeURIComponent(String(payload.so_rong_khuc ?? 0))}`,
      `co_ngo_khong=${encodeURIComponent(String(!!payload.co_ngo_khong))}`,
      `co_bat_gioi=${encodeURIComponent(String(!!payload.co_bat_gioi))}`,
      `co_ong_dia=${encodeURIComponent(String(!!payload.co_ong_dia))}`,
    ].join('&')
    return `${API_BASE_URL}?${q}`
  },

  // Cập nhật lương + ghi chú theo ten_ns (dùng khi lần đầu đổi sang đã diễn)
  CAPNHAT_LUONG_GHICHU_CHAMCONG: (payload: {
    ma_show: string; ten_ns: string; luong: string; ghi_chu: string
    thang?: string; nam?: string
  }) =>
    `${API_BASE_URL}?action=capnhat_luong_ghichu_chamcong` +
    `&ma_show=${encodeURIComponent(payload.ma_show)}` +
    `&ten_ns=${encodeURIComponent(payload.ten_ns)}` +
    `&luong=${encodeURIComponent(payload.luong)}` +
    `&ghi_chu=${encodeURIComponent(payload.ghi_chu)}` +
    `&thang=${encodeURIComponent(payload.thang || '')}` +
    `&nam=${encodeURIComponent(payload.nam || '')}`,

  // Cập nhật theo row index — tránh nhầm khi nhiều dòng trùng tên
  CAPNHAT_CHAMCONG_THEO_INDEX: (payload: {
    ma_show: string; row_index: number
    ten_ns: string; vai_tro: string; luong: string; ghi_chu: string
  }) =>
    `${API_BASE_URL}?action=capnhat_chamcong_theo_index` +
    `&ma_show=${encodeURIComponent(payload.ma_show)}` +
    `&row_index=${encodeURIComponent(String(payload.row_index))}` +
    `&ten_ns=${encodeURIComponent(payload.ten_ns)}` +
    `&vai_tro=${encodeURIComponent(payload.vai_tro)}` +
    `&luong=${encodeURIComponent(payload.luong)}` +
    `&ghi_chu=${encodeURIComponent(payload.ghi_chu)}`,

  // Thêm nhân sự mới vào show (append row)
  THEM_NHAN_SU_VAO_SHOW: (payload: {
    ma_show: string; ten_show: string; ngay: string
    ten_ns: string; vai_tro: string; luong: string
    ghi_chu: string; thang: string; nam: string
  }) =>
    `${API_BASE_URL}?action=them_nhan_su_vao_show` +
    `&ma_show=${encodeURIComponent(payload.ma_show)}` +
    `&ten_show=${encodeURIComponent(payload.ten_show)}` +
    `&ngay=${encodeURIComponent(payload.ngay)}` +
    `&ten_ns=${encodeURIComponent(payload.ten_ns)}` +
    `&vai_tro=${encodeURIComponent(payload.vai_tro)}` +
    `&luong=${encodeURIComponent(payload.luong)}` +
    `&ghi_chu=${encodeURIComponent(payload.ghi_chu)}` +
    `&thang=${encodeURIComponent(payload.thang)}` +
    `&nam=${encodeURIComponent(payload.nam)}`,

  // Cập nhật tên NS trong chamcongchitiet
  CAPNHAT_TEN_NS_TRONG_CHAMCONG: (ma_show: string, ten_ns_cu: string, ten_ns_moi: string) =>
    `${API_BASE_URL}?action=capnhat_ten_ns_trong_chamcong` +
    `&ma_show=${encodeURIComponent(ma_show)}` +
    `&ten_ns_cu=${encodeURIComponent(ten_ns_cu)}` +
    `&ten_ns_moi=${encodeURIComponent(ten_ns_moi)}`,

  // Cập nhật vai trò trong chamcongchitiet
  CAPNHAT_VAITRO_TRONG_CHAMCONG: (ma_show: string, ten_ns: string, vai_tro_moi: string) =>
    `${API_BASE_URL}?action=capnhat_vaitro_trong_chamcong` +
    `&ma_show=${encodeURIComponent(ma_show)}` +
    `&ten_ns=${encodeURIComponent(ten_ns)}` +
    `&vai_tro_moi=${encodeURIComponent(vai_tro_moi)}`,

    XOA_NHAN_SU_KHOI_SHOW: (ma_show: string, row_index: number) =>
  `${API_BASE_URL}?action=xoa_nhan_su_khoi_show` +
  `&ma_show=${encodeURIComponent(ma_show)}` +
  `&row_index=${encodeURIComponent(String(row_index))}`,
}