const runtimeBase = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32';
const modelRoot = 'https://storage.googleapis.com/mediapipe-models';
const sampleInterval = 1000 / 12;
const handGestures = new Map([
  ['Thumb_Up', 'thumb'],
  ['Victory', 'peace'],
  ['Open_Palm', 'palm'],
  ['Closed_Fist', 'fist'],
]);

export function classifyFace(categories) {
  const scores = new Map(categories?.map(({ categoryName, score }) => [categoryName, score]));
  const score = (name) => scores.get(name) ?? 0;
  const average = (prefix) => (score(prefix + 'Left') + score(prefix + 'Right')) / 2;
  const jaw = score('jawOpen');
  if (jaw >= 0.43 && (score('browInnerUp') >= 0.35 || average('eyeWide') >= 0.29)) return 'shock';
  const leftBlink = score('eyeBlinkLeft');
  const rightBlink = score('eyeBlinkRight');
  const closedEye = Math.max(leftBlink, rightBlink);
  const openEye = Math.min(leftBlink, rightBlink);
  if (closedEye >= 0.46 && openEye <= 0.25 && closedEye - openEye >= 0.29) return 'wink';
  if (average('mouthSmile') >= 0.52 && jaw < 0.43) return 'smile';
  return null;
}

function isOpenPalm(points) {
  if (points?.length !== 21) return false;
  const distance = (a, b) => Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y, points[a].z - points[b].z);

  // The classifier can alternate between Open_Palm and None as it tracks a steady hand.
  const fingersExtended = [6, 10, 14, 18].every((joint) => {
    const tip = joint + 2;
    const fingerLength = distance(joint, joint + 1) + distance(joint + 1, tip);
    return distance(joint, tip) >= fingerLength * 0.94 && distance(0, tip) > distance(0, joint) * 1.17;
  });
  const thumbExtended = distance(4, 5) > distance(5, 17) * 0.54 && distance(0, 4) > distance(0, 2) * 1.35;
  return fingersExtended && thumbExtended;
}

export function classifyHand(categories, worldLandmarks) {
  const best = categories?.reduce((winner, gesture) => (
    !winner || gesture.score > winner.score ? gesture : winner
  ), null);
  if (best && best.categoryName !== 'None') {
    const minScore = best.categoryName === 'Open_Palm' ? 0.50 : 0.68;
    if (best.score >= minScore) return handGestures.get(best.categoryName) ?? null;
  }
  return isOpenPalm(worldLandmarks) ? 'palm' : null;
}

const priority = ['shock', 'wink', 'smile', 'thumb', 'peace', 'palm', 'fist'];

export function createReactionGate() {
  const states = new Map(priority.map((id) => [id, {
    since: null, absentSince: null, latched: false,
  }]));
  let blockedUntil = -Infinity;
  let lastSample = -Infinity;

  return (face, hand, now) => {
    const gap = now - lastSample > 450;
    lastSample = now;
    let winner = null;
    for (const [id, state] of states) {
      if (gap) {
        state.since = null;
        state.absentSince = null;
      }
      if (face !== id && hand !== id) {
        state.since = null;
        state.absentSince ??= now;
        if (now - state.absentSince >= 150) state.latched = false;
        continue;
      }
      state.absentSince = null;
      state.since ??= now;
      if (!state.latched && now - state.since >= 250) {
        state.latched = true;
        if (now >= blockedUntil && !winner) winner = id;
      }
    }
    if (winner) blockedUntil = now + 1200;
    return winner;
  };
}

function cameraError(error) {
  switch (error?.name) {
    case 'NotAllowedError': return 'Allow camera access in your browser, then try again.';
    case 'NotFoundError': return 'Connect a webcam, then try again.';
    case 'NotReadableError': return 'Close other apps using the webcam, then try again.';
    default: return 'The webcam could not start. Try again or use a demo.';
  }
}

export function startTracking(video, callbacks) {
  let stopped = false;
  let stream;
  let faceModel;
  let handModel;
  let frame = 0;
  let lastSampleAt = -Infinity;
  let lastVideoTime = -1;
  const gate = createReactionGate();

  function stop() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    stream?.getTracks().forEach((track) => track.stop());
    faceModel?.close();
    handModel?.close();
    if (video.srcObject === stream) video.srcObject = null;
  }

  function fail(message) {
    if (stopped) return;
    stop();
    callbacks.state('error', message);
  }

  function frameLoop(now) {
    if (stopped) return;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime && now - lastSampleAt >= sampleInterval) {
      lastVideoTime = video.currentTime;
      lastSampleAt = now;
      try {
        const face = faceModel?.detectForVideo(video, now);
        const hand = handModel?.recognizeForVideo(video, now);
        const faceId = classifyFace(face?.faceBlendshapes[0]?.categories);
        const handId = classifyHand(hand?.gestures[0], hand?.worldLandmarks[0]);
        const facePoints = face?.faceLandmarks[0];
        const handPoints = hand?.landmarks[0];
        const active = gate(faceId, handId, now);
        const point = active === faceId ? facePoints?.[1] : handPoints?.[9];
        callbacks.sample({
          faceAvailable: Boolean(faceModel), handAvailable: Boolean(handModel),
          faceSeen: Boolean(facePoints), handSeen: Boolean(handPoints),
          faceId, handId, active, point,
        });
      } catch {
        fail('Tracking stopped. Restart the camera or try a demo.');
        return;
      }
    }
    frame = requestAnimationFrame(frameLoop);
  }

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      fail('Open this app on localhost or HTTPS to use the webcam.');
      return;
    }

    try {
      const granted = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      if (stopped) {
        granted.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = granted;
      stream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => fail('The webcam disconnected. Reconnect it and try again.'), { once: true });
      });
      video.srcObject = stream;
      await video.play();
    } catch (error) {
      fail(cameraError(error));
      return;
    }

    if (stopped) return;
    callbacks.state('loading', 'Loading face and hand tracking…');
    let vision;
    let files;
    try {
      vision = await import(runtimeBase + '/vision_bundle.mjs');
      if (stopped) return;
      files = await vision.FilesetResolver.forVisionTasks(runtimeBase + '/wasm');
    } catch {
      fail('Tracking could not load. Check your connection and try again.');
      return;
    }
    if (stopped) return;

    try {
      const detector = await vision.FaceLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: modelRoot + '/face_landmarker/face_landmarker/float16/1/face_landmarker.task', delegate: 'CPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
      });
      if (stopped) {
        detector.close();
        return;
      }
      faceModel = detector;
    } catch (error) {
      console.warn('Face tracking could not load', error);
    }
    if (stopped) return;
    try {
      const recognizer = await vision.GestureRecognizer.createFromOptions(files, {
        baseOptions: { modelAssetPath: modelRoot + '/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task', delegate: 'CPU' },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      if (stopped) {
        recognizer.close();
        return;
      }
      handModel = recognizer;
    } catch (error) {
      console.warn('Hand tracking could not load', error);
    }
    if (stopped) return;
    if (!faceModel && !handModel) {
      fail('Face and hand tracking could not load. Check your connection and try again.');
      return;
    }

    const unavailable = !faceModel ? 'Face' : !handModel ? 'Hand' : '';
    callbacks.state('on', unavailable ? unavailable + ' tracking is unavailable. Stop and restart the camera to retry.' : '');
    frame = requestAnimationFrame(frameLoop);
  }

  void start();
  return stop;
}
