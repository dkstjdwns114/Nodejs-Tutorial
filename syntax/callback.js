// function a() {
//   console.log("A");
// }
let a = function () {
  console.log("A");
};

function slowfunc(callback) {
  callback();
}

slowfunc(a);
