import jwt from "jsonwebtoken";
export class JWT {
  static GenerateAccessToken = ({ id, email, tokenType }) => {
    const payload = {
      id,
      email,
      tokenType,
    };
    const options = {
      expiresIn: "1m",
    };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, options);
    return token;
  };

  static GenerateRefreshToken = ({ id, email, tokenType }) => {
    const payload = {
      id,
      email,
      tokenType,
    };
    const options = {
      expiresIn: "10m",
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET_KEY,
      options
    );
    return token;
  };
}
