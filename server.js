import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("DB conectada");
});

/* LOGIN */

app.post("/login", (req, res) => {
  const { email, password } =
    req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email=? AND password=?",
    [email, password],
    (err, data) => {
      if (err)
        return res
          .status(500)
          .json(err);

      if (data.length > 0) {
        res.json({
          ok: true,
          role:
            data[0].role ||
            "cliente",
        });
      } else {
        res.status(401).json({
          ok: false,
        });
      }
    }
  );
});

/* GET PRODUCTOS */

app.get("/productos", (req, res) => {
  db.query(
    "SELECT * FROM productos",
    (err, data) => {
      if (err)
        return res
          .status(500)
          .json(err);

      res.json(data);
    }
  );
});

/* POST PRODUCTO */

app.post("/productos", (req, res) => {
  let {
    nombre,
    precio,
    imagen,
    marca,
    categoria,
    oferta,
  } = req.body;

  oferta = Number(oferta);

  if (
    !nombre ||
    nombre.trim() === ""
  ) {
    return res.status(400).json({
      error:
        "Nombre obligatorio",
    });
  }

  if (
    !precio ||
    precio < 0
  ) {
    return res.status(400).json({
      error:
        "Precio inválido",
    });
  }

  db.query(
    `INSERT INTO productos
    (nombre, precio, imagen, marca, categoria, oferta)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      precio,
      imagen,
      marca,
      categoria,
      oferta,
    ],
    (err, result) => {
      if (err) {
        console.log(err);

        return res
          .status(500)
          .json(err);
      }

      res.json({
        id: result.insertId,
        nombre,
        precio,
        imagen,
        marca,
        categoria,
        oferta,
      });
    }
  );
});

/* DELETE */

app.delete(
  "/productos/:id",
  (req, res) => {
    db.query(
      "DELETE FROM productos WHERE id=?",
      [req.params.id],
      (err) => {
        if (err)
          return res
            .status(500)
            .json(err);

        res.json({
          ok: true,
        });
      }
    );
  }
);

app.listen(
  process.env.PORT,
  () => {
    console.log(
      "Servidor en puerto",
      process.env.PORT
    );
  }
);