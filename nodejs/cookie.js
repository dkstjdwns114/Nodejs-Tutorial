let http = require("http");
let cookie = require("cookie");
http
  .createServer(function (request, response) {
    console.log(request.headers.cookie);
    let cookies = {};
    if (request.headers.cookie !== undefined) {
      cookies = cookie.parse(request.headers.cookie);
    }
    console.log(cookies.yummy_cookie);
    response.writeHead(200, {
      "Set-Cookie": [
        "yummy_cookie=choco",
        "tasty_cookie=strawberry",
        `Permanent=cookies; Max-Age=${60 * 60 * 24 * 30}`
      ]
    });
    response.end("Cookie!!");
  })
  .listen(3000);
