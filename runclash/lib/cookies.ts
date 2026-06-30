export function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      return cookieValue || null;
    }
  }
  return null;
}

export function setTokenCookie(token: string) {
  setCookie("auth_token", token, 7);
}

export function getTokenCookie() {
  return getCookie("auth_token");
}

export function storeUserData(userData: any) {
  setCookie("user_data", JSON.stringify(userData), 7);
}

export function getUserData() {
  const userDataCookie = getCookie("user_data");
  return userDataCookie ? JSON.parse(userDataCookie) : null;
}

export function clearAuthCookies() {
  setCookie("auth_token", "", -1);
  setCookie("user_data", "", -1);
}
