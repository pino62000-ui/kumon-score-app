// ===== 公文スコア推移 — キャラ育成（Phase 2） =====
// 共有キャラ：2人の今期ポイント合計で育つ（設計書 4.5 / 10章 char.js）

// 家族合計の月間ポイントからキャラの段階を返す（しきい値表）
// ※ 2人の合算なので、しきい値は単独の約2倍に設定
// emoji は画像（char_N.png）が無いときのフォールバック表示
const CHAR_STAGES = [
  { level: 1, min: 0,    title: 'たまご',   image: 'char_1.png', emoji: '🥚' },
  { level: 2, min: 800,  title: 'ひよこ',   image: 'char_2.png', emoji: '🐣' },
  { level: 3, min: 2400, title: 'とり',     image: 'char_3.png', emoji: '🐤' },
  { level: 4, min: 4800, title: 'はばたき', image: 'char_4.png', emoji: '🐥' },
  { level: 5, min: 8000, title: 'エース',   image: 'char_5.png', emoji: '🦅' },
];

// 全プロフィールの今期ポイントを合計（協力＝2人の貢献の和）
// リセットで全員0になるため、単純合計でよい
function familyMonthlyPoints(data) {
  return data.profiles.reduce((sum, p) => sum + p.monthlyPoints, 0);
}

// 家族合計ポイントから現在の段階を返す（条件を満たす最上位）
function getCharLevel(familyPoints) {
  return [...CHAR_STAGES].reverse().find(s => familyPoints >= s.min);
}

// 次の段階に必要な残りポイント（最終段階なら 0）
function pointsToNextLevel(familyPoints) {
  const next = CHAR_STAGES.find(s => s.min > familyPoints);
  return next ? next.min - familyPoints : 0;
}

// 画像URLは月キーでキャッシュ無効化（毎月の PNG 上書きを確実に反映）
function charImageUrl(stage, monthKey) {
  return `img/${stage.image}?m=${monthKey}`;
}
