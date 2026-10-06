// Touchgrass.local: in-browser open-weight model (WebLLM + WebGPU), no backend.
const $ = (id) => document.getElementById(id);
const BLADES = 48;
const PER_MISSION = 4;
const KEY = "touchgrass.v1";

const FALLBACK = [
  ["Find three different leaf shapes", "Phone stays in your pocket. Collect them with your eyes only."],
  ["Walk until you hear a bird", "Stop the moment you hear one and listen for ten breaths."],
  ["Touch a tree trunk", "Notice the texture, then look up through the branches."],
  ["Stand barefoot on grass for two minutes", "No steps counted, no podcast. Just stand."],
  ["Walk to the farthest corner of your street", "Look at the sky once you get there, then head back."],
];

// ---------- state ----------
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { done: 0, streak: 0, last: null }; }
  catch { return { done: 0, streak: 0, last: null }; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
const state = load();

// ---------- grass ----------
const field = $("field");
for (let i = 0; i < BLADES; i++) {
  const b = document.createElement("div");
  b.className = "blade";
  b.style.setProperty("--h", 45 + Math.random() * 55 + "%");
  b.style.setProperty("--r", (Math.random() * 14 - 7).toFixed(1) + "deg");
  field.appendChild(b);
}
function grow() {
  const n = Math.min(BLADES, state.done * PER_MISSION);
  [...field.children].forEach((b, i) => b.classList.toggle("grown", i < n));
  $("stats").textContent = `${state.done} missions done · ${state.streak}-day streak`;
}

// ---------- model ----------
let engine = null;
async function loadModel() {
  if (!navigator.gpu) {
    $("status").textContent = "This browser has no WebGPU. Try recent Chrome or Edge. Built-in missions still work.";
    return;
  }
  $("load").disabled = true;
  $("bar").hidden = false;
  $("status").textContent = "Downloading model. This happens once, then it is cached.";
  try {
    const webllm = await import("https://esm.run/@mlc-ai/web-llm");
    engine = await webllm.CreateMLCEngine($("model").value, {
      initProgressCallback: (p) => {
        $("bar").value = p.progress || 0;
        $("status").textContent = p.text;
      },
    });
    $("status").textContent = "Model ready. Everything now runs on this device.";
  } catch (err) {
    engine = null;
    $("status").textContent = "Could not load the model (" + err.message + "). Built-in missions still work.";
  } finally {
    $("load").disabled = false;
    $("bar").hidden = true;
  }
}

async function getMission(mood) {
  if (engine) {
    try {
      const res = await engine.chat.completions.create({
        temperature: 0.8,
        max_tokens: 120,
        messages: [
          { role: "system", content:
            "You are a warm outdoor coach. Reply with exactly two lines.\n" +
            "MISSION: one tiny outdoor task under 10 minutes, max 10 words.\n" +
            "NUDGE: one friendly sentence tied to how the person feels." },
          { role: "user", content: mood },
        ],
      });
      const text = res.choices[0].message.content;
      const m = text.match(/MISSION:\s*(.+)/i);
      const n = text.match(/NUDGE:\s*(.+)/i);
      if (m) return [m[1].trim(), n ? n[1].trim() : ""];
      return ["Step outside for ten minutes", text.trim()];
    } catch (err) {
      $("status").textContent = "Model error: " + err.message;
    }
  }
  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
}

// ---------- events ----------
$("load").addEventListener("click", loadModel);

$("ask").addEventListener("click", async () => {
  const mood = $("mood").value.trim() || "No details, just need some air.";
  $("ask").disabled = true;
  $("ask").textContent = "Thinking…";
  const [mission, nudge] = await getMission(mood);
  $("mission").textContent = mission;
  $("nudge").textContent = nudge;
  $("done").disabled = false;
  $("card").hidden = false;
  $("ask").disabled = false;
  $("ask").textContent = "Get my mission";
});

$("done").addEventListener("click", () => {
  state.done++;
  if (state.last !== today()) {
    state.streak = state.last === yesterday() ? state.streak + 1 : 1;
    state.last = today();
  }
  save();
  grow();
  $("done").disabled = true;
  $("nudge").textContent = "Done. Your grass just grew.";
});

grow();
