import jwt from "jsonwebtoken";

export const verifyAccessToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decodedToken) => {
      if (error) {
        if (error.name === "JsonWebTokenError") {
          return reject({
            status: 401,
            message: "Invalid accessToken",
          });
        }
        if (error.name === "TokenExpiredError") {
          return reject({
            status: 401,
            message: "Expired accessToken",
          });
        }
        return reject({
          status: 500,
          message: "Internal server error",
        });
      }
      resolve(decodedToken);
    });
  });
};

export const verifyRefreshToken = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decodedToken) => {
      if (error) {
        if (error.name === "JsonWebTokenError") {
          return reject({
            status: 401,
            message: "Invalid refreshToken",
          });
        }
        if (error.name === "TokenExpiredError") {
          return reject({
            status: 401,
            message: "Expired refreshToken",
          });
        }
        return reject({
          status: 500,
          message: "Internal server error",
        });
      }
      resolve(decodedToken);
    });
  });
};
