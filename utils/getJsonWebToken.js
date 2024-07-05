import jwt from "jsonwebtoken";
export class JWT {
  static GetJWT = ({ id, username, tokenType }) => {
    const payload = {
      id,
      username,
      tokenType,
    };
    const options = {
      expiresIn: "2h",
    };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, options);
    return token;
  };
}
