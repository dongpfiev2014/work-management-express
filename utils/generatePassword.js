export default function generateStrongPassword() {
  const length = Math.floor(Math.random() * 9) + 8; // Tạo độ dài ngẫu nhiên từ 8 đến 16
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";

  let password = "";

  // Thêm ít nhất một ký tự của mỗi loại
  password += "abcdefghijklmnopqrstuvwxyz".charAt(
    Math.floor(Math.random() * 26)
  );
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(
    Math.floor(Math.random() * 26)
  );
  password += "0123456789".charAt(Math.floor(Math.random() * 10));
  password += "!@#$%^&*()_+~`|}{[]:;?><,./-=".charAt(
    Math.floor(Math.random() * 32)
  );

  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // Trộn lẫn các ký tự trong mật khẩu
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
}
