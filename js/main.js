(function () {
  const config = window.SITE_CONFIG || {};
  const canvas = document.getElementById("confetti");
  const celebrateBtn = document.getElementById("celebrate-btn");
  const year = document.getElementById("year");
  const gallery = document.getElementById("gallery-grid");
  const wishesList = document.getElementById("wishes-list");

  document.querySelectorAll("[data-bind]").forEach((node) => {
    const key = node.getAttribute("data-bind");
    if (config[key]) {
      node.textContent = config[key];
    }
  });

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (wishesList) {
    (config.wishes || []).forEach((wish) => {
      const item = document.createElement("li");
      item.textContent = wish;
      wishesList.appendChild(item);
    });
  }

  if (gallery) {
    const images = config.images || [];
    if (images.length === 0) {
      for (let i = 0; i < 3; i += 1) {
        const figure = document.createElement("figure");
        figure.innerHTML = '<div class="placeholder">Добавьте фото</div>';
        gallery.appendChild(figure);
      }
    } else {
      images.forEach((src) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = src;
        img.alt = config.name || "Kate";
        figure.appendChild(img);
        gallery.appendChild(figure);
      });
    }
  }

  if (!canvas || !canvas.getContext) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const pieces = [];
  const colors = ["#7a2436", "#c46a7a", "#c4a15a", "#f4efe6", "#2b1d1a"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawn(count) {
    for (let i = 0; i < count; i += 1) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 2 + Math.random() * 3,
        drift: -1 + Math.random() * 2,
        tilt: Math.random() * Math.PI,
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((piece, index) => {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.tilt += 0.08;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.tilt);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -4, piece.size, 8);
      ctx.restore();
      if (piece.y > canvas.height + 20) {
        pieces.splice(index, 1);
      }
    });
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  celebrateBtn?.addEventListener("click", () => spawn(80));
  spawn(40);
  tick();
})();
