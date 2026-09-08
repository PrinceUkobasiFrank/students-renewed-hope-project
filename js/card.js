// ---------- populate state select ----------
const cgState = document.getElementById('cgState');
if (cgState) populateStateSelect(cgState, 'Select your state');
function selectedStateName() {
  return cgState.options[cgState.selectedIndex] ? cgState.options[cgState.selectedIndex].text : '';
}

// ---------- card rendering ----------
const canvas = document.getElementById('cardCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let uploadedImage = null;

const leftLogo = new Image();
leftLogo.src = 'images/renewed-hope-logo.jpg';
const rightLogo = new Image();
rightLogo.src = 'images/apc-logo.png';
let logosReady = 0;
[leftLogo, rightLogo].forEach((img) => {
  img.onload = () => { logosReady++; if (logosReady === 2) drawCard('', '', '', ''); };
});

function roundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function drawCircleLogo(context, img, cx, cy, r) {
  if (!img.complete || img.naturalWidth === 0) return;
  context.save();
  context.beginPath();
  context.arc(cx, cy, r, 0, Math.PI * 2);
  context.closePath();
  context.clip();
  const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
  const dw = img.width * scale, dh = img.height * scale;
  context.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  context.restore();
}

function drawCard(name, ward, lga, state) {
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // background: diagonal green gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0a2e0a');
  grad.addColorStop(0.2, '#145214');
  grad.addColorStop(0.45, '#1f7a1f');
  grad.addColorStop(0.75, '#145214');
  grad.addColorStop(1, '#0a2e0a');
  roundRect(ctx, 0, 0, w, h, 36);
  ctx.fillStyle = grad;
  ctx.fill();

  // subtle watermark text, tiled diagonally
  ctx.save();
  roundRect(ctx, 0, 0, w, h, 36);
  ctx.clip();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-12 * Math.PI / 180);
  ctx.font = '700 22px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.055)';
  ctx.textAlign = 'center';
  const wmLines = ['THE RENEWED HOPE PROJECT', 'APC 2027', "OFFICIAL SUPPORTER'S CARD"];
  for (let row = -3; row <= 3; row++) {
    ctx.fillText(wmLines[(row + 9) % 3], 0, row * 60);
  }
  ctx.restore();
  ctx.textAlign = 'left';

  // gold top bar
  const goldGrad = ctx.createLinearGradient(0, 0, w, 0);
  goldGrad.addColorStop(0, '#c9a227');
  goldGrad.addColorStop(0.3, '#e8c547');
  goldGrad.addColorStop(0.5, '#f5d76e');
  goldGrad.addColorStop(0.7, '#e8c547');
  goldGrad.addColorStop(1, '#c9a227');
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 0, w, 9);

  // logos
  const logoR = 56;
  drawCircleLogo(ctx, leftLogo, 28 + logoR, 28 + logoR + 8, logoR);
  drawCircleLogo(ctx, rightLogo, w - 28 - logoR, 28 + logoR + 8, logoR);

  // center title
  ctx.fillStyle = '#e8c547';
  ctx.font = '800 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("SUPPORTER'S CARD", w / 2, 56);
  ctx.fillStyle = '#e8c547';
  ctx.fillRect(w / 2 - 40, 68, 80, 3);
  ctx.textAlign = 'left';

  // photo circle (bottom right)
  const photoR = 72;
  const photoCx = w - 56 - photoR;
  const photoCy = h - 56 - photoR;
  if (uploadedImage) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(photoCx, photoCy, photoR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const iw = uploadedImage.width, ih = uploadedImage.height;
    const scale = Math.max((photoR * 2) / iw, (photoR * 2) / ih);
    ctx.drawImage(uploadedImage, photoCx - (iw * scale) / 2, photoCy - (ih * scale) / 2, iw * scale, ih * scale);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(photoCx, photoCy, photoR, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(photoCx, photoCy, photoR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // person icon
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(photoCx, photoCy - 12, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(photoCx, photoCy + 46, 32, Math.PI, 0, true);
    ctx.stroke();
  }

  // name + ward/LGA/state block (bottom left)
  const padLeft = 44;
  let baseline = h - 90;
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 40px "Big Shoulders Display", sans-serif';
  ctx.fillText(name || 'Your name here', padLeft, baseline);

  baseline += 28;
  ctx.fillStyle = '#e8c547';
  ctx.fillRect(padLeft, baseline - 6, 28, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 18px Inter, sans-serif';
  const detailParts = [ward, lga, state].filter((v) => v && v.trim());
  const detailLine = detailParts.length ? detailParts.join('  ·  ') : 'Your ward · LGA · state';
  ctx.fillText(detailLine, padLeft + 40, baseline + 5);
}

if (ctx) {
  document.fonts.ready.then(() => drawCard('', '', '', ''));
}

// ---------- form handling ----------
const cardForm = document.getElementById('cardForm');
const cardActions = document.getElementById('cardActions');
const cardNote = document.getElementById('cardNote');
const cgPhotoInput = document.getElementById('cgPhoto');

if (cgPhotoInput) {
  cgPhotoInput.addEventListener('change', () => {
    const file = cgPhotoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        uploadedImage = img;
        drawCard(
          document.getElementById('cgName').value,
          document.getElementById('cgWard').value,
          document.getElementById('cgLga').value,
          selectedStateName()
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

if (cardForm) {
  cardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cgName').value.trim();
    const ward = document.getElementById('cgWard').value.trim();
    const lga = document.getElementById('cgLga').value.trim();
    const state = selectedStateName();
    drawCard(name, ward, lga, state);
    cardActions.hidden = false;
    cardNote.hidden = false;
    socialShareBlock.hidden = false;
    currentCaption = buildCaption(name, state);

    // Card generation itself stays frictionless — no login required to
    // download or share. If the visitor happens to be logged in, we also
    // record it against their profile; if not (or the backend's
    // unreachable), that just quietly doesn't happen — never blocks the
    // card itself.
    const token = typeof getSessionToken === 'function' ? getSessionToken() : null;
    if (token) {
      try {
        await apiFetch('/api/cards', { method: 'POST', body: { ward, lga }, authToken: token });
      } catch (err) {
        console.warn('Card generated, but could not record it to your profile:', err.message);
      }
    }
  });
}

const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'supporters-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'supporters-card.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "My Supporter's Card" });
        } catch (err) {
          // user cancelled share — no action needed
        }
      } else {
        // Most desktop browsers don't support sharing files via
        // navigator.share yet — fall back to downloading, but say so,
        // rather than silently doing something the person didn't click.
        showShareHint("Your browser can't open a share sheet here — downloading the card instead. On a phone, this button shares the image directly.");
        downloadBtn.click();
      }
    });
  });
}

// ---------- social sharing ----------
// Technical reality worth being upfront about: Facebook/X/WhatsApp's web
// share links can only share a URL + caption text, not a locally-generated
// image file — that's a platform limitation, not something fixable from
// here. So these buttons share the caption + a link back to this page,
// which is actually the stronger move anyway: it sends people to make
// their own card instead of just showing a static image with nowhere to go.
// Instagram doesn't offer a web share-intent at all, so that button
// downloads the image and copies the caption for a manual post instead.

const CAPTIONS = [
  (name, state) => `I just added myself to the count. ${state} needs more of us — add yourself here: {LINK}`,
  (name, state) => `Every name on this list is a name that can't be ignored. Mine's on it now. Yours could be too: {LINK}`,
  (name, state) => `This isn't just a card — it's proof I showed up. Make yours: {LINK}`,
  (name, state) => `${state}, we're being counted properly now, not guessed at. Join the count: {LINK}`,
  (name, state) => `Organized beats scattered. I just made it a little more organized. Your turn: {LINK}`,
  (name, state) => `Nobody built this by watching from the sidelines. I'm in — get your own card: {LINK}`
];

const socialShareBlock = document.getElementById('socialShareBlock');
const socialShareHint = document.getElementById('socialShareHint');
let currentCaption = '';

function buildCaption(name, state) {
  const template = CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];
  const shareLink = `${window.location.origin}${window.location.pathname}`;
  return template(name, state || 'Nigeria').replace('{LINK}', shareLink);
}

function showShareHint(msg) {
  if (!socialShareHint) return;
  socialShareHint.textContent = msg;
  socialShareHint.hidden = false;
}

const shareFacebook = document.getElementById('shareFacebook');
if (shareFacebook) {
  shareFacebook.addEventListener('click', () => {
    const shareLink = `${window.location.origin}${window.location.pathname}`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(currentCaption)}`;
    window.open(url, '_blank', 'noopener,width=600,height=500');
  });
}

const shareTwitter = document.getElementById('shareTwitter');
if (shareTwitter) {
  shareTwitter.addEventListener('click', () => {
    const shareLink = `${window.location.origin}${window.location.pathname}`;
    const textOnly = currentCaption.replace(shareLink, '').trim();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textOnly)}&url=${encodeURIComponent(shareLink)}`;
    window.open(url, '_blank', 'noopener,width=600,height=500');
  });
}

const shareWhatsapp = document.getElementById('shareWhatsapp');
if (shareWhatsapp) {
  shareWhatsapp.addEventListener('click', () => {
    const url = `https://wa.me/?text=${encodeURIComponent(currentCaption)}`;
    window.open(url, '_blank', 'noopener');
  });
}

const shareInstagram = document.getElementById('shareInstagram');
if (shareInstagram) {
  shareInstagram.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentCaption);
      showShareHint('Caption copied! Downloading your card — paste the caption when you post it on Instagram.');
    } catch (err) {
      showShareHint("Couldn't copy automatically — here's your caption: " + currentCaption);
    }
    downloadBtn.click();
    window.open('https://www.instagram.com/', '_blank', 'noopener');
  });
}
