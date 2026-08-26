(function () {
  let doveCounter = 0;

  function vane(x, y, angle, length, width, camber) {
    const t = (angle * Math.PI) / 180;
    const sin = Math.sin(t);
    const cos = Math.cos(t);
    const bend = camber ?? 0.1;
    const tipX = x + sin * length + cos * length * bend;
    const tipY = y - cos * length + sin * length * bend;
    const mx = x + sin * length * 0.42;
    const my = y - cos * length * 0.42;
    const nx = cos * width;
    const ny = sin * width;
    const sx = cos * width * 0.35;
    const sy = sin * width * 0.35;
    return `M${x.toFixed(1)} ${y.toFixed(1)} C${(x + sx).toFixed(1)} ${(y + sy).toFixed(1)} ${(mx - nx).toFixed(1)} ${(my - ny).toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} C${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${(x - sx).toFixed(1)} ${(y - sy).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} Z`;
  }

  function rachis(x, y, angle, length) {
    const t = (angle * Math.PI) / 180;
    const x2 = x + Math.sin(t) * length * 0.78;
    const y2 = y - Math.cos(t) * length * 0.78;
    return `M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }

  function feather(id, x, y, angle, length, width, tone, opacity, camber) {
    return `
      <path d="${vane(x, y, angle, length, width, camber)}" fill="url(#${id}-${tone})" opacity="${opacity ?? 1}"/>
      <path d="${rachis(x, y, angle, length)}" stroke="#D4CDC4" stroke-width="0.35" opacity="0.28"/>`;
  }

  function range(from, to, step) {
    const values = [];
    for (let value = from; value <= to; value += step) {
      values.push(value);
    }
    return values;
  }

  function createDove(withLetter) {
    const id = `live-${++doveCounter}`;
    const tail = range(-18, 108, 4.8)
      .map((angle, i) => {
        const tone = i % 3 === 0 ? "cool" : i % 3 === 1 ? "lit" : "shade";
        const length = 168 - Math.abs(angle - 42) * 0.28;
        const width = 15 + (i % 4) * 0.8;
        return feather(id, 248, 236, angle, length, width, tone, 0.94, 0.04 + (i % 5) * 0.012);
      })
      .join("");

    const tailCoverts = range(-8, 96, 8)
      .map((angle, i) =>
        feather(id, 236, 240, angle, 92 - Math.abs(angle - 40) * 0.16, 12, i % 2 ? "lit" : "cool", 0.88, 0.06)
      )
      .join("");

    const wingBack = range(-62, 18, 6.5)
      .map((angle, i) =>
        feather(id, 214, 198, angle, 118 - i * 3.2, 13, i % 2 ? "shade" : "cool", 0.93, 0.08)
      )
      .join("");

    const wingBackCoverts = range(-48, 8, 8)
      .map((angle, i) => feather(id, 208, 204, angle, 62 - i * 2, 10, "lit", 0.9, 0.05))
      .join("");

    const wingFront = range(28, 118, 7)
      .map((angle, i) =>
        feather(id, 196, 214, angle, 96 - i * 2.4, 12, i % 2 ? "cool" : "shade", 0.92, 0.07)
      )
      .join("");

    const wingFrontCoverts = range(36, 96, 9)
      .map((angle, i) => feather(id, 192, 218, angle, 52 - i * 1.6, 9, "lit", 0.9, 0.04))
      .join("");

    const muffs = [
      feather(id, 148, 286, -28, 46, 10, "cool", 0.92, 0.12),
      feather(id, 156, 288, -8, 52, 11, "lit", 0.95, 0.1),
      feather(id, 164, 290, 10, 50, 11, "cool", 0.93, 0.1),
      feather(id, 172, 288, 28, 46, 10, "shade", 0.9, 0.12),
      feather(id, 160, 292, 2, 38, 9, "lit", 0.88, 0.08),
    ].join("");

    const letter = withLetter
      ? `
        <g class="dove-letter">
          <rect x="22" y="168" width="46" height="32" rx="2.2" fill="#FBF6EE" stroke="#CDB79A" stroke-width="0.7"/>
          <path d="M22 170.8 L45 184 L68 170.8" stroke="#E2C7B0" stroke-width="0.7" fill="none"/>
          <path d="M45 186.5 C40.6 181.8 34.2 182.2 34.2 188 C34.2 193.6 45 200.2 45 200.2 C45 200.2 55.8 193.6 55.8 188 C55.8 182.2 49.4 181.8 45 186.5 Z" fill="#E899AF"/>
        </g>`
      : "";

    return `
      <div class="dove-stage">
        <svg class="dove-svg" viewBox="0 0 420 400" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${id}-lit" x1="18%" y1="0%" x2="86%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="55%" stop-color="#F4F0EA"/>
              <stop offset="100%" stop-color="#D9D3CA"/>
            </linearGradient>
            <linearGradient id="${id}-cool" x1="0%" y1="12%" x2="100%" y2="90%">
              <stop offset="0%" stop-color="#F7F8F9"/>
              <stop offset="48%" stop-color="#E4E6EA"/>
              <stop offset="100%" stop-color="#C5C8D0"/>
            </linearGradient>
            <linearGradient id="${id}-shade" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stop-color="#EEEAE4"/>
              <stop offset="100%" stop-color="#B7B3AE"/>
            </linearGradient>
            <radialGradient id="${id}-body" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="42%" stop-color="#F3F0EB"/>
              <stop offset="100%" stop-color="#C9C4BE"/>
            </radialGradient>
            <radialGradient id="${id}-head" cx="34%" cy="36%" r="66%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="100%" stop-color="#D8D3CC"/>
            </radialGradient>
            <filter id="${id}-down" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="3" seed="${doveCounter}" result="n"/>
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.16 0" result="t"/>
              <feComposite in="t" in2="SourceGraphic" operator="in" result="cut"/>
              <feBlend in="SourceGraphic" in2="cut" mode="soft-light"/>
            </filter>
            <filter id="${id}-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.2"/>
            </filter>
            <filter id="${id}-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="b"/>
              <feMerge>
                <feMergeNode in="b"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <ellipse cx="188" cy="338" rx="58" ry="10" fill="#B8AEA4" opacity="0.14" filter="url(#${id}-soft)"/>

          <g class="dove-tail">
            ${tail}
            ${tailCoverts}
          </g>

          <g class="dove-wing dove-wing--up">
            ${wingBack}
            ${wingBackCoverts}
          </g>

          <g class="dove-body" filter="url(#${id}-down)">
            <ellipse cx="176" cy="232" rx="82" ry="54" transform="rotate(-14 176 232)" fill="url(#${id}-body)"/>
            <ellipse cx="148" cy="218" rx="42" ry="30" transform="rotate(-18 148 218)" fill="#FFFFFF" opacity="0.55"/>
            <path d="M118 214 C138 198 168 196 196 210" stroke="#D2CCC4" stroke-width="0.7" opacity="0.22"/>
          </g>

          <g class="dove-wing dove-wing--down">
            ${wingFront}
            ${wingFrontCoverts}
          </g>

          <g class="dove-feet">
            ${muffs}
          </g>

          <g class="dove-head" filter="url(#${id}-glow)">
            <circle cx="104" cy="168" r="24" fill="url(#${id}-head)"/>
            <ellipse cx="96" cy="164" rx="16" ry="14" fill="#FFFFFF" opacity="0.35"/>
            <circle cx="90" cy="166" r="3.6" fill="#16120F"/>
            <circle cx="91.1" cy="164.9" r="1.15" fill="#FFFFFF" opacity="0.88"/>
            <circle cx="89.2" cy="167.4" r="0.45" fill="#FFFFFF" opacity="0.35"/>
            <path d="M82 174 C70 176 58 178 52 180 C60 182 72 180 82 178 Z" fill="#E2B39A"/>
            <path d="M82 176 C72 178 62 180 56 182 C64 182 74 180 82 178 Z" fill="#F0C4AE" opacity="0.55"/>
            ${letter}
          </g>
        </svg>
      </div>`;
  }

  window.createDove = createDove;
})();
