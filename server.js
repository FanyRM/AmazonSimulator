const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Amazon S3 Simulator running on port ${PORT}`);
  console.log(` Storage location: ./src/storage/`);
  console.log(` Base URL: http://localhost:${PORT}`);
});
