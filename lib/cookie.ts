export const getCookie = (name: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return ""
  }
  
  const cookie = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1]
  return cookie ?? ""
}