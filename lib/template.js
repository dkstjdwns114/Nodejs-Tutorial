module.exports = {
  HTML: function (
    title,
    list,
    body,
    control,
    authStatusUI = '<a href="/login">login</a>'
  ) {
    return `
      <!DOCTYPE html>
    <html>
      <head>
        <title>WEB2 - ${title}</title>
        <meta charset="utf-8" />
      </head>
      <body>
        ${authStatusUI}
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
      list += `<li><a href="/page/${filelist[i]}">${filelist[i]}</a></li>`;
      i += 1;
    }
    list += "</ul>";
    return list;
  }
};
