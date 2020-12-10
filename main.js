const express = require("express");
const app = express();
const port = 3000;
let fs = require("fs");
let template = require("./lib/template.js");
let path = require("path");
let sanitizeHtml = require("sanitize-html");
let qs = require("querystring");
let cookie = require("cookie");
let bodyParser = require("body-parser");
let compression = require("compression");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", function (request, response, next) {
  fs.readdir("./data", function (error, filelist) {
    request.list = filelist;
    next();
  });
});

function authIsOwner(request, response) {
  let isOwner = false;
  let cookies = {};
  if (request.headers.cookie) {
    cookies = cookie.parse(request.headers.cookie);
  }
  if (cookies.email === "apple@apple.com" && cookies.password === "1234") {
    isOwner = true;
  }
  return isOwner;
}

function authStatusUI(request, response) {
  let authStatusUI = '<a href="/login">login</a>';
  if (authIsOwner(request, response)) {
    authStatusUI = `apple님 환영합니다. <a href="/logout_process">logout</a>`;
  }
  return authStatusUI;
}

// route, routing
app.get("/", (request, response) => {
  let title = "Welcome";
  let description = "Hello, Node.js";
  let list = template.list(request.list);
  let html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
    <img src="/images/jisoo.png" style="width: 330px; display: block; margin-top: 20px;">
    `,
    `<a href="/create">create</a>`,
    authStatusUI(request, response)
  );
  response.send(html);
});

app.get("/page/:pageId", (request, response) => {
  let filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "UTF-8", function (err, description) {
    let title = request.params.pageId;
    let sanitizedTitle = sanitizeHtml(title);
    let sanitizedDescriptioni = sanitizeHtml(description, {
      allowedTags: ["h1"]
    });
    let list = template.list(request.list);
    let html = template.HTML(
      title,
      list,
      `<h2>${sanitizedTitle}</h2>${sanitizedDescriptioni}`,
      `<a href="/create">create</a> 
          <a href="/update/${sanitizedTitle}">update</a> 
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}" />
            <input type="submit" value="delete" />
          </form>
          `,
      authStatusUI(request, response)
    );
    response.send(html);
  });
});

app.get("/create", (request, response) => {
  if (authIsOwner(request, response) === false) {
    response.end("Login required!!");
    return false;
  }
  let title = "WEB - create";
  let list = template.list(request.list);
  let html = template.HTML(
    title,
    list,
    `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title" /></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit"/>
        </p>
      </form>
      `,
    "",
    authStatusUI(request, response)
  );
  response.send(html);
});

app.post("/create_process", (request, response) => {
  /*
  if (authIsOwner(request, response) === false) {
    response.end("Login required!!");
    return false;
  }
  let body = "";
  request.on("data", function (data) {
    body += data;
  });
  request.on("end", function () {
    let post = qs.parse(body);
    let title = post.title;
    let description = post.description;
    fs.writeFile(`data/${title}`, description, "UTF-8", function (err) {
      response.redirect(`/page/${title}`);
    });
  });
  */

  let post = request.body;
  let title = post.title;
  let description = post.description;
  fs.writeFile(`data/${title}`, description, "UTF-8", function (err) {
    response.redirect(`/page/${title}`);
  });
});

app.get("/update/:pageId", (request, response) => {
  if (authIsOwner(request, response) === false) {
    response.end("Login required!!");
    return false;
  }
  let filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "UTF-8", function (err, description) {
    let title = request.params.pageId;
    let list = template.list(request.list);
    let html = template.HTML(
      title,
      list,
      `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}" />
          <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit"/>
          </p>
        </form>
        `,
      `<a href="/create">create</a> <a href="/update/${title}">update</a>`,
      authStatusUI(request, response)
    );
    response.send(html);
  });
});

app.post("/update_process", (request, response) => {
  if (authIsOwner(request, response) === false) {
    response.end("Login required!!");
    return false;
  }
  let post = request.body;
  let id = post.id;
  let title = post.title;
  let description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, "UTF-8", function (err) {
      response.redirect(`/page/${title}`);
    });
  });
});

app.post("/delete_process", (request, response) => {
  if (authIsOwner(request, response) === false) {
    response.end("Login required!!");
    return false;
  }
  let post = request.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    response.redirect("/");
  });
});

app.get("/login", (request, response) => {
  fs.readdir("./data", function (error, filelist) {
    let title = "Login";
    let list = template.list(filelist);
    let html = template.HTML(
      title,
      list,
      `<form action="login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="password" placeholder="password"></p>
        <p><input type="submit"></p>
       </form>
      `,
      `<a href="/create">create</a>`
    );
    response.send(html);
  });
});

app.post("/login_process", (request, response) => {
  let body = "";
  request.on("data", function (data) {
    body += data;
  });
  request.on("end", function () {
    let post = qs.parse(body);
    if (post.email === "apple@apple.com" && post.password === "1234") {
      response.writeHead(302, {
        "Set-Cookie": [
          `email=${post.email}`,
          `password=${post.password}`,
          `nickname=apple`
        ],
        Location: `/`
      });
      response.end();
    } else {
      response.end("Who are you?");
    }
  });
});

app.get("/logout_process", (request, response) => {
  let body = "";
  request.on("data", function (data) {
    body += data;
  });
  request.on("end", function () {
    let post = qs.parse(body);
    response.writeHead(302, {
      "Set-Cookie": [
        `email=; Max-Age=0`,
        `password=; Max-Age=0`,
        `nickname=; Max-Age=0`
      ],
      Location: `/`
    });
    response.end();
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
