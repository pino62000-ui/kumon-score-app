// ===== 公文スコア推移 — スコア計算（Phase 2） =====
// がんばりポイント加点方式（設計書 4.4 / 10章 score.js）

const SCORE_VERSION = 1;   // スコア計算式のバージョン（式を変えたら +1）

// currentBest: そのレベルでの自己ベスト秒/枚（未記録なら null）
function calcScore(sheets, totalSeconds, currentBest) {
  const secondsPerSheet = totalSeconds / sheets;

  // ① 基礎ポイント：やった分だけ必ずもらえる
  const basePoints = sheets * 10;

  // ② スピードボーナス：そのレベルの自己ベストと比較
  let speedBonus = 0;
  let isBest = false;
  if (currentBest == null) {
    speedBonus = 30;                              // そのレベル初回（はじめてボーナス）
    isBest = true;                                // ベストとして記録する
  } else if (secondsPerSheet < currentBest) {
    speedBonus = 50;                              // 自己ベスト更新
    isBest = true;
  } else if (secondsPerSheet <= currentBest * 1.1) {
    speedBonus = 20;                              // ベスト×1.1以内（好調）
  }

  // ③ フルセットボーナス：10枚やり切り
  const fullSetBonus = sheets === 10 ? 30 : 0;

  return {
    secondsPerSheet: Math.round(secondsPerSheet),
    basePoints,
    speedBonus,
    fullSetBonus,
    earnedPoints: basePoints + speedBonus + fullSetBonus,
    isBest,   // levels.best の更新判定に使用（初回も true）
    scoreVersion: SCORE_VERSION
  };
}
