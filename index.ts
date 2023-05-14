import app from "./server";

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});