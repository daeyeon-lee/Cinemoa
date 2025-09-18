// export const googleLogin = async (credential: string) => {
export const googleLogin = async (idToken: string) => {
  try {
    // 서버로 Google OAuth 토큰 전송
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}auth/login/oauth2/code/google`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함
        body: JSON.stringify({
          token: idToken,
          // code: credential,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const loginData = await response.json();
    console.log("Google login response:", loginData);

    return loginData;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};
