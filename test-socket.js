const { io } = require("socket.io-client");
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
  socket.emit("execute-code", {
    roomid: "test1234",
    code: "console.log('hi');",
    language: "javascript"
  });
});

socket.on("execution-result", (result) => {
  console.log("Got result:", result);
  process.exit(0);
});

socket.on("connect_error", (error) => {
  console.log("Error:", error);
  process.exit(1);
});
