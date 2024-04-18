const authConfig = (env) => ({
  defaultPassword: "1234",
  jwtSecret: "Hfretsaffad2VyZldA",
  jwtExpiresIn: "10d",
  jwtAlgorithm: "HS512",
  saltRounds: 10,
  refreshTokenSecret:
    env.REFRESH_TOKEN_SECRET || "VmVyeVBvd2VyZnVsbFNlY3JldA==",
  refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN || "7d", // 7 days
});

export default authConfig;
