// Simple API tester script
const el = id => document.getElementById(id);
let BASE = el('baseUrl').value.trim();

el('btnSetBase').onclick = () => {
  BASE = el('baseUrl').value.trim().replace(/\/$/, '');
  toast('Base set to ' + BASE);
};

function toast(msg) {
  console.log('[toast]', msg);
}

async function api(path, opts = {}) {
  const url = BASE + path;
  const init = {
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    method: opts.method || 'GET'
  };
  if (opts.body) init.body = JSON.stringify(opts.body);
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    return { ok: res.ok, status: res.status, data: parsed };
  } catch (e) {
    return { ok: false, status: 0, data: e.message };
  }
}

function render(id, payload) {
  el(id).textContent = JSON.stringify(payload, null, 2);
}

// Sessions
el('btnStartSession').onclick = async () => {
  const examId = el('examId').value.trim();
  const userId = el('userId').value.trim();
  const r = await api('/sessions/start', { method: 'POST', body: { examId, userId } });
  if (r.ok) {
    const sid = r.data.id;
    el('currentSession').textContent = sid;
    el('endSessionId').value = sid;
    el('eventSessionId').value = sid;
    el('snapSessionId').value = sid;
    el('uploadSessionId').value = sid;
    el('incidentSessionId').value = sid;
  }
  render('resultSessions', r);
};

el('btnEndSession').onclick = async () => {
  const id = el('endSessionId').value.trim();
  const r = await api(`/sessions/${id}/end`, { method: 'POST' });
  render('resultSessions', r);
};

el('btnListSessions').onclick = async () => {
  const r = await api('/sessions');
  render('resultSessions', r);
};

el('btnGetSession').onclick = async () => {
  const id = el('getSessionId').value.trim();
  const r = await api(`/sessions/${id}`);
  render('resultSessions', r);
};

// Events ingest (single item convenience)
el('btnIngestEvent').onclick = async () => {
  const sessionId = el('eventSessionId').value.trim();
  const eventType = el('eventType').value;
  const detailsRaw = el('eventDetails').value.trim();
  const details = detailsRaw || null;
  const ts = Date.now();
  const body = {
    items: [ { sessionId, ts, eventType, details, idempotencyKey: 'evt-' + ts } ]
  };
  const r = await api('/ingest/events', { method: 'POST', body });
  render('resultEvents', r);
};

// Snapshot metadata ingest
el('btnIngestSnapshot').onclick = async () => {
  const sessionId = el('snapSessionId').value.trim();
  const faceCount = parseInt(el('snapFace').value || '0', 10);
  const ts = Date.now();
  const objectKey = `uploads/${sessionId}/${new Date().toISOString()}/meta-${ts}.jpg`;
  const body = { items: [ { sessionId, ts, objectKey, faceCount, idempotencyKey: 'snap-' + ts } ] };
  const r = await api('/ingest/snapshots', { method: 'POST', body });
  render('resultSnapshots', r);
};

// Snapshot upload (base64)
el('btnUploadSnapshot').onclick = async () => {
  const sessionId = el('uploadSessionId').value.trim();
  const faceCount = parseInt(el('uploadFace').value || '0', 10);
  const fileInput = el('uploadFile');
  if (!fileInput.files || fileInput.files.length === 0) {
    render('resultUpload', { ok:false, status:0, data:'No file selected' });
    return;
  }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result; // data URL
    const ts = Date.now();
    const body = { items: [ { sessionId, ts, imageBase64: base64, faceCount, idempotencyKey: 'up-' + ts } ] };
    const r = await api('/ingest/snapshots/upload', { method: 'POST', body });
    render('resultUpload', r);
  };
  reader.readAsDataURL(file);
};

// Incidents
el('btnCreateIncident').onclick = async () => {
  const sessionId = el('incidentSessionId').value.trim();
  const type = el('incidentType').value;
  const scoreVal = el('incidentScore').value.trim();
  const reason = el('incidentReason').value.trim() || null;
  const score = scoreVal ? parseFloat(scoreVal) : null;
  const ts = Date.now();
  const body = { sessionId, ts, type, score, reason };
  const r = await api('/incidents', { method:'POST', body });
  if (r.ok && r.data.id) {
    el('getIncidentId').value = r.data.id;
    el('reviewIncidentId').value = r.data.id;
    el('getReviewIncidentId').value = r.data.id;
  }
  render('resultIncidents', r);
};

el('btnListIncidents').onclick = async () => {
  const sid = el('listIncidentSession').value.trim();
  const paging = el('listIncidentPaging').value.trim();
  let path = '/incidents';
  const params = [];
  if (sid) params.push('sessionId=' + encodeURIComponent(sid));
  if (paging) params.push(paging);
  if (params.length) path += '?' + params.join('&');
  const r = await api(path);
  render('resultIncidents', r);
};

el('btnGetIncident').onclick = async () => {
  const id = el('getIncidentId').value.trim();
  const r = await api(`/incidents/${id}`);
  render('resultIncidents', r);
};

// Reviews
el('btnCreateReview').onclick = async () => {
  const incidentId = el('reviewIncidentId').value.trim();
  const reviewerId = el('reviewerId').value.trim() || null;
  const status = el('reviewStatus').value;
  const note = el('reviewNote').value.trim() || null;
  const body = { incidentId, reviewerId, status, note };
  const r = await api('/admin/reviews', { method:'POST', body });
  render('resultReviews', r);
};

el('btnGetReview').onclick = async () => {
  const incidentId = el('getReviewIncidentId').value.trim();
  const r = await api(`/admin/reviews?incidentId=${encodeURIComponent(incidentId)}`);
  render('resultReviews', r);
};

// Admin ping
el('btnAdminPing').onclick = async () => {
  const r = await api('/admin/ping');
  render('resultAdmin', r);
};

// Utility: auto-fill inputs using current session or last incident
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['resultSessions','resultEvents','resultSnapshots','resultUpload','resultIncidents','resultReviews','resultAdmin'].forEach(id => el(id).textContent='');
  }
});