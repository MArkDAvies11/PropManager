export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^254[0-9]{9}$/
  return phoneRegex.test(phone)
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default {
  validatePhoneNumber,
  validateEmail
}