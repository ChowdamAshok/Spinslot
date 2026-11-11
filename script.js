(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loading page ---------- */
  const loader = $("#loader"),
    pct = $("#pct");
  let p = 0;
  const load = setInterval(() => {
    p = Math.min(100, p + Math.random() * 9 + 3);
    pct.textContent = Math.floor(p);
    loader.style.setProperty("--p", p + "%");
    loader.querySelector(".l-water").style.setProperty("--p", p + "%");
    if (p >= 100) {
      clearInterval(load);
      setTimeout(() => {
        loader.classList.add("done");
        document.body.classList.remove("is-loading");
        document.body.classList.add("ready");
        setTimeout(() => loader.remove(), 1000);
      }, 350);
    }
  }, 110);

  /* ---------- Nav ---------- */
  const nav = $(".nav"),
    menu = $("#menu"),
    burger = $("#burger"),
    bar = $("#progress"),
    top = $("#totop");
  const setMenu = (o) => {
    menu.classList.toggle("open", o);
    burger.classList.toggle("x", o);
    burger.setAttribute("aria-expanded", o);
  };
  addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("stuck", scrollY > 10);
      top.classList.toggle("show", scrollY > 600);
      bar.style.width =
        (scrollY / (document.documentElement.scrollHeight - innerHeight)) *
          100 +
        "%";
    },
    { passive: true },
  );
  burger.onclick = (e) => {
    e.stopPropagation();
    setMenu(!menu.classList.contains("open"));
  };
  menu.onclick = (e) => e.target.tagName === "A" && setMenu(false);
  document.addEventListener(
    "click",
    (e) => !nav.contains(e.target) && setMenu(false),
  );
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  const links = [...menu.querySelectorAll("a:not(.btn)")];
  const spy = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting)
          links.forEach((a) =>
            a.classList.toggle(
              "active",
              a.getAttribute("href") === "#" + e.target.id,
            ),
          );
      }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  ["demo", "scan", "how", "features"].forEach((id) =>
    spy.observe(document.getElementById(id)),
  );

  /* ---------- QR code art ---------- */
  const qr = $("#qr");
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const fin = (x, y) =>
    [
      [0, 0],
      [14, 0],
      [0, 14],
    ].some(([a, b]) => {
      const dx = x - a,
        dy = y - b;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
      return (
        dx === 0 ||
        dy === 0 ||
        dx === 6 ||
        dy === 6 ||
        (dx > 1 && dx < 5 && dy > 1 && dy < 5)
      );
    });
  const gap = (x, y) =>
    [
      [0, 0],
      [13, 0],
      [0, 13],
    ].some(([a, b]) => x >= a && x <= a + 7 && y >= b && y <= b + 7);
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < 21; x++) {
      const i = document.createElement("i");
      if (fin(x, y) || (!gap(x, y) && rnd() > 0.52)) i.className = "on";
      qr.appendChild(i);
    }

  /* ---------- Owner stats tick ---------- */
  setInterval(() => {
    const b = $("#sBook"),
      o = $("#sOcc");
    if (Math.random() < 0.5) b.textContent = +b.textContent + 1;
    o.textContent = 1 + ((Math.random() * 3) | 0);
  }, 2500);

  /* ---------- Scroll reveal + counters ---------- */
  document
    .querySelectorAll(".sec-head,.steps li,.b,.contact-box,.proof")
    .forEach((el, i) => {
      el.classList.add("rv");
      el.style.transitionDelay = (i % 4) * 90 + "ms";
    });
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }),
    { threshold: 0.15 },
  );
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));

  /* ---------- Floating bubbles ---------- */
  const cv = $("#bubbles"),
    cx = cv.getContext("2d");
  let W,
    H,
    bubbles = [];
  const size = () => {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
  };
  size();
  addEventListener("resize", size);
  const mk = (init) => ({
    x: Math.random() * W,
    y: init ? Math.random() * H : H + 20,
    r: 4 + Math.random() * 16,
    v: 0.25 + Math.random() * 0.6,
    d: Math.random() * 6,
  });
  bubbles = Array.from({ length: 26 }, () => mk(true));
  (function draw(t) {
    cx.clearRect(0, 0, W, H);
    bubbles.forEach((b, i) => {
      b.y -= b.v;
      b.x += Math.sin(t / 900 + b.d) * 0.4;
      if (b.y < -30) bubbles[i] = mk(false);
      cx.beginPath();
      cx.arc(b.x, b.y, b.r, 0, 7);
      cx.strokeStyle = "rgba(19,196,216,.35)";
      cx.lineWidth = 1.5;
      cx.stroke();
      cx.fillStyle = "rgba(19,196,216,.07)";
      cx.fill();
    });
    if (!reduce) requestAnimationFrame(draw);
  })(0);

  /* ---------- Phone tilt ---------- */
  const ph = $("#tilt");
  if (!reduce && matchMedia("(hover:hover)").matches) {
    const hv = $(".hero-visual");
    hv.addEventListener("mousemove", (e) => {
      const r = hv.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5,
        y = (e.clientY - r.top) / r.height - 0.5;
      ph.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
    });
    hv.addEventListener("mouseleave", () => (ph.style.transform = ""));
  }

  /* ---------- Live machine board (1 real second = 1 demo minute) ---------- */
  const STATUS = {
    ok: ["Available", "p-ok"],
    use: ["In use", "p-use"],
    book: ["Booked", "p-book"],
    off: ["Maintenance", "p-off"],
  };
  const fmt = (m) =>
    m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;

  function Board(el, machines, o = {}) {
    const draw = () => {
      el.innerHTML = machines
        .map((m, i) => {
          const st =
            m.status === "off"
              ? "off"
              : m.user
                ? "use"
                : m.queue.length
                  ? "book"
                  : "ok";
          const q = m.queue
            .map(
              (x, k) => `${k + 1}. ${x.name} (Room ${x.room}) · ${fmt(x.dur)}`,
            )
            .join("<br>");
          let info =
            st === "use"
              ? `${m.user.name} · Room ${m.user.room} · ${fmt(m.rem)} left`
              : st === "off"
                ? "Under maintenance"
                : st === "book"
                  ? "Free now, reserved"
                  : "Free to use";
          let acts = "";
          if (o.interactive && st !== "off") {
            if (st === "ok")
              acts = [30, 45, 60]
                .map(
                  (d) =>
                    `<button data-a="start" data-i="${i}" data-d="${d}">Use ${d} min</button>`,
                )
                .join("");
            else
              acts = `<button data-a="book" data-i="${i}">Book next slot</button>`;
            if (m.queue.some((x) => x.me))
              acts += `<button class="alt" data-a="cancel" data-i="${i}">Cancel my booking</button>`;
          }
          return `<div class="m" id="${o.id}${i}"><div class="m-top">${m.name}<span class="pill ${STATUS[st][1]}">${STATUS[st][0]}</span></div>
        <p>${info}</p>${q ? `<p>${q}</p>` : ""}
        ${st === "use" ? `<div class="bar"><i style="width:${100 - (m.rem / m.dur) * 100}%"></i></div>` : ""}
        ${acts ? `<div class="acts">${acts}</div>` : ""}</div>`;
        })
        .join("");
    };
    const flash = (i) => {
      const n = $("#" + o.id + i, el);
      n && n.classList.add("flash");
    };
    const tick = () => {
      machines.forEach((m, i) => {
        if (!m.user) return;
        if (--m.rem > 0) {
          if (m.rem === 5)
            o.notify?.(
              "Your wash finishes in 5 minutes",
              `${m.name}. Please collect your clothes.`,
              m.user.me,
            );
          return;
        }
        o.notify?.(
          "Wash complete",
          `${m.name} is done. Please collect your clothes.`,
          m.user.me,
        );
        m.user = null;
        const nx = m.queue.shift();
        if (nx) {
          m.user = nx;
          m.rem = nx.dur;
          o.notify?.("Your slot has started", `${m.name} is now yours.`, nx.me);
        }
      });
      o.auto?.(machines);
      draw();
    };
    draw();
    if (o.interactive)
      el.onclick = (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        const i = +b.dataset.i,
          m = machines[i],
          a = b.dataset.a,
          me = { name: "You", room: 301, me: true };
        if (a === "start" && !m.user) {
          const d = +b.dataset.d;
          m.user = { ...me, dur: d };
          m.rem = d;
          o.notify(
            "Washing session started",
            `${m.name} will finish in ${d} minutes.`,
          );
        }
        if (a === "book") {
          const dur = 45;
          m.queue.push({ ...me, dur });
          const wait =
            (m.rem || 0) + m.queue.slice(0, -1).reduce((s, x) => s + x.dur, 0);
          o.notify(
            "Booking confirmed",
            `${m.name} will be free in about ${fmt(wait)}. You are #${m.queue.length} in line.`,
          );
        }
        if (a === "cancel") {
          m.queue = m.queue.filter((x) => !x.me);
          o.notify(
            "Booking cancelled",
            `Your slot on ${m.name} was released. The queue has moved up.`,
          );
        }
        draw();
        flash(i);
      };
    if (!reduce) setInterval(tick, 1000);
  }

  /* hero board: runs by itself */
  const push = $("#push");
  let pt;
  const heroPush = (t, b) => {
    push.innerHTML = `<b>${t}</b><br>${b}`;
    push.classList.add("show");
    clearTimeout(pt);
    pt = setTimeout(() => push.classList.remove("show"), 3200);
  };
  Board(
    $("#heroBoard"),
    [
      {
        name: "Machine 1",
        rem: 25,
        dur: 45,
        user: { name: "Ashok", room: 204 },
        queue: [{ name: "Rahul", room: 105, dur: 45 }],
      },
      { name: "Machine 2", rem: 0, dur: 0, user: null, queue: [] },
      {
        name: "Machine 3",
        rem: 12,
        dur: 30,
        user: { name: "Kiran", room: 301 },
        queue: [],
      },
    ],
    {
      id: "h",
      notify: (t, b) => heroPush(t, b),
      auto: (ms) => {
        if (!ms[1].user && Math.random() < 0.12) {
          ms[1].user = {
            name: ["Meena", "Sai", "Divya"][(Math.random() * 3) | 0],
            room: 100 + ((Math.random() * 300) | 0),
          };
          ms[1].dur = 30;
          ms[1].rem = 30;
        }
      },
    },
  );

  /* demo board: you control it */
  const tw = $("#toasts");
  Board(
    $("#demoBoard"),
    [
      {
        name: "Machine 1",
        rem: 20,
        dur: 45,
        user: { name: "Ashok", room: 204 },
        queue: [],
      },
      { name: "Machine 2", rem: 0, dur: 0, user: null, queue: [] },
      {
        name: "Machine 3",
        status: "off",
        rem: 0,
        dur: 0,
        user: null,
        queue: [],
      },
    ],
    {
      id: "d",
      interactive: true,
      notify: (t, b) => {
        $(".empty", tw)?.remove();
        const d = document.createElement("div");
        d.className = "toast";
        d.innerHTML = `<small>Now</small><b>${t}</b><br>${b}`;
        tw.insertBefore(d, tw.children[1]);
        while (tw.children.length > 5) tw.lastChild.remove();
      },
    },
  );

  /* ---------- Lead form ---------- */
  const f = $("#lead"),
    msg = $("#msg");
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    f.querySelectorAll("input").forEach((i) => {
      const v = i.value.trim();
      const bad = !v || (i.type === "tel" && !/^\d{10}$/.test(v));
      i.classList.toggle("bad", bad);
      if (bad) ok = false;
    });
    msg.textContent = ok
      ? "Thanks! We will call you within a day to set up your demo."
      : "Please fill every field. Mobile number must be 10 digits.";
    if (ok) f.reset(); // TODO: send to your backend / Formspree / EmailJS here
  });
})();
