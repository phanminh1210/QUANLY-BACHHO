// Định nghĩa kiểu dữ liệu cho User
export interface UserProfile {
  ma_ns?: string
  ten_ns?: string
  tai_khoan?: string
  sdt?: string
  dia_chi?: string
  vai_tro?: string
  [key: string]: any
}

/**
 * Lấy toàn bộ object User từ LocalStorage
 */
export const getUserStorage = (): UserProfile | null => {
  try {
    const data = localStorage.getItem('user')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Lỗi đọc dữ liệu user từ localStorage:', error)
    return null
  }
}

/**
 * Lấy giá trị của 1 trường cụ thể trong User (ví dụ: 'ma_ns', 'ten_ns',...)
 * @param key Tên trường cần lấy
 */
export const getUserField = <K extends keyof UserProfile>(key: K): UserProfile[K] | null => {
  const user = getUserStorage()
  return user ? user[key] : null
}