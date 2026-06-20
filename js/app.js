// ===== 公文スコア推移 — 画面制御＋描画（Phase 4） =====
// storage.js / score.js / badge.js / char.js を利用してホームを実データ表示する。

let currentProfileId = null;

const profileSelect = document.getElementById('profile-select');
const app = document.getElementById('app');

// ---- 画面切替 ----
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-btn[data-target="${name}"]`);
  if (navBtn) navBtn.classList.add('active');

  if (name === 'home') renderHome();      // 表示のたび最新化
  if (name === 'record') renderRecord();  // 記録フォームを初期化
  if (name === 'graph') renderGraph();    // グラフを描画
  if (name === 'settings') renderSettings();
  if (name === 'badge') renderBadges();
  if (name === 'summary') renderSummary();
}

// ===== バッジ一覧（Phase 7） =====
const BADGE_DEFS = [
  { id: 'perfect',     name: 'パーフェクト',     emoji: '🏆', desc: '10まい＋ベスト更新' },
  { id: 'speed_star',  name: 'スピードスター',   emoji: '⚡', desc: 'じこベスト更新' },
  { id: 'full_set',    name: 'フルセット',       emoji: '✅', desc: '10まい やりきり' },
  { id: 'weekly_goal', name: '今週たっせい',     emoji: '🔥', desc: '今週 4日' },
  { id: 'streak_4w',   name: '4しゅうれんぞく', emoji: '⭐', desc: '4しゅう つづけて' },
  { id: 'level_up',    name: 'レベルアップ',     emoji: '🎓', desc: 'あたらしいレベル' }
];

function renderBadges() {
  const profile = getProfile(currentProfileId);
  const earned = new Map(profile.badges.map(b => [b.id, b.earnedAt]));
  const got = document.getElementById('badge-got');
  const lock = document.getElementById('badge-lock');
  got.innerHTML = ''; lock.innerHTML = '';
  let gotN = 0, lockN = 0;

  BADGE_DEFS.forEach(def => {
    const has = earned.has(def.id);
    const card = document.createElement('div');
    card.className = 'badge-card' + (has ? '' : ' locked');
    card.innerHTML =
      `<div class="b-emoji">${has ? def.emoji : '🔒'}</div>` +
      `<div class="b-name">${def.name}</div>` +
      `<div class="b-desc">${def.desc}</div>` +
      (has ? `<div class="b-date">${earned.get(def.id)}</div>` : '');
    (has ? got : lock).appendChild(card);
    has ? gotN++ : lockN++;
  });
  document.getElementById('badge-got-count').textContent = `（${gotN}）`;
  document.getElementById('badge-lock-count').textContent = `（${lockN}）`;
}

// ===== サマリー（Phase 7） =====
let summaryPeriod = 'week';

function recordsInPeriod(records, period) {
  if (period === 'week') {
    const { start, end } = thisWeekRange();
    return records.filter(r => r.date >= start && r.date <= end);
  }
  const mk = todayStr().slice(0, 7); // 今月（YYYY-MM）
  return records.filter(r => r.date.slice(0, 7) === mk);
}

function renderSummary() {
  const profile = getProfile(currentProfileId);
  const rs = recordsInPeriod(profile.records, summaryPeriod);

  const days = new Set(rs.map(r => r.date)).size;
  const earnedArr = rs.map(r => r.earnedPoints);
  const avg = earnedArr.length ? Math.round(earnedArr.reduce((a, b) => a + b, 0) / earnedArr.length) : 0;
  const max = earnedArr.length ? Math.max(...earnedArr) : 0;
  const avgSheets = rs.length ? (rs.reduce((a, r) => a + r.sheets, 0) / rs.length).toFixed(1) : '0';
  const daysLabel = summaryPeriod === 'week' ? `${days} / 7日` : `${days}日`;

  document.getElementById('summary-stats').innerHTML =
    `<div class="stat-row"><span>がくしゅう日すう</span><b>${daysLabel}</b></div>` +
    `<div class="stat-row"><span>へいきんポイント</span><b>${avg}pt</b></div>` +
    `<div class="stat-row"><span>さいこうポイント</span><b>${max}pt</b></div>` +
    `<div class="stat-row"><span>へいきんまい数</span><b>${avgSheets}まい</b></div>`;

  // 教科別 平均ポイント
  const subj = document.getElementById('summary-subjects');
  const avgs = SUBJECTS.map(s => {
    const list = rs.filter(r => r.subject === s).map(r => r.earnedPoints);
    return { s, avg: list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : 0 };
  });
  const maxAvg = Math.max(1, ...avgs.map(a => a.avg));
  subj.innerHTML = '<div style="font-weight:bold;margin-bottom:.4rem;">きょうか別 へいきんポイント</div>' +
    avgs.map(a =>
      `<div class="subj-row">${SUBJECT_LABEL[a.s]}　${a.avg}pt` +
      `<div class="subj-bar-bg"><div class="subj-bar" style="width:${Math.round(a.avg / maxAvg * 100)}%"></div></div></div>`
    ).join('');
}

// ===== 設定（Phase 8） =====
const LEVELS = ['6A','5A','4A','3A','2A','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'];
// SUBJECTS は storage.js で宣言済みのものを使う

function renderSettings() {
  const data = getData();

  // (1) 教材レベル設定
  const lvWrap = document.getElementById('set-levels');
  lvWrap.innerHTML = '';
  data.profiles.forEach(p => {
    SUBJECTS.forEach(sub => {
      const row = document.createElement('div');
      row.className = 'level-row';
      const cur = p.levels[sub] ? p.levels[sub].current : '2A';
      const opts = LEVELS.map(l => `<option ${l === cur ? 'selected' : ''}>${l}</option>`).join('');
      row.innerHTML = `<span>${p.icon} ${p.name}</span><span>${SUBJECT_LABEL[sub]}</span><select>${opts}</select>`;
      row.querySelector('select').addEventListener('change', e => {
        updateLevel(p.id, sub, e.target.value);
      });
      lvWrap.appendChild(row);
    });
  });

  // (2) 記録の修正・削除：プロフィール選択
  const sel = document.getElementById('set-rec-profile');
  sel.innerHTML = data.profiles.map(p => `<option value="${p.id}">${p.icon} ${p.name}</option>`).join('');
  renderRecordList();

  // (4) 効果音
  document.getElementById('set-sound').checked = !!data.settings.sound;
}

function renderRecordList() {
  const pid = document.getElementById('set-rec-profile').value;
  const profile = getProfile(pid);
  const wrap = document.getElementById('set-records');
  wrap.innerHTML = '';
  if (!profile || profile.records.length === 0) {
    wrap.innerHTML = '<p class="muted">きろくは ありません</p>';
    return;
  }
  [...profile.records].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).forEach(r => {
    const item = document.createElement('div');
    item.className = 'rec-item';
    item.innerHTML = `<span>${r.date}　${SUBJECT_LABEL[r.subject]}(${r.level})　${r.sheets}まい　${r.earnedPoints}pt</span>`;
    const del = document.createElement('button');
    del.className = 'rec-del'; del.textContent = '🗑';
    del.addEventListener('click', () => {
      if (confirm('この きろくを けしますか？')) {
        deleteRecord(pid, r.id);
        renderRecordList();
      }
    });
    item.appendChild(del);
    wrap.appendChild(item);
  });
}

// バックアップ書き出し
function exportBackup() {
  const blob = new Blob([exportData()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `kumon-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
// バックアップ読み込み
function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try { importData(reader.result); alert('ふくげん しました'); backToProfiles(); }
    catch (e) { alert('よみこみ しっぱい：' + e.message); }
  };
  reader.readAsText(file);
}
// 月リセット
function nextMonthKey(mk) {
  let [y, m] = mk.split('-').map(Number);
  m++; if (m > 12) { m = 1; y++; }
  return `${y}-${String(m).padStart(2, '0')}`;
}
function doMonthReset() {
  if (!confirm('こんげつを とじて、あたらしいキャラを はじめます。\nみんなのポイントが 0 に なります。よろしいですか？')) return;
  const data = getData();
  resetMonth(nextMonthKey(data.monthKey));
  alert('リセットしました。\nキャラの え（img/char_1〜5.png）を 入れかえてください。');
  renderSettings();
}

// ===== グラフ（Phase 6） =====
let graphTab = 'points';

function renderGraph() {
  const profile = getProfile(currentProfileId);
  const subject = document.getElementById('graph-subject').value;
  let records = profile.records;
  if (subject) records = records.filter(r => r.subject === subject);

  const empty = document.getElementById('graph-empty');
  const canvas = document.getElementById('graph-canvas');
  if (records.length === 0) {
    empty.classList.remove('hidden');
    canvas.style.visibility = 'hidden';
    return;
  }
  empty.classList.add('hidden');
  canvas.style.visibility = 'visible';

  if (graphTab === 'points') drawPointsChart(records);
  else if (graphTab === 'total') drawTotalPointsChart(records);
  else if (graphTab === 'time') drawTimeChart(records);
  else if (graphTab === 'sheets') drawSheetsChart(records);
}

// 教科の表示名（データ値はそのまま、画面表示だけひらがな）
const SUBJECT_LABEL = { '算数': 'さんすう', '国語': 'こくご', '英語': 'えいご' };

// バッジID → 表示名
const BADGE_NAMES = {
  perfect: 'パーフェクト', speed_star: 'スピードスター', full_set: 'フルセット',
  weekly_goal: '今週たっせい', streak_4w: '4しゅうれんぞく', level_up: 'レベルアップ'
};

// ---- キャラ画像（無ければ絵文字にフォールバック）----
function setCharImage(el, stage, monthKey) {
  el.textContent = '';
  const img = document.createElement('img');
  img.src = charImageUrl(stage, monthKey);
  img.alt = stage.title;
  img.onerror = () => { el.textContent = stage.emoji; };
  el.appendChild(img);
}

// ---- プロフィール選択画面の描画 ----
function renderProfileSelect() {
  const data = getData();

  // プロフィールカード
  const wrap = document.getElementById('profile-cards');
  wrap.innerHTML = '';
  data.profiles.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'profile-card';
    btn.innerHTML = `<span class="profile-icon">${p.icon}</span><span class="profile-name">${p.name}</span>`;
    btn.addEventListener('click', () => selectProfile(p.id));
    wrap.appendChild(btn);
  });

  // 共有キャラ行
  const fam = familyMonthlyPoints(data);
  const stage = getCharLevel(fam);
  document.getElementById('ps-char').textContent =
    `みんなでそだてる：${stage.title} Lv${stage.level}　${stage.emoji}　かぞく ${fam}pt`;
}

// ---- ホーム画面の描画 ----
function renderHome() {
  const data = getData();
  const profile = data.profiles.find(p => p.id === currentProfileId);
  if (!profile) return;

  // 個人：きょうの獲得・今月
  const today = todayStr();
  const todayPts = profile.records
    .filter(r => r.date === today)
    .reduce((s, r) => s + r.earnedPoints, 0);
  document.getElementById('home-icon').textContent = profile.icon;
  document.getElementById('home-name').textContent = profile.name;
  document.getElementById('home-today').textContent = todayPts + 'pt';
  document.getElementById('home-month').textContent = profile.monthlyPoints + 'pt';

  // 共有キャラ（2人の合算）
  const fam = familyMonthlyPoints(data);
  const stage = getCharLevel(fam);
  document.getElementById('home-char-title').textContent = `${stage.title} Lv${stage.level}`;
  setCharImage(document.getElementById('home-char-img'), stage, data.monthKey);

  const contrib = data.profiles.map(p => `${p.icon}${p.monthlyPoints}`).join(' + ');
  document.getElementById('home-contrib').textContent = `${contrib} ＝ かぞく ${fam}pt`;

  const next = pointsToNextLevel(fam);
  document.getElementById('home-next').textContent =
    next > 0 ? `つぎまで${next}pt` : 'さいこうレベル！';

  // 週の達成
  const days = countDaysThisWeek(profile.records);
  const streak = calcWeekStreak(profile.records);
  document.getElementById('home-week').textContent =
    `🔥 今週 ${days}/${WEEK_GOAL}日` + (streak > 0 ? `　⭐${streak}週れんぞく` : '');
}

// ---- 遷移 ----
function selectProfile(id) {
  currentProfileId = id;
  profileSelect.classList.add('hidden');
  app.classList.remove('hidden');
  showScreen('home');
}
function backToProfiles() {
  app.classList.add('hidden');
  profileSelect.classList.remove('hidden');
  renderProfileSelect();
}

// ===== 記録入力（Phase 5） =====
let recSubject = '算数';
let recSheets = 10;
let timerId = null;
let timerStart = 0;

// 記録フォームを開くたびに初期化
function renderRecord() {
  stopTimer(false);
  document.getElementById('rec-date').value = todayStr();
  document.getElementById('rec-min').value = 0;
  document.getElementById('rec-sec').value = 0;
  document.getElementById('rec-comment').value = '';
  recSubject = '算数';
  recSheets = 10;

  // まい数ボタン（1〜10）を生成
  const sheetWrap = document.getElementById('rec-sheets');
  sheetWrap.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = i;
    b.addEventListener('click', () => { recSheets = i; markSelected(sheetWrap, b); updatePreview(); });
    sheetWrap.appendChild(b);
  }
  // 既定の選択を反映
  selectChip('rec-subjects', '算数');
  selectChipByText(sheetWrap, '10');
  updateLevelLabel();
  updatePreview();
}

function markSelected(wrap, btn) {
  wrap.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  btn.classList.add('selected');
}
function selectChip(wrapId, subject) {
  const wrap = document.getElementById(wrapId);
  wrap.querySelectorAll('.chip').forEach(c =>
    c.classList.toggle('selected', c.dataset.subject === subject));
}
function selectChipByText(wrap, text) {
  wrap.querySelectorAll('.chip').forEach(c =>
    c.classList.toggle('selected', c.textContent === text));
}

function updateLevelLabel() {
  const profile = getProfile(currentProfileId);
  const lv = profile.levels[recSubject] ? profile.levels[recSubject].current : '―';
  document.getElementById('rec-level').textContent = lv;
}

function getFormTotalSeconds() {
  const m = parseInt(document.getElementById('rec-min').value, 10) || 0;
  const s = parseInt(document.getElementById('rec-sec').value, 10) || 0;
  return m * 60 + s;
}

// ポイントのライブプレビュー
function updatePreview() {
  const totalSeconds = getFormTotalSeconds();
  const best = getBest(currentProfileId, recSubject, currentLevel());
  const set = (id, v) => document.getElementById(id).textContent = v;

  if (recSheets > 0 && totalSeconds > 0) {
    const r = calcScore(recSheets, totalSeconds, best);
    set('pv-earned', r.earnedPoints);
    set('pv-base', r.basePoints);
    set('pv-speed', r.speedBonus);
    set('pv-full', r.fullSetBonus);
    set('pv-persheet', `1まい ${r.secondsPerSheet}びょう`);
    let tag = '';
    if (r.speedBonus === 50) tag = '🎉ベスト更新!';
    else if (r.speedBonus === 30) tag = '✨はじめて';
    else if (r.speedBonus === 20) tag = '👍好調';
    document.getElementById('pv-best').textContent = tag;
  } else {
    ['pv-earned', 'pv-base', 'pv-speed', 'pv-full'].forEach(id => set(id, 0));
    set('pv-persheet', 'まい数とじかんを入れてね');
    document.getElementById('pv-best').textContent = '';
  }
}
function currentLevel() {
  const profile = getProfile(currentProfileId);
  return profile.levels[recSubject] ? profile.levels[recSubject].current : null;
}

// ---- ストップウォッチ ----
function toggleTimer() {
  if (timerId) { stopTimer(true); }
  else { startTimer(); }
}
function startTimer() {
  timerStart = Date.now() - getFormTotalSeconds() * 1000; // 既存値から継続
  const btn = document.getElementById('rec-timer');
  btn.textContent = '■ ストップ';
  btn.classList.add('running');
  timerId = setInterval(() => {
    const sec = Math.floor((Date.now() - timerStart) / 1000);
    document.getElementById('rec-min').value = Math.floor(sec / 60);
    document.getElementById('rec-sec').value = sec % 60;
    updatePreview();
  }, 250);
}
function stopTimer(keepValue) {
  if (timerId) { clearInterval(timerId); timerId = null; }
  const btn = document.getElementById('rec-timer');
  if (btn) { btn.textContent = '▶ スタート'; btn.classList.remove('running'); }
}

// ---- 記録の保存 ----
function buildRecord(input, result) {
  return {
    id: 'rec_' + Date.now(),
    createdAt: new Date().toISOString(),
    date: input.date,
    subject: input.subject,
    level: input.level,
    sheets: input.sheets,
    totalSeconds: input.totalSeconds,
    secondsPerSheet: result.secondsPerSheet,
    basePoints: result.basePoints,
    speedBonus: result.speedBonus,
    fullSetBonus: result.fullSetBonus,
    earnedPoints: result.earnedPoints,
    isBest: result.isBest,
    scoreVersion: result.scoreVersion,
    comment: input.comment
  };
}

function onRecordSubmit() {
  stopTimer(true);
  const totalSeconds = getFormTotalSeconds();
  if (recSheets <= 0 || totalSeconds <= 0) {
    alert('まい数とじかんを入れてね');
    return;
  }
  const level = currentLevel();
  const best = getBest(currentProfileId, recSubject, level);
  const result = calcScore(recSheets, totalSeconds, best);

  // 家族レベル（レベルアップ判定用）— 追加前
  const famBefore = familyMonthlyPoints(getData());

  const input = {
    date: document.getElementById('rec-date').value || todayStr(),
    subject: recSubject, level: level,
    sheets: recSheets, totalSeconds: totalSeconds,
    comment: document.getElementById('rec-comment').value.trim()
  };
  const record = buildRecord(input, result);

  addRecord(currentProfileId, record);
  if (result.isBest) updateBest(currentProfileId, recSubject, level, result.secondsPerSheet);

  const newBadges = checkBadges(getProfile(currentProfileId), record);
  saveBadges(currentProfileId, newBadges);

  const famAfter = familyMonthlyPoints(getData());
  showResult(result, newBadges, famBefore, famAfter);
}

// ---- 達成演出 ----
function showResult(result, newBadges, famBefore, famAfter) {
  document.getElementById('res-earned').textContent = result.earnedPoints;

  let bestMsg = '';
  if (result.speedBonus === 50) bestMsg = '🎉 じこベスト こうしん！';
  else if (result.speedBonus === 30) bestMsg = '✨ はじめての きろく！';
  document.getElementById('res-best').textContent = bestMsg;

  const before = getCharLevel(famBefore).level;
  const after = getCharLevel(famAfter);
  document.getElementById('res-char').textContent =
    (after.level > before) ? `⬆️ キャラが「${after.title}」に なった！` : '';

  document.getElementById('res-badges').innerHTML =
    newBadges.map(id => `🏅 ${BADGE_NAMES[id] || id}`).join('<br>');

  document.getElementById('result-overlay').classList.remove('hidden');
  playDing();
}

function closeResult() {
  document.getElementById('result-overlay').classList.add('hidden');
  showScreen('home');
}

// 効果音（settings.sound が ON のときだけ）
function playDing() {
  if (!getData().settings.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.start(); o.stop(ctx.currentTime + 0.3);
  } catch (e) { /* 音が出せない環境は無視 */ }
}

// ---- イベント登録 ----
document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.target));
});
document.querySelectorAll('[data-target]:not(.nav-btn)').forEach(el => {
  el.addEventListener('click', () => showScreen(el.dataset.target));
});
document.getElementById('btn-switch').addEventListener('click', backToProfiles);

// 記録：教科チップ
document.querySelectorAll('#rec-subjects .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    recSubject = chip.dataset.subject;
    selectChip('rec-subjects', recSubject);
    updateLevelLabel();
    updatePreview();
  });
});
// 記録：時間手入力でプレビュー更新
document.getElementById('rec-min').addEventListener('input', updatePreview);
document.getElementById('rec-sec').addEventListener('input', updatePreview);
// 記録：ストップウォッチ・保存・結果クローズ
document.getElementById('rec-timer').addEventListener('click', toggleTimer);
document.getElementById('rec-submit').addEventListener('click', onRecordSubmit);
document.getElementById('res-close').addEventListener('click', closeResult);

// グラフ：教科フィルタ・タブ切替
document.getElementById('graph-subject').addEventListener('change', renderGraph);
document.querySelectorAll('#graph-tabs .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    graphTab = chip.dataset.tab;
    document.querySelectorAll('#graph-tabs .chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    renderGraph();
  });
});

// 設定：各操作
document.getElementById('set-rec-profile').addEventListener('change', renderRecordList);
document.getElementById('set-export').addEventListener('click', exportBackup);
document.getElementById('set-import').addEventListener('change', e => {
  if (e.target.files[0]) importBackup(e.target.files[0]);
  e.target.value = '';
});
document.getElementById('set-sound').addEventListener('change', e => setSetting('sound', e.target.checked));
document.getElementById('set-reset').addEventListener('click', doMonthReset);

// サマリー：期間切替
document.querySelectorAll('#summary-period .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    summaryPeriod = chip.dataset.period;
    document.querySelectorAll('#summary-period .chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    renderSummary();
  });
});

// ---- Service Worker 登録（PWA）----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW登録失敗', err));
  });
}

// ---- 起動 ----
renderProfileSelect();
