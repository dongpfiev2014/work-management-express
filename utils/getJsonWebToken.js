import jwt from "jsonwebtoken";
export class JWT {
  static GenerateAccessToken = ({
    id,
    email,
    tokenType,
    expiresIn = process.env.EXPIRES_IN_ACCESS,
  }) => {
    const payload = {
      id,
      email,
      tokenType,
    };
    const options = {
      expiresIn,
    };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, options);
    return token;
  };

  static GenerateRefreshToken = ({
    id,
    email,
    tokenType,
    expiresIn = process.env.EXPIRES_IN_REFRESH,
  }) => {
    const payload = {
      id,
      email,
      tokenType,
    };
    const options = {
      expiresIn,
    };
    const token = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET_KEY,
      options
    );
    return token;
  };
}
