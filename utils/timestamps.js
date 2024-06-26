export const getTimestampsConfig = () => ({
  timestamps: {
    currentTime: () => {
      let date = new Date();
      let newDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60 * 1000 * -1
      );
      return newDate;
    },
  },
  versionKey: false,
});
