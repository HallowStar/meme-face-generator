# Meme Cam

A browser-based computer vision project that turns webcam expressions and hand gestures into captioned memes, live effects, sounds, and matching viral GIFs.

## Run locally

Run this command from the project folder.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [Meme Cam on localhost](http://localhost:8000) in Chrome. Click **Start camera** and allow webcam access. For a camera-free preview, click **Try demo** or try an effect card. The page uses a visible camera preview and keeps all webcam frames and uploaded images in the browser. The app requests video only.

Click **Expand camera** for a larger feed with the meme editor and GIF preview beside it on desktop. On small screens, the results sit below the feed. Click **Exit camera view** or press Escape to return to the studio.

If port 8000 is in use, choose another port in the command and browser URL.

Each reaction produces one editable draft and a matching GIF preview. Repeating a reaction cycles through its GIFs. Change its top text, bottom text, or caption style, or use **New caption** to reroll both lines while keeping the image. Click **Download PNG** to save a 1080 × 1080 image. The template library includes Grumpy Cat, the Shiba photo used for a published Doge remix, and David Revoy’s illustrated *This is fine* remix. **Use my image** opens a photo from your device.

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

## New effects

Choose **New effects** in the effects library and click any card to preview its animation and sound with or without the webcam. **Camera effect** defaults to **Rotate by reaction**. For example, repeated shocks cycle through the comic explosion, Comet Impact, and Retro Signal. Choose a specific effect to use it for every detected reaction, or choose **Original effects only** to use the seven original effects. The GIF and caption still follow the detected reaction.

| Effect | Default trigger | Sound |
| --- | --- | --- |
| Energy Orb | Cupped palm facing up | Rising charge and electric chime |
| Genjutsu Vanish | Wink | Warp hum, vanish snap, and return chime |
| Shadow Blink | Smirk | Reversed sweep and snap |
| Rift Portal | Peace sign | Rising portal hum |
| Time Shatter | Open palm | Ice crack and rewind |
| Thunder Charge | Closed fist | Electrical crackle and rumble |
| Comet Impact | Shock | Incoming whistle and impact |
| Retro Signal | Shock | Glitch chirps and static |
| Pixel Warp | Puffed cheeks | Chiptune reversal |
| Bass Drop | Closed fist | Sub-bass drop |
| Holo Scan | Pointing up | Scanner ticks and confirmation tone |
| Heart Bloom | Big smile | Soft ascending chord |
| Checkpoint | Thumbs up | Arcade save jingle |

Genjutsu Vanish fades the entire camera feed out and brings it back. PNG exports keep the captured still and a static effect overlay. The animations and sounds are generated in the browser with Canvas and Web Audio. With reduced motion enabled, the camera shows a static overlay for the new effects.

For **Energy Orb**, keep your palm facing the ceiling and curl your fingers slightly, as if holding a ball. With **Rotate by reaction**, the orb charges after a brief hold and follows your hand until you lower it or turn it away. Keep your wrist and knuckles in view. Try the **Energy Orb** card to preview it with the camera off.

## How reaction matching works

Meme Cam averages MediaPipe facial expression scores over the pose hold. It filters the bundled catalog by reaction, then ranks matches using the traits that matter for that reaction. For example, jaw opening carries the most weight for shock, and the difference between the two eyes carries the most weight for a wink. Hand matches use the recognized gesture. Demo taps and low-similarity poses rotate through that reaction's collection.

Matching also works independently of the effects library. Hold a smirk, skeptical look, pout, puffed cheeks, scowl, frown, yawn, thumbs-down, pointing-up gesture, or “I love you” sign to get a match and a captioned still. For subtle or unusual facial poses, turn on the camera and click **Match my pose**. It picks the closest expression available in the catalog, including a deadpan option.

The catalog contains 84 GIF references and three editable photos. **Next match** browses alternatives. **Use image** puts a matched photo in the editor with your existing captions. The resulting PNG includes the photo credit and license. The GIF player loads clips directly from GIPHY. Webcam frames and expression scores stay in your browser.

GIF profiles are hand-tagged. The two human photo profiles use measurements from the Face Landmarker image model. The gorilla photo uses a hand-tagged profile. To add an entry, use the matching group in `meme-catalog.json` and include the media source. Editable images also need a local asset and a credit and license. [Face Landmarker](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker?tab=Web) · [GIPHY embeds](https://support.giphy.com/hc/en-us/articles/360020330711-How-to-Embed-a-GIF)

## Stack

- HTML, CSS, and vanilla JavaScript ES modules
- MediaPipe Tasks Vision 0.10.32, with Face Landmarker and Gesture Recognizer using WebAssembly
- Browser MediaDevices, Canvas 2D, and Web Audio
- GIPHY Embed Player for the viral previews and Datamuse for the bundled reaction vocabulary
- GSAP ScrollTrigger for the template stack and scroll text reveals
- A static HTTP server. Python is only needed for the launch command shown here

The live camera needs localhost or HTTPS, browser permission, and internet access to load the MediaPipe runtime and models. The downloaded templates and sounds work with the camera off. If tracking fails to load, stop the camera and retry. If a browser preview blocks camera access, open localhost directly in Chrome. Click the sound button to toggle audio. The app respects the system reduced-motion setting.

The GIF preview loads an official GIPHY embed over the internet. Use **Play GIF** if autoplay is paused, or **View on GIPHY** if the player is unavailable. PNG export and caption generation run in the browser. Each reaction's word list was fetched and reviewed during development. [GIPHY embed documentation](https://support.giphy.com/hc/en-us/articles/360020330711-How-to-Embed-a-GIF) · [Datamuse API](https://www.datamuse.com/api/)

## Image credits

- The surprised expression is by Paul Duke under CC BY-SA 2.0. The laughing expression is by Basile Morin and the gorilla grin is by William H. Calvin, both under CC BY-SA 4.0. Exported adaptations retain their respective licenses. [Surprised expression](https://commons.wikimedia.org/wiki/File:Beauty_Girl_Surprise.jpg) · [Laughing expression](https://commons.wikimedia.org/wiki/File:Laughing_woman.jpg) · [Gorilla grin](https://commons.wikimedia.org/wiki/File:Gorilla_smile.jpg)
- Grumpy Cat photo by Gage Skidmore. The cropped and captioned Grumpy Cat template exports use the same CC BY-SA 3.0 license as the source photo. [Source](https://commons.wikimedia.org/wiki/File:Grumpy_Cat_by_Gage_Skidmore.jpg) · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- Taiki photo by Roberto Vasarri, released to the public domain. Euterpia used this photo in a CC0 Doge remix. [Photo](https://commons.wikimedia.org/wiki/File:Shiba_inu_taiki.jpg) · [Doge remix](https://commons.wikimedia.org/wiki/File:Doge_homemade_meme.jpg)
- *This is fine* by David Revoy. The app crops and captions the illustration. [Source](https://www.peppercarrot.com/en/viewer/misc__2025-07-01_This-is-fine_by-David-Revoy.html) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Outfit, Space Grotesk, and Archivo Black are included under the SIL Open Font License. The license files are in `assets/`.
