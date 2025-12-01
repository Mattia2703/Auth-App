export default {
  get secret() {
    return process.env.SECRET_KEY as string;
  },
  get refreshSecret() {
    return process.env.REFRESH_SECRETE as string;
  },
};
