Shape Calculator API

Super simple Node.js + Express API to calc area & perimeter for:

circle

rectangle

triangle

It’s small, easy, and just works. Swagger docs included if you wanna click around.

How it works (in short)

Send a POST to /api/shapes/calculate with JSON.

Body can be one shape object or an array of shapes.

API checks your input (no negative numbers, triangle must be valid).

You get back area and perimeter. That’s it, nothing fancy.

Run it

Install: npm install

Start: npm start

Default port: 8080

Health check: http://localhost:8080/health
Swagger (optional): http://localhost:8080/swagger

Examples (requests)

Circle
{ "type": "circle", "radius": 5 }

Rectangle
{ "type": "rectangle", "length": 4, "width": 3 }

Triangle
{ "type": "triangle", "base": 6, "height": 4, "side1": 5, "side2": 6, "side3": 7 }

Batch (many at once)
[ { "type": "circle", "radius": 5 }, { "type": "rectangle", "length": 4, "width": 3 } ]

Example response

{ "shape": "circle", "area": 78.54, "perimeter": 31.42 }

For batch you’ll get an array of results back.
