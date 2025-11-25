export default {
  get secret() {
    return process.env.SECRET_KEY as string;
  },
};
