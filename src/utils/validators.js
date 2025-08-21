
export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};


export const isValidPhone = (phone) => {
  if (!phone) return false;
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone);
};
