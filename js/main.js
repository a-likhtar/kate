(function () {
  const config = window.SITE_CONFIG || {};
  const stories = config.stories || [];
  const finaleLines = config.finale?.lines || [];

  const introEl = document.getElementById("intro");
  const storiesEl = document.getElementById("stories");
  const finaleEl = document.getElementById("finale");
  const introCopy = document.getElementById("intro-copy");
  const introStart = document.getElementById("intro-start");
  const introDove = document.getElementById("intro-dove");
  const progressEl = document.getElementById("progress");
  const storyContent = document.getElementById("story-content");
  const storyBg = document.getElementById("story-bg");
  const doveCompanion = document.getElementById("dove-companion");
  const heartBurst = document.getElementById("heart-burst");
  const tapPrev = document.getElementById("tap-prev");
  const tapNext = document.getElementById("tap-next");
  const finaleLinesEl = document.getElementById("finale-lines");
  const finaleDove = document.getElementById("finale-dove");
  const finaleReplay = document.getElementById("finale-replay");
  const canvas = document.getElementById("particles");

  let index = 0;
  let timer = null;
  let paused = false;
  let pauseStarted = 0;
  let remaining = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let introReady = false;
  let spawnParticles = function () {};
  let progressToken = 0;
  let progressFrame = 0;

  const gradients = [
    "linear-gradient(165deg, #fff8fb 0%, #f5c6d0 42%, #e899af 100%)",
    "linear-gradient(165deg, #fce8f0 0%, #e8a4b8 48%, #e8c872 100%)",
    "linear-gradient(165deg, #fff5f8 0%, #f0b8c8 40%, #d4789a 100%)",
    "linear-gradient(165deg, #f9dce8 0%, #e899af 50%, #f5e6c4 110%)",
    "linear-gradient(165deg, #fadce8 0%, #d4789a 45%, #d4af6a 100%)",
  ];

  bindConfig();
  mountDoves();
  setupIntro();
  setupStories();
  setupFinale();
  setupParticles();

  function mountDoves() {
    const create = window.createDove;
    if (!create) {
      return;
    }
    introDove && (introDove.innerHTML = create(true));
    doveCompanion && (doveCompanion.innerHTML = create(false));
    finaleDove && (finaleDove.innerHTML = create(true));
  }

  function bindConfig() {
    document.querySelectorAll("[data-bind]").forEach((node) => {
      const path = node.getAttribute("data-bind").split(".");
      let value = config;
      for (const key of path) {
        value = value?.[key];
      }
      if (value) {
        node.textContent = value;
      }
    });
  }

  function setupIntro() {
    window.setTimeout(() => {
      introDove?.classList.add("is-visible", "is-hovering");
    }, 350);

    window.setTimeout(() => {
      introDove?.classList.add("is-delivered");
    }, 1400);

    window.setTimeout(() => {
      introCopy?.classList.add("is-visible");
      introReady = true;
    }, 2200);

    introStart?.addEventListener("click", startStories);
  }

  function startStories() {
    if (!introReady) {
      return;
    }

    introEl?.classList.remove("is-active");
    introEl?.setAttribute("hidden", "");
    storiesEl?.removeAttribute("hidden");
    storiesEl?.classList.add("is-active");

    buildProgress();
    showStory(0, "forward");
  }

  function buildProgress() {
    if (!progressEl) {
      return;
    }

    progressEl.innerHTML = "";
    stories.forEach((_, i) => {
      const bar = document.createElement("div");
      bar.className = "progress__segment";
      bar.innerHTML = '<div class="progress__fill"></div>';
      bar.setAttribute("role", "tab");
      bar.setAttribute("aria-selected", i === 0 ? "true" : "false");
      progressEl.appendChild(bar);
    });
  }

  function setupStories() {
    tapPrev?.addEventListener("click", () => goPrev());
    tapNext?.addEventListener("click", () => goNext());

    const viewport = document.querySelector(".story-viewport");
    viewport?.addEventListener("touchstart", onTouchStart, { passive: true });
    viewport?.addEventListener("touchend", onTouchEnd, { passive: true });
    viewport?.addEventListener("mousedown", onHoldStart);
    viewport?.addEventListener("mouseup", onHoldEnd);
    viewport?.addEventListener("mouseleave", onHoldEnd);
    viewport?.addEventListener("touchstart", onHoldStart, { passive: true });
    viewport?.addEventListener("touchend", onHoldEnd);

    document.addEventListener("keydown", (event) => {
      if (!storiesEl?.classList.contains("is-active")) {
        return;
      }
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
    });
  }

  function onTouchStart(event) {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }

  function onTouchEnd(event) {
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) {
      return;
    }

    if (dx < 0) {
      goNext();
    } else {
      goPrev();
    }
  }

  function onHoldStart() {
    if (!storiesEl?.classList.contains("is-active") || paused) {
      return;
    }
    paused = true;
    pauseStarted = Date.now();
    clearTimeout(timer);
    updateProgressFill(true);
  }

  function onHoldEnd() {
    if (!paused) {
      return;
    }
    paused = false;
    const elapsed = Date.now() - pauseStarted;
    remaining = Math.max(0, remaining - elapsed);
    scheduleAdvance(remaining);
    animateProgressFill(remaining);
  }

  function goNext() {
    if (index >= stories.length - 1) {
      showFinale();
      return;
    }
    showStory(index + 1, "forward");
  }

  function goPrev() {
    if (index <= 0) {
      return;
    }
    showStory(index - 1, "back");
  }

  function showStory(nextIndex, direction) {
    clearTimeout(timer);
    index = nextIndex;
    const story = stories[index];
    const duration = story.duration || 4500;

    if (storyBg) {
      storyBg.style.background = gradients[index % gradients.length];
    }

    renderStory(story);
    updateProgressSegments();
    remaining = duration;

    storyContent?.classList.remove("is-entering", "is-exiting");
    void storyContent?.offsetWidth;
    storyContent?.classList.add("is-entering");

    if (direction === "forward" && index > 0 && index % 3 === 0) {
      triggerHeartBurst();
    }

    doveCompanion?.classList.toggle("is-bob", index % 2 === 0);

    paused = false;
    scheduleAdvance(duration);
    animateProgressFill(duration);
  }

  function renderStory(story) {
    if (!storyContent) {
      return;
    }

    if (story.type === "title") {
      storyContent.innerHTML = `
        <p class="story-eyebrow">${story.sub || ""}</p>
        <h2 class="story-title">${story.text}</h2>
      `;
      return;
    }

    if (story.type === "trait") {
      storyContent.innerHTML = `
        <p class="story-label">${story.label || ""}</p>
        <p class="story-trait">${story.text}</p>
      `;
      return;
    }

    if (story.type === "quote") {
      const lines = story.text.split("\n").map((line) => `<span>${line}</span>`).join("");
      storyContent.innerHTML = `
        <blockquote class="story-quote">${lines}</blockquote>
      `;
      return;
    }

    if (story.type === "photo") {
      storyContent.innerHTML = `
        <figure class="story-photo">
          <img src="${story.src}" alt="${config.name || "Катюша"}" />
          <figcaption>${story.caption || ""}</figcaption>
        </figure>
      `;
      return;
    }

    storyContent.innerHTML = `<p class="story-trait">${story.text || ""}</p>`;
  }

  function scheduleAdvance(ms) {
    timer = window.setTimeout(() => {
      if (paused) {
        return;
      }
      goNext();
    }, ms);
  }

  function updateProgressSegments() {
    progressEl?.querySelectorAll(".progress__segment").forEach((segment, i) => {
      segment.setAttribute("aria-selected", i === index ? "true" : "false");
      const fill = segment.querySelector(".progress__fill");
      if (!fill) {
        return;
      }
      fill.style.transition = "none";
      if (i < index) {
        fill.style.width = "100%";
      } else if (i > index) {
        fill.style.width = "0%";
      } else {
        fill.style.width = "0%";
      }
    });
  }

  function animateProgressFill(duration) {
    const token = ++progressToken;
    const segment = progressEl?.querySelectorAll(".progress__segment")[index];
    const fill = segment?.querySelector(".progress__fill");
    if (!fill) {
      return;
    }

    window.cancelAnimationFrame(progressFrame);
    fill.style.transition = "none";
    fill.style.width = "0%";
    void fill.offsetWidth;

    progressFrame = window.requestAnimationFrame(() => {
      if (token !== progressToken) {
        return;
      }
      fill.style.transition = `width ${duration}ms linear`;
      fill.style.width = "100%";
    });
  }

  function updateProgressFill(isPaused) {
    const segment = progressEl?.querySelectorAll(".progress__segment")[index];
    const fill = segment?.querySelector(".progress__fill");
    if (!fill) {
      return;
    }
    fill.style.transition = isPaused ? "none" : fill.style.transition;
  }

  function triggerHeartBurst() {
    if (!heartBurst) {
      return;
    }
    heartBurst.classList.remove("is-visible");
    void heartBurst.offsetWidth;
    heartBurst.classList.add("is-visible");
  }

  function showFinale() {
    clearTimeout(timer);
    storiesEl?.classList.remove("is-active");
    storiesEl?.setAttribute("hidden", "");
    finaleEl?.removeAttribute("hidden");
    finaleEl?.classList.add("is-active");

    if (finaleLinesEl) {
      finaleLinesEl.innerHTML = finaleLines
        .map((line, i) => `<p class="finale-line" style="--delay:${i * 0.5}s">${line}</p>`)
        .join("");
    }

    spawnParticles(60, "feather");
    window.setTimeout(() => spawnParticles(40, "confetti"), 800);
  }

  function setupFinale() {
    finaleReplay?.addEventListener("click", () => {
      finaleEl?.classList.remove("is-active");
      finaleEl?.setAttribute("hidden", "");
      introEl?.removeAttribute("hidden");
      introEl?.classList.add("is-active");

      introCopy?.classList.remove("is-visible");
      introDove?.classList.remove("is-visible", "is-hovering", "is-delivered");
      introReady = false;

      index = 0;
      paused = false;

      window.setTimeout(() => introDove?.classList.add("is-visible", "is-hovering"), 150);
      window.setTimeout(() => introDove?.classList.add("is-delivered"), 800);
      window.setTimeout(() => {
        introCopy?.classList.add("is-visible");
        introReady = true;
      }, 1300);
    });
  }

  function setupParticles() {
    if (!canvas || !canvas.getContext) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const pieces = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    spawnParticles = function spawn(count, mode) {
      for (let i = 0; i < count; i += 1) {
        pieces.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * 80,
          size: mode === "feather" ? 8 + Math.random() * 10 : 5 + Math.random() * 7,
          color:
            mode === "feather"
              ? `rgba(255, 251, 247, ${0.45 + Math.random() * 0.45})`
              : ["#e8a4b8", "#e899af", "#e8c872", "#fffbf7"][Math.floor(Math.random() * 4)],
          speed: 1.5 + Math.random() * 2.5,
          drift: -1 + Math.random() * 2,
          tilt: Math.random() * Math.PI,
          spin: 0.04 + Math.random() * 0.06,
          mode,
        });
      }
    };

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((piece, i) => {
        piece.y += piece.speed;
        piece.x += piece.drift;
        piece.tilt += piece.spin;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.tilt);

        if (piece.mode === "feather") {
          ctx.fillStyle = piece.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, piece.size * 0.3, piece.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = piece.color;
          ctx.fillRect(-piece.size / 2, -3, piece.size, 6);
        }

        ctx.restore();

        if (piece.y > canvas.height + 30) {
          pieces.splice(i, 1);
        }
      });
      requestAnimationFrame(tick);
    }

    tick();
  }
})();
