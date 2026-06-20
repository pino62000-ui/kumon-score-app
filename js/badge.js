// ===== 公文スコア推移 — バッジ判定・週の達成（Phase 2） =====
// 設計書 4.5 / 10章 badge.js。週判定は月曜〜日曜を1週とする。

const WEEK_GOAL = 4;   // 週の目標日数（週4日以上で「達成」）

// ---- 日付ユーティリティ（週の範囲計算）----
function ymd(date) {
  const z = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}`;
}
// 指定日が含まれる週（月〜日）の範囲を返す。today 省略時は現在。
function thisWeekRange(today = new Date()) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const day = d.getDay();                       // 0:日 〜 6:土
  const diffToMon = (day === 0) ? -6 : 1 - day; // 月曜を週初に
  const mon = new Date(d); mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { start: ymd(mon), end: ymd(sun) };
}
// 週初(月曜)の文字列から前の週の範囲を返す
function prevWeekRange(startStr) {
  const s = new Date(startStr + 'T00:00:00');
  const ps = new Date(s); ps.setDate(s.getDate() - 7);
  const pe = new Date(ps); pe.setDate(ps.getDate() + 6);
  return { start: ymd(ps), end: ymd(pe) };
}

// ---- 週の達成判定 ----
// 今週（today を含む週）に記録した日数
function countDaysThisWeek(records, today = new Date()) {
  const { start, end } = thisWeekRange(today);
  return new Set(
    records.filter(r => r.date >= start && r.date <= end).map(r => r.date)
  ).size;
}
// その週（start〜end）に WEEK_GOAL 日以上記録したか
function isWeekAchieved(records, start, end) {
  return new Set(
    records.filter(r => r.date >= start && r.date <= end).map(r => r.date)
  ).size >= WEEK_GOAL;
}
// 連続達成週数（進行中の今週が未達なら先週から数える）
function calcWeekStreak(records, today = new Date()) {
  let { start, end } = thisWeekRange(today);
  if (!isWeekAchieved(records, start, end)) {
    ({ start, end } = prevWeekRange(start));      // 今週は進行中→先週から
  }
  let streak = 0;
  while (isWeekAchieved(records, start, end)) {
    streak++;
    ({ start, end } = prevWeekRange(start));
  }
  return streak;
}

// ---- バッジ判定 ----
// 新たに獲得したバッジIDの配列を返す。today はテスト用（省略時は現在）。
function checkBadges(profile, newRecord, today = new Date()) {
  const earned = [];

  // スピードスター：自己ベスト更新（初回ボーナス +30 は対象外）
  if (newRecord.speedBonus === 50) earned.push('speed_star');

  // フルセット：10枚やり切り
  if (newRecord.fullSetBonus === 30) earned.push('full_set');

  // パーフェクト：10枚 ＋ 自己ベスト更新を同時達成
  if (newRecord.fullSetBonus === 30 && newRecord.speedBonus === 50) {
    earned.push('perfect');
  }

  // 今週の達成（週4日）と連続達成週数
  if (countDaysThisWeek(profile.records, today) >= WEEK_GOAL) earned.push('weekly_goal');
  if (calcWeekStreak(profile.records, today) >= 4) earned.push('streak_4w');

  // 同教科で初めてのレベルなら level_up
  // ※ checkBadges は addRecord の後に呼ばれ newRecord も records に含まれるため、
  //   「その教科×レベルの記録が1件だけ（＝今回が初）」で判定する
  const sameLevelCount = profile.records.filter(r =>
    r.subject === newRecord.subject && r.level === newRecord.level
  ).length;
  if (sameLevelCount <= 1) earned.push('level_up');

  // すでに獲得済みのバッジは除外
  return earned.filter(id => !profile.badges.some(b => b.id === id));
}
