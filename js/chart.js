// ===== 公文スコア推移 — グラフ描画（Phase 6） =====
// Chart.js（lib/chart.min.js）を使用。1つのキャンバスを使い回す。

let _chart = null;
const CANVAS_ID = 'graph-canvas';

function _sortByDate(records) {
  return [...records].sort((a, b) => (a.date < b.date ? -1 : 1));
}
function _labels(records) {
  return records.map(r => r.date.slice(5)); // MM-DD
}
function _render(config) {
  const ctx = document.getElementById(CANVAS_ID);
  if (_chart) _chart.destroy();
  config.options = Object.assign(
    { responsive: true, maintainAspectRatio: false },
    config.options || {}
  );
  _chart = new Chart(ctx, config);
}

// 獲得ポイント：内訳（基礎／スピード／フルセット）の積み上げ棒
function drawPointsChart(records) {
  const rs = _sortByDate(records);
  _render({
    type: 'bar',
    data: {
      labels: _labels(rs),
      datasets: [
        { label: 'きそ',       data: rs.map(r => r.basePoints),   backgroundColor: '#ffd9a8' },
        { label: 'スピード',   data: rs.map(r => r.speedBonus),   backgroundColor: '#ff9f43' },
        { label: 'フルセット', data: rs.map(r => r.fullSetBonus), backgroundColor: '#6cc070' }
      ]
    },
    options: { scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
  });
}

// 累計（全期間）獲得ポイント：面グラフ
function drawTotalPointsChart(records) {
  const rs = _sortByDate(records);
  let sum = 0;
  const data = rs.map(r => (sum += r.earnedPoints));
  _render({
    type: 'line',
    data: {
      labels: _labels(rs),
      datasets: [{
        label: 'るいけいpt', data, fill: true, tension: 0.2,
        borderColor: '#ff9f43', backgroundColor: 'rgba(255,159,67,.2)'
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

// 1枚あたりの時間（秒）：折れ線。自己ベスト更新点を強調＋レベル変更点に△マーカー
function drawTimeChart(records) {
  const rs = _sortByDate(records);
  // 直前の記録とレベルが変わった点＝レベル変更（△で表示）
  const isLevelStart = rs.map((r, i) => i > 0 && r.level !== rs[i - 1].level);
  _render({
    type: 'line',
    data: {
      labels: _labels(rs),
      datasets: [{
        label: '1まいの秒', data: rs.map(r => r.secondsPerSheet),
        borderColor: '#5b8def', tension: 0.2,
        pointStyle: rs.map((r, i) => isLevelStart[i] ? 'triangle' : 'circle'),
        pointRadius: rs.map((r, i) => isLevelStart[i] ? 9 : (r.isBest ? 6 : 3)),
        pointBackgroundColor: rs.map((r, i) => isLevelStart[i] ? '#d33' : (r.isBest ? '#ee7e1b' : '#5b8def'))
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } },
      plugins: {
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const i = ctx.dataIndex;
              return 'レベル ' + rs[i].level + (isLevelStart[i] ? '（ここでレベルアップ▲）' : '');
            }
          }
        }
      }
    }
  });
}

// 実施枚数：棒（0〜10）
function drawSheetsChart(records) {
  const rs = _sortByDate(records);
  _render({
    type: 'bar',
    data: {
      labels: _labels(rs),
      datasets: [{ label: 'まい数', data: rs.map(r => r.sheets), backgroundColor: '#6cc070' }]
    },
    options: { scales: { y: { beginAtZero: true, max: 10, ticks: { stepSize: 2 } } } }
  });
}
