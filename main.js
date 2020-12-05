let http = require("http");
let fs = require("fs");
let url = require("url");
let qs = require("querystring");
let path = require("path");
let template = require("./lib/template.js");
let sanitizeHtml = require("sanitize-html");
let cookie = require("cookie");

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

let app = http.createServer(function (request, response) {
  if (request.url === "/favicon.ico") {
    response.writeHead(200, { "Content-Type": "image/x-icon" });
    return response.end();
  }
  let _url = request.url;
  let queryData = url.parse(_url, true).query;
  let pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (error, filelist) {
        let title = "Welcome";
        let description = "Hello, Node.js";

        let list = template.list(filelist);
        let html = template.HTML(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`,
          authStatusUI(request, response)
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      fs.readdir("./data", function (error, filelist) {
        let filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, "UTF-8", function (err, description) {
          let title = queryData.id;
          let sanitizedTitle = sanitizeHtml(title);
          let sanitizedDescriptioni = sanitizeHtml(description, {
            allowedTags: ["h1"]
          });
          let list = template.list(filelist);
          let html = template.HTML(
            title,
            list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescriptioni}`,
            `<a href="/create">create</a> 
              <a href="/update?id=${sanitizedTitle}">update</a> 
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}" />
                <input type="submit" value="delete" />
              </form>
              `,
            authStatusUI(request, response)
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (error, filelist) {
      let title = "WEB - create";
      let list = template.list(filelist);
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
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname === "/create_process") {
    let body = "";
    request.on("data", function (data) {
      body += data;
    });
    request.on("end", function () {
      let post = qs.parse(body);
      let title = post.title;
      let description = post.description;
      fs.writeFile(`data/${title}`, description, "UTF-8", function (err) {
        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", function (error, filelist) {
      let filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, "UTF-8", function (err, description) {
        let title = queryData.id;
        let list = template.list(filelist);
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
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`,
          authStatusUI(request, response)
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === "/update_process") {
    let body = "";
    request.on("data", function (data) {
      body += data;
    });
    request.on("end", function () {
      let post = qs.parse(body);
      let id = post.id;
      let title = post.title;
      let description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, "UTF-8", function (err) {
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        });
      });
    });
  } else if (pathname === "/delete_process") {
    let body = "";
    request.on("data", function (data) {
      body += data;
    });
    request.on("end", function () {
      let post = qs.parse(body);
      let id = post.id;
      let filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function (error) {
        response.writeHead(302, { Location: `/` });
        response.end();
      });
    });
  } else if (pathname === "/login") {
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
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname === "/login_process") {
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
  } else if (pathname === "/logout_process") {
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
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
