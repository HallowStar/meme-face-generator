# Meme Cam

A browser-based computer vision project that turns webcam expressions and hand gestures into captioned memes, live effects, sounds, and matching viral GIFs.

## Run locally

Run this command from the project folder.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [Meme Cam on localhost](http://localhost:8000) in Chrome. Click **Start camera** and allow webcam access. For a camera-free preview, click **Try demo** or try an effect card. The page uses a visible camera preview and keeps all webcam frames and uploaded images in the browser. The app requests video only.

If port 8000 is in use, choose another port in the command and browser URL.

Each reaction produces one editable draft and a matching GIF preview. Change its top text, bottom text, or caption style, or use **New caption** to reroll both lines while keeping the image. Click **Download PNG** to save a 1080 × 1080 image. The template library includes Grumpy Cat, the Shiba photo used for a published Doge remix, and David Revoy’s illustrated *This is fine* remix. **Use my image** opens a photo from your device.

## Reaction guide

| Trigger | What to do | Effect and sound | Viral match |
| --- | --- | --- | --- |
| Shock | Open your mouth wide and raise your eyebrows or widen your eyes. | Comic explosion and a bass boom | [iShowSpeed](https://giphy.com/gifs/6tyvhr7zaoHOYuOtg7) |
| Big smile | Hold a wide smile. | Confetti and a chime | [Grinning monkey](https://giphy.com/gifs/9G50jwiTVJtUCZ83bW) |
| Wink | Close one eye while keeping the other open. | Sparkles and a pop | [Eko and Miya](https://giphy.com/gifs/Xbz9rDFWrtyUPlRrmt) |
| Thumbs up | Hold a thumbs-up toward the camera. | Approval stamp and a ding | [Brent Rambo thumbs-up](https://giphy.com/gifs/rxVCvZvrxqnJFBdVe5) |
| Peace sign | Hold your index and middle fingers in a V. | Rainbow trails and an arcade blip | [Amy Poehler says peace out](https://giphy.com/gifs/nFFguNjdeotwc) |
| Open palm | Show all five fingers with your palm facing the camera. | Freeze-frame and a simulated record scratch | [Fergie’s “Hold Up”](https://giphy.com/gifs/26FL8soUxrZBtpASQ) |
| Closed fist | Hold a closed fist in the frame. | Energy rings and a rising synth | [TrueMose’s “Power Up”](https://giphy.com/gifs/7zczkZlKRJUr7s52ZX) |

Hold the pose briefly and release it before trying again. Keep your face and hand well lit and inside the frame. One face and one hand can be tracked at a time. Expression rules use facial movements as controls and can vary by person and lighting.

## Stack

- HTML, CSS, and vanilla JavaScript ES modules
- MediaPipe Tasks Vision 0.10.32, with Face Landmarker and Gesture Recognizer using WebAssembly
- Browser MediaDevices, Canvas 2D, and Web Audio
- GIPHY Embed Player for the viral previews and Datamuse for the bundled reaction vocabulary
- A static HTTP server. Python is only needed for the launch command shown here

The live camera needs localhost or HTTPS, browser permission, and internet access to load the MediaPipe runtime and models. The downloaded templates and sounds work with the camera off. If tracking fails to load, stop the camera and retry. If a browser preview blocks camera access, open localhost directly in Chrome. Click the sound button to toggle audio. The app respects the system reduced-motion setting.

The GIF preview loads an official GIPHY embed over the internet. Use **Play GIF** if autoplay is paused, or **View on GIPHY** if the player is unavailable. PNG export and caption generation run in the browser. Each reaction's word list was fetched and reviewed during development. [GIPHY embed documentation](https://support.giphy.com/hc/en-us/articles/360020330711-How-to-Embed-a-GIF) · [Datamuse API](https://www.datamuse.com/api/)

## Image credits

- Grumpy Cat photo by Gage Skidmore. The cropped and captioned Grumpy Cat template exports use the same CC BY-SA 3.0 license as the source photo. [Source](https://commons.wikimedia.org/wiki/File:Grumpy_Cat_by_Gage_Skidmore.jpg) · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- Taiki photo by Roberto Vasarri, released to the public domain. Euterpia used this photo in a CC0 Doge remix. [Photo](https://commons.wikimedia.org/wiki/File:Shiba_inu_taiki.jpg) · [Doge remix](https://commons.wikimedia.org/wiki/File:Doge_homemade_meme.jpg)
- *This is fine* by David Revoy. The app crops and captions the illustration. [Source](https://www.peppercarrot.com/en/viewer/misc__2025-07-01_This-is-fine_by-David-Revoy.html) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Space Grotesk and Archivo Black are included under the SIL Open Font License. The license files are in `assets/`.
