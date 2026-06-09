

const clientio = io("http://localhost:5001", {
    auth:{
        auth:`admin ${localStorage.getItem("auth")}`
    }
});

clientio.on("connect", () => {
    console.log("CONNECTED");

    console.log("EMITTING HI2");

    clientio.emit("hi2", {
        message: "hi mohammed"
    });
});

clientio.on("connect_error", (error) => {
    console.log(error);
});
