import express from "express";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(express.json());

//helper:;
const round2 = (n) => Number(Number(n).toFixed(2));
const pos = (n) => typeof n === "number" && isFinite(n) && n > 0;
const triOk = (a, b, c) => a + b > c && a + c > b && b + c > a;

function calcOne(p) {
  //1
  if (!p || typeof p !== "object")
    throw { status: 400, msg: "invalid JSON body" };
  console.log(p.type);

  const type = String(p.type || "").toLowerCase();

  if (!type) throw { status: 400, msg: "type is required" };

  //circlee
  if (type === "circle") {
    if (!pos(p.radius)) throw { status: 400, msg: "radius must be positive" };

    const area = Math.PI * p.radius * p.radius;

    const perimeter = 2 * Math.PI * p.radius;

    return {
      shape: "ciercle",
      area: round2(area),
      perimeter: round2(perimeter),
    };
  }

  //recc

  if (type === "triangle") {
    const { base, height, side1, side2, side3 } = p;
    if (!pos(base)) throw { status: 400, msg: "base must be positive" };

    if (!pos(height)) throw { status: 400, msg: "heigt must be positiv" };

    if (![side1, side2, side3].every(pos))
      throw { status: 400, msg: "sides must be postive" };

    if (!triOk(side1, side2, side3))
      throw {
        status: 400,
        msg: "sum of any 2 side must be greater than the third",
      };

    const area = 0.5 * base * height;
    const perimeter = side1 + side2 + side3;
    return {
      shape: "triangle",
      area: round2(area),
      perimeter: round2(perimeter),
    };
  }

  if (type === "rectangle") {
    if (!pos(p.length)) throw { status: 400, msg: "length must be positive" };
    if (!pos(p.width)) throw { status: 400, msg: "width must be posItivE" };

    const area = p.length * p.width;
    const perimeter = 2 * (p.length * p.width);
    return {
      shape: "rectangle",
      area: round2(area),
      perimeter: round2(perimeter),
    };
  }

  throw { status: 400, msg: "invalid shape type" };
}

//APi
app.post("/api/shapes/calculate", (req, res) => {
  const body = req.body;

  if (Array.isArray(body)) {
    if (body.length == 0)
      return res.status(400).json({ error: "array body must be non-empty" });
    const results = [];
    const errors = [];
    body.forEach((item, i) => {
      try {
        results.push(calcOne(item));
      } catch (e) {
        errors.push({ index: i, error: e.msg || "processing error" });
      }
    });
    return res.status(errors.length ? 207 : 200).json({ results, errors });
  }

  try {
    console.log(body);

    const out = calcOne(body);

    return res.json(out);
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ error: e.msg || "internal serverr error" });
  }
});

//swagger
const swaggerDoc = {
  openapi: "3.0.0",
  info: { title: "Shape Calculator (Simple)", version: "1.0.0" },
  servers: [{ url: "http://localhost:8080" }],
  paths: {
    "/api/shapes/calculate": {
      post: {
        summary: "Calculate area & perimeter (single or batch)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/ShapeRequest" },
                  {
                    type: "array",
                    items: { $ref: "#/components/schemas/ShapeRequest" },
                  },
                ],
              },
              examples: {
                circle: { value: { type: "circle", radius: 5 } },
                rectangle: {
                  value: { type: "rectangle", length: 4, width: 3 },
                },
                triangle: {
                  value: {
                    type: "triangle",
                    base: 6,
                    height: 4,
                    side1: 5,
                    side2: 6,
                    side3: 7,
                  },
                },
                batch: {
                  value: [
                    { type: "circle", radius: 5 },
                    { type: "rectangle", length: 4, width: 3 },
                  ],
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Success" },
          207: { description: "Partial success in batch" },
          400: { description: "Bad Request" },
          500: { description: "Server Error" },
        },
      },
    },
  },
  components: {
    schemas: {
      ShapeRequest: {
        type: "object",
        required: ["type"],
        properties: {
          type: { type: "string", enum: ["circle", "rectangle", "triangle"] },
          radius: { type: "number" },
          length: { type: "number" },
          width: { type: "number" },
          base: { type: "number" },
          height: { type: "number" },
          side1: { type: "number" },
          side2: { type: "number" },
          side3: { type: "number" },
        },
      },
    },
  },
};
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

//health
app.get("/health", (_, res) => res.json({ ok: true }));

//  start serveer
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`Swagger -> http://localhost:${PORT}/swagger`);
});

app.get("/", (req, res) => {
  res.send("Welcome to Shape Calculator API! Use /swagger to see the docs.");
});
