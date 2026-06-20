// ===== 公文スコア推移 — データ層（Phase 1） =====
// localStorage に全データを1キーで保存・読み書きする。
// データ構造は設計書 9章に準拠。ロジック（score/badge/char）からは
// ここの関数を通してのみ読み書きする。

const STORAGE_KEY = 'kumon-app';
const SUBJECTS = ['算数', '国語', '英語'];

// ---- 日付ユーティリティ ----
function todayStr() {
  const d = new Date();
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function monthOf(dateStr) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

// ---- 初期データ（シード）----
function makeLevels() {
  const today = todayStr();
  const levels = {};
  SUBJECTS.forEach(sub => {
    levels[sub] = {
      current: '2A',                                   // 初期レベル（設定画面で変更可）
      history: [{ level: '2A', changedAt: today }],    // レベルが始まった日
      best: {}                                         // レベルごとの自己ベスト秒/枚
    };
  });
  return levels;
}
function makeProfile(id, name, icon, iconImg) {
  // iconImg: アイコン画像のパス（img/ 配下）。空なら絵文字 icon を表示する
  return { id, name, icon, iconImg: iconImg || '', monthlyPoints: 0, levels: makeLevels(), records: [], badges: [] };
}
function defaultData() {
  return {
    scoreVersion: 1,
    monthKey: monthOf(todayStr()),
    settings: { sound: true },
    profiles: [
      makeProfile('profile_1', 'さくらうま', '🐴', 'img/icon_hana.png'),
      makeProfile('profile_2', 'さくらちゃん', '😽', 'img/icon_sora.png')
    ]
  };
}

// ---- 基本：取得・保存 ----
function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = defaultData();
      saveData(seed);
      return seed;
    }
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.profiles)) throw new Error('壊れたデータ');
    migrateData(data);   // 後から追加したフィールドを既存データに補完
    return data;
  } catch (e) {
    // 壊れている／空のときは初期化（破壊前にバックアップを促す運用は別途）
    console.warn('データを初期化しました:', e);
    const seed = defaultData();
    saveData(seed);
    return seed;
  }
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
// 既存データに後から追加したフィールドを補完する（記録は壊さず追記のみ）
const DEFAULT_ICON_IMG = { profile_1: 'img/icon_hana.png', profile_2: 'img/icon_sora.png' };
// 旧 name のときだけ新しい name・絵文字へ置き換える（1回限りの改名）
const PROFILE_RENAME = {
  profile_1: { from: 'はな', name: 'さくらうま',   icon: '🐴' },
  profile_2: { from: 'そら', name: 'さくらちゃん', icon: '😽' }
};
function migrateData(data) {
  let changed = false;
  data.profiles.forEach(p => {
    if (p.iconImg == null) { p.iconImg = DEFAULT_ICON_IMG[p.id] || ''; changed = true; }
    const r = PROFILE_RENAME[p.id];
    if (r && p.name === r.from) { p.name = r.name; p.icon = r.icon; changed = true; }
  });
  if (changed) saveData(data);
}
function getProfile(id) {
  return getData().profiles.find(p => p.id === id) || null;
}

// ---- 記録の追加 ----
// record は buildRecord() で組み立て済み（earnedPoints 等を含む）。
// 月間ポイントに加算するだけ（自動リセットはしない）。
function addRecord(profileId, record) {
  const data = getData();
  const profile = data.profiles.find(p => p.id === profileId);
  if (!profile) return;
  profile.records.push(record);
  profile.monthlyPoints += record.earnedPoints;
  saveData(data);
}

// ---- レベル設定 ----
function updateLevel(profileId, subject, level) {
  const data = getData();
  const profile = data.profiles.find(p => p.id === profileId);
  if (!profile) return;
  const lv = profile.levels[subject];
  lv.current = level;
  lv.history.push({ level, changedAt: todayStr() });
  saveData(data);
}

// ---- 自己ベスト ----
function getBest(profileId, subject, level) {
  const profile = getProfile(profileId);
  const best = profile && profile.levels[subject] && profile.levels[subject].best;
  return (best && best[level] != null) ? best[level] : null;
}
function updateBest(profileId, subject, level, seconds) {
  const data = getData();
  const profile = data.profiles.find(p => p.id === profileId);
  if (!profile) return;
  profile.levels[subject].best[level] = seconds;
  saveData(data);
}
// 残りの記録から自己ベストを再計算（削除・修正後に呼ぶ）
function recalcBest(profileId, subject, level) {
  const data = getData();
  const profile = data.profiles.find(p => p.id === profileId);
  if (!profile) return;
  const times = profile.records
    .filter(r => r.subject === subject && r.level === level)
    .map(r => r.secondsPerSheet);
  if (times.length === 0) {
    delete profile.levels[subject].best[level];
  } else {
    profile.levels[subject].best[level] = Math.min(...times);
  }
  saveData(data);
}

// ---- 記録の削除 ----
function deleteRecord(profileId, recordId) {
  const data = getData();
  const profile = data.profiles.find(p => p.id === profileId);
  if (!profile) return;
  const idx = profile.records.findIndex(r => r.id === recordId);
  if (idx < 0) return;
  const rec = profile.records[idx];
  profile.records.splice(idx, 1);
  // 今期（同じ monthKey）の記録なら月間ポイントから差し引く
  if (monthOf(rec.date) === data.monthKey) {
    profile.monthlyPoints = Math.max(0, profile.monthlyPoints - rec.earnedPoints);
  }
  saveData(data);
  recalcBest(profileId, rec.subject, rec.level);
}

// ---- 設定 ----
function setSetting(key, value) {
  const data = getData();
  data.settings = data.settings || {};
  data.settings[key] = value;
  saveData(data);
}
// プロフィールの名前・アイコンを変更
function updateProfile(profileId, name, icon) {
  const data = getData();
  const p = data.profiles.find(pr => pr.id === profileId);
  if (!p) return;
  if (name) p.name = name;
  if (icon) p.icon = icon;
  saveData(data);
}

// ---- バックアップ ----
function exportData() {
  // 全データを整形JSON文字列で返す（app.js でファイルダウンロードに包む）
  return JSON.stringify(getData(), null, 2);
}
function importData(json) {
  const obj = JSON.parse(json); // 不正なら例外
  if (!obj || !Array.isArray(obj.profiles)) {
    throw new Error('バックアップの形式が正しくありません');
  }
  saveData(obj);
}

// ---- バッジ付与 ----
// 新たに獲得したバッジID配列を、獲得日とともに追記（重複は無視）
function saveBadges(profileId, badgeIds) {
  if (!badgeIds || badgeIds.length === 0) return;
  const data = getData();
  const profile = data.profiles.find(p => p.id === profileId);
  if (!profile) return;
  const today = todayStr();
  badgeIds.forEach(id => {
    if (!profile.badges.some(b => b.id === id)) {
      profile.badges.push({ id, earnedAt: today });
    }
  });
  saveData(data);
}

// ---- 月リセット（保護者が任意に実行）----
function resetMonth(newMonthKey) {
  const data = getData();
  data.monthKey = newMonthKey;
  data.profiles.forEach(p => { p.monthlyPoints = 0; });
  saveData(data);
}
