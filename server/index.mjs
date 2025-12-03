import express from "express";
import morgan from "morgan";
import { check, validationResult } from "express-validator";
import cors from "cors";
import session from "express-session";

// init express
const app = new express();
const port = 3001;

// middleware
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessState: 200,
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/static", express.static("public")); //for cards images
// you can access a file using http://localhost:3001/static/{filename}
// if the file is in a directory you have to specify the full path


app.use(
  session({
    secret: "shhhhh... it's a secret!",
    resave: false,
    saveUninitialized: false,
  })
);

/** ROUTES **/


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
