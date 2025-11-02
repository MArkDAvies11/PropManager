export const formatters = {
  currency: (amount) => `KSh ${amount.toLocaleString()}`,
  phone: (phone) => phone.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4'),
  date: (date) => new Date(date).toLocaleDateString('en-KE')
}

export default formatters