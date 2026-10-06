# Touchgrass.local

A coach that runs inside your browser and sends you outside. Tell it how your day has gone, and an open-weight language model running on your own device gives you one tiny outdoor mission. Finish it and a field of CSS grass grows.

Built for the **Hacktoberfest Open-Source AI Challenge: Week 1** (theme: Touch Grass). The project was started on October 7, 2026, during the challenge window.

## Why open-source AI

- **Private.** The model runs on your device through WebGPU. What you type about your day is never sent to a server.
- **Free to run.** There is no API key, no backend and no bill.
- **Works offline.** After the first model download, it is cached by the browser.
- **Swappable.** Change models from a dropdown (or by editing one line) and compare how they behave.

## Features

- In-browser LLM via [WebLLM](https://github.com/mlc-ai/web-llm) (MLC), with a choice of Gemma 2 2B, Qwen 2.5 1.5B or Llama 3.2 1B
- One short mission and one friendly nudge, based on your mood or day
- Grass that grows with every completed mission, built from plain CSS
- Streak counter and totals saved in `localStorage`
- Built-in fallback missions, so the app still works without WebGPU or if the model fails to load
- Keyboard focus styles, dark mode and reduced-motion support

## Tech stack

Plain HTML, CSS and JavaScript. No framework, no build step, no backend.

| File | Role |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Layout, theming and the grass animation |
| `app.js` | Model loading, prompting, missions, streaks, grass growth |

## Run it locally

The script is an ES module, so it must be served over HTTP. Opening the file directly will not work.

```bash
cd touchgrass
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a recent **Chrome or Edge** (WebGPU is required for the model). Click **Load model**, wait for the one-time download, describe your day and click **Get my mission**.

## Deploy

Any static host works. For GitHub Pages: push the three files to a repo, then go to Settings → Pages, choose the `main` branch and the root folder, and save.

## How it works

1. `app.js` imports WebLLM from a CDN only when you click **Load model**.
2. The selected model is downloaded and cached, with progress shown in the page.
3. Your text goes to the local model with a system prompt asking for two lines: `MISSION:` and `NUDGE:`.
4. The reply is parsed. If the model ignores the format, the raw reply is shown as the nudge.
5. Marking a mission done updates your count and streak, saves them to `localStorage`, and grows more blades of grass.

## Changing the model

The model IDs are in the `<select>` in `index.html`. If an ID stops working, list the currently available ones in the browser console:

```js
const webllm = await import("https://esm.run/@mlc-ai/web-llm");
webllm.prebuiltAppConfig.model_list.map((m) => m.model_id);
```

Then replace the `value` of an `<option>` with a valid ID.

## Browser support

- Model mode: recent Chrome or Edge with WebGPU.
- Fallback mode (built-in missions): any modern browser.

## Credits

- [WebLLM / MLC AI](https://github.com/mlc-ai/web-llm) for in-browser inference
- Gemma (Google), Qwen (Alibaba) and Llama (Meta) open-weight models, each under its own license
- Bricolage Grotesque font via Google Fonts

## License

Add a license of your choice (MIT is a common default) before publishing.
