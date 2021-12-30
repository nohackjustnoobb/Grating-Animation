var canvas,
  ctx,
  total_images,
  images = [],
  grating,
  controller;
const width = screen.width * 0.75;
const height = screen.height * 0.75;
const max_image = 15;
const pixel_size = 1;

function setup() {
  canvas = document.getElementById("preview");
  ctx = canvas.getContext("2d");
  grating = document.getElementById("grating");
  grating_ctx = grating.getContext("2d");
  controller = document.getElementById("controller");
}

function getfiles() {
  var files = document.getElementById("upload_file").files;
  var state = document.getElementById("state");
  if (files.length > max_image) {
    state.innerHTML = "Error! Maximum Image is " + max_image;
    return;
  }
  if (files.length == 1) {
    state.innerHTML = "Error! Minimum Image is 2";
    return;
  }
  state.innerHTML = "";
  total_images = files.length;
  readfiles(files);
}

function readfiles(files) {
  if (files) {
    [].forEach.call(files, (file) => {
      var reader = new FileReader();
      reader.onload = () => {
        images.push(reader.result);
        drawImage();
      };
      reader.readAsDataURL(file);
    });
  }
}

function drawImage() {
  if (images.length != total_images) {
    return;
  }
  var img = new Image();
  img.onload = () => {
    var rate = img.naturalHeight / height;
    canvas.height = (img.naturalHeight / rate).toFixed(0);
    canvas.width = (img.naturalWidth / rate).toFixed(0);
    img.height = (img.naturalHeight / rate).toFixed(0);
    img.width = (img.naturalWidth / rate).toFixed(0);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-over";
    [].forEach.call(images, (img_src) => {
      var i = images.indexOf(img_src);
      var image = new Image();
      image.onload = () => {
        if (i == 0) {
          return;
        }
        for (
          var j = i * pixel_size;
          j <= canvas.width;
          j += pixel_size * total_images
        ) {
          ctx.clearRect(j, 0, (total_images - i) * pixel_size, canvas.height);
        }
        image.height = canvas.height;
        image.width = canvas.width;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = img_src;
    });
    images = [];
    grating.height = canvas.height;
    grating.width = canvas.width * 10;
    grating_ctx.fillRect(0, 0, grating.width, grating.height);
    for (var k = 0; k <= grating.width; k += pixel_size * total_images) {
      grating_ctx.clearRect(k, 0, pixel_size, canvas.height);
    }
  };
  img.src = images[0];
  controller.style.display = "flex";
  document.getElementById("audio").style.display = "flex";
  document.getElementById("download_html").style.display = "flex";
}

function reload() {
  var speed = document.getElementById("speed").value;
  var grating = document.getElementById("grating");
  grating.style.animationName = "grating";
  grating.style.animationDuration = 22 - speed * 2 + "s";
}

function loadaudio() {
  var audio = document.getElementById("audio_input").files;
  var audio_reader = new FileReader();
  audio_reader.onload = () => {
    document.getElementById("contols").innerHTML =
      '<audio controls><source id="audio_src"></audio>';
    document.getElementById("audio_src").src = audio_reader.result;
    document.getElementById("audio_src").onload = function () {
      document.getElementById("audio").load();
    };
  };
  audio_reader.readAsDataURL(audio[0]);
}

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function generator() {
  download(
    "animation.html",
    `<!DOCTYPE html><html><head><title>animation</title><style>div{display:flex;justify-content:center;align-content:center;text-align:center;text-decoration:none;}@keyframes grating {0%{left: 0;}100%{left: -100px;}}</style></head><body style="overflow-x:hidden;"><div><img src="${document
      .getElementById("preview")
      .toDataURL("image/png")}"></img><img src="${document
      .getElementById("grating")
      .toDataURL(
        "image/png"
      )}" style="position:absolute;animation-name:grating;animation-timing-function:linear;animation-iteration-count:infinite;animation-duration:${
      22 - document.getElementById("speed").value * 2
    }s;"></img></div><div><audio controls autoplay ><source src="${
      document.getElementById("audio_src")?.src
    }"></audio></div></body></html>`
  );
}
