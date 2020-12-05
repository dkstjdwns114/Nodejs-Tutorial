module.exports = template = {
  HTML: function (title, list, body, control) {
    return `
      <!DOCTYPE html>
    <html>
      <head>
        <title>WEB2 - ${title}</title>
        <meta charset="utf-8" />
      </head>
      <body>
        <a href="/login">login</a>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
      </body>
    </html>
    `;
  },
  list: function (filelist) {
    let list = "<ul>";
    let i = 0;
    while (i < filelist.length) {
      list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i += 1;
    }
    list += "</ul>";
    return list;
  }
};
