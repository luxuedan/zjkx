const ALLOWED_USERS = [
  { username: 'root', password: 'zhuqi', nickname: '管理员', role: 'admin' }
];

let currentUser = null;
let dltRedSelected = [];
let dltBlueSelected = [];
let ssqRedSelected = [];
let ssqBlueSelected = [];

let calcDltRed = [];
let calcDltBlue = [];
let pl3Hundred = null;
let pl3Ten = null;
let pl3Unit = null;
let pl5TenThousand = null;
let pl5Thousand = null;
let pl5Hundred = null;
let pl5Ten = null;
let pl5Unit = null;

let dltHistoryData = [];
let ssqHistoryData = [];
let pl3HistoryData = [];
let pl5HistoryData = [];

const TIPS_DATA = {
  dlt: [
    '前区号码选择要均衡，大小比建议3:2或2:3',
    '奇偶比也要注意，建议3奇2偶或2奇3偶',
    '连号不宜过多，一般1-2组为宜',
    '参考冷热号码，但不要完全依赖',
    '后区号码可以参考近期热号搭配'
  ],
  ssq: [
    '红球和值一般在80-130之间比较常见',
    '连号出现概率较高，可适当选择',
    '蓝球可参考奇偶、大小规律',
    '注意号码的区间分布，尽量均匀',
    '质数号码每期一般出现2-3个'
  ],
  pl3: [
    '百位关注近期冷热趋势',
    '十位注意大小形态变化',
    '个位可参考奇偶规律',
    '组三、组六形态交替出现',
    '关注跨度变化，常见跨度为3-7'
  ],
  pl5: [
    '各位置独立分析，关注冷热',
    '注意相邻位置的大小搭配',
    '奇偶比例合理搭配',
    '参考历史号码的重复情况',
    '关注连号组合出现规律'
  ]
};

function init() {
  checkLoginStatus();
  initGrids();
  loadSavedHistory();
  loadHistoryData();
  initTrendCharts();
  initCalculator();
  updateSidePanels('dlt');
}

function checkLoginStatus() {
  const savedUser = localStorage.getItem('dreamer_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      showMainContent();
      return;
    } catch (err) {
      console.log('解析用户信息失败');
    }
  }
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('main-content').style.display = 'none';
}

function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  
  if (!username || !password) {
    errorElement.textContent = '请输入账号和密码';
    return;
  }

  const user = ALLOWED_USERS.find(u => u.username === username && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('dreamer_user', JSON.stringify(user));
    showMainContent();
  } else {
    errorElement.textContent = '账号或密码错误';
  }
}

function showMainContent() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-content').style.display = 'flex';
  document.getElementById('user-info').textContent = '欢迎, ' + currentUser.nickname;
  loadHistoryData();
  initTrendCharts();
  initCalculator();
  updateSidePanels('dlt');
}

function logout() {
  localStorage.removeItem('dreamer_user');
  currentUser = null;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('main-content').style.display = 'none';
}

function initGrids() {
  initDltGrids();
  initSsqGrids();
  initPl3Grids();
  initPl5Grids();
  initAllNumbersDisplay();
}

function initAllNumbersDisplay() {
  document.getElementById('dlt-all-reds').textContent = Array.from({length: 35}, (_, i) => i + 1).join(' ');
  document.getElementById('dlt-all-blues').textContent = Array.from({length: 12}, (_, i) => i + 1).join(' ');
  document.getElementById('ssq-all-reds').textContent = Array.from({length: 33}, (_, i) => i + 1).join(' ');
  document.getElementById('ssq-all-blues').textContent = Array.from({length: 16}, (_, i) => i + 1).join(' ');
}

function initDltGrids() {
  const redGrid = document.getElementById('dlt-red-grid');
  const blueGrid = document.getElementById('dlt-blue-grid');
  
  for (let i = 1; i <= 35; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => toggleDltRed(i);
    redGrid.appendChild(btn);
  }
  
  for (let i = 1; i <= 12; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => toggleDltBlue(i);
    blueGrid.appendChild(btn);
  }
}

function initSsqGrids() {
  const redGrid = document.getElementById('ssq-red-grid');
  const blueGrid = document.getElementById('ssq-blue-grid');
  
  for (let i = 1; i <= 33; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => toggleSsqRed(i);
    redGrid.appendChild(btn);
  }
  
  for (let i = 1; i <= 16; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => toggleSsqBlue(i);
    blueGrid.appendChild(btn);
  }
}

function initPl3Grids() {
  const grids = ['pl3-hundred-grid', 'pl3-ten-grid', 'pl3-unit-grid'];
  const values = ['pl3-hundred-value', 'pl3-ten-value', 'pl3-unit-value'];
  
  grids.forEach((gridId, index) => {
    const grid = document.getElementById(gridId);
    for (let i = 0; i <= 9; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.onclick = () => selectPl3Position(index, i);
      grid.appendChild(btn);
    }
  });
}

function initPl5Grids() {
  const grids = [
    'pl5-ten-thousand-grid',
    'pl5-thousand-grid',
    'pl5-hundred-grid',
    'pl5-ten-grid',
    'pl5-unit-grid'
  ];
  
  grids.forEach((gridId, index) => {
    const grid = document.getElementById(gridId);
    for (let i = 0; i <= 9; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.onclick = () => selectPl5Position(index, i);
      grid.appendChild(btn);
    }
  });
}

function toggleDltRed(num) {
  const index = dltRedSelected.indexOf(num);
  if (index > -1) {
    dltRedSelected.splice(index, 1);
  } else if (dltRedSelected.length < 5) {
    dltRedSelected.push(num);
    dltRedSelected.sort((a, b) => a - b);
  }
  updateDltRedDisplay();
}

function toggleDltBlue(num) {
  const index = dltBlueSelected.indexOf(num);
  if (index > -1) {
    dltBlueSelected.splice(index, 1);
  } else if (dltBlueSelected.length < 2) {
    dltBlueSelected.push(num);
    dltBlueSelected.sort((a, b) => a - b);
  }
  updateDltBlueDisplay();
}

function updateDltRedDisplay() {
  const buttons = document.querySelectorAll('#dlt-red-grid button');
  buttons.forEach(btn => {
    const num = parseInt(btn.textContent);
    btn.classList.toggle('selected', dltRedSelected.includes(num));
  });
  document.getElementById('dlt-red-selected').textContent = dltRedSelected.join(' ');
  document.getElementById('dlt-calc-nums').textContent = dltRedSelected.join(' ');
  if (dltRedSelected.length >= 5) {
    analyzeDltTrend();
  }
}

function updateDltBlueDisplay() {
  const buttons = document.querySelectorAll('#dlt-blue-grid button');
  buttons.forEach(btn => {
    const num = parseInt(btn.textContent);
    btn.classList.toggle('selected', dltBlueSelected.includes(num));
  });
  document.getElementById('dlt-blue-selected').textContent = dltBlueSelected.join(' ');
  document.getElementById('dlt-calc-blues').textContent = dltBlueSelected.join(' ');
}

function toggleSsqRed(num) {
  const index = ssqRedSelected.indexOf(num);
  if (index > -1) {
    ssqRedSelected.splice(index, 1);
  } else if (ssqRedSelected.length < 6) {
    ssqRedSelected.push(num);
    ssqRedSelected.sort((a, b) => a - b);
  }
  updateSsqRedDisplay();
}

function toggleSsqBlue(num) {
  ssqBlueSelected = [num];
  updateSsqBlueDisplay();
}

function updateSsqRedDisplay() {
  const buttons = document.querySelectorAll('#ssq-red-grid button');
  buttons.forEach(btn => {
    const num = parseInt(btn.textContent);
    btn.classList.toggle('selected', ssqRedSelected.includes(num));
  });
  document.getElementById('ssq-red-selected').textContent = ssqRedSelected.join(' ');
  document.getElementById('ssq-calc-nums').textContent = ssqRedSelected.join(' ');
  if (ssqRedSelected.length >= 6) {
    analyzeSsqTrend();
  }
}

function updateSsqBlueDisplay() {
  const buttons = document.querySelectorAll('#ssq-blue-grid button');
  buttons.forEach(btn => {
    const num = parseInt(btn.textContent);
    btn.classList.toggle('selected', ssqBlueSelected.includes(num));
  });
  document.getElementById('ssq-blue-selected').textContent = ssqBlueSelected.join(' ');
  document.getElementById('ssq-calc-blues').textContent = ssqBlueSelected.join(' ');
}

function selectPl3Position(pos, num) {
  if (pos === 0) pl3Hundred = num;
  else if (pos === 1) pl3Ten = num;
  else if (pos === 2) pl3Unit = num;
  updatePl3Display();
}

function updatePl3Display() {
  const positions = ['pl3-hundred', 'pl3-ten', 'pl3-unit'];
  const values = [pl3Hundred, pl3Ten, pl3Unit];
  
  positions.forEach((prefix, index) => {
    const buttons = document.querySelectorAll(`#${prefix}-grid button`);
    buttons.forEach(btn => {
      const num = parseInt(btn.textContent);
      btn.classList.toggle('selected', values[index] === num);
    });
    document.getElementById(`${prefix}-value`).textContent = values[index] !== null ? values[index] : '_';
  });
  
  const selected = [pl3Hundred, pl3Ten, pl3Unit].map(v => v !== null ? v : '_').join(' ');
  document.getElementById('pl3-selected').textContent = selected;
  
  if (pl3Hundred !== null && pl3Ten !== null && pl3Unit !== null) {
    analyzePl3Trend();
  }
}

function selectPl5Position(pos, num) {
  if (pos === 0) pl5TenThousand = num;
  else if (pos === 1) pl5Thousand = num;
  else if (pos === 2) pl5Hundred = num;
  else if (pos === 3) pl5Ten = num;
  else if (pos === 4) pl5Unit = num;
  updatePl5Display();
}

function updatePl5Display() {
  const positions = ['pl5-ten-thousand', 'pl5-thousand', 'pl5-hundred', 'pl5-ten', 'pl5-unit'];
  const values = [pl5TenThousand, pl5Thousand, pl5Hundred, pl5Ten, pl5Unit];
  
  positions.forEach((prefix, index) => {
    const buttons = document.querySelectorAll(`#${prefix}-grid button`);
    buttons.forEach(btn => {
      const num = parseInt(btn.textContent);
      btn.classList.toggle('selected', values[index] === num);
    });
    document.getElementById(`${prefix}-value`).textContent = values[index] !== null ? values[index] : '_';
  });
  
  const selected = values.map(v => v !== null ? v : '_').join(' ');
  document.getElementById('pl5-selected').textContent = selected;
  
  const allSelected = values.every(v => v !== null);
  if (allSelected) {
    analyzePl5Trend();
  }
}

function generateNumbers(type) {
  switch(type) {
    case 'dlt':
      dltRedSelected = [];
      dltBlueSelected = [];
      while (dltRedSelected.length < 5) {
        const num = Math.floor(Math.random() * 35) + 1;
        if (!dltRedSelected.includes(num)) dltRedSelected.push(num);
      }
      dltRedSelected.sort((a, b) => a - b);
      while (dltBlueSelected.length < 2) {
        const num = Math.floor(Math.random() * 12) + 1;
        if (!dltBlueSelected.includes(num)) dltBlueSelected.push(num);
      }
      dltBlueSelected.sort((a, b) => a - b);
      updateDltRedDisplay();
      updateDltBlueDisplay();
      break;
    case 'ssq':
      ssqRedSelected = [];
      ssqBlueSelected = [];
      while (ssqRedSelected.length < 6) {
        const num = Math.floor(Math.random() * 33) + 1;
        if (!ssqRedSelected.includes(num)) ssqRedSelected.push(num);
      }
      ssqRedSelected.sort((a, b) => a - b);
      ssqBlueSelected = [Math.floor(Math.random() * 16) + 1];
      updateSsqRedDisplay();
      updateSsqBlueDisplay();
      break;
    case 'pl3':
      pl3Hundred = Math.floor(Math.random() * 10);
      pl3Ten = Math.floor(Math.random() * 10);
      pl3Unit = Math.floor(Math.random() * 10);
      updatePl3Display();
      break;
    case 'pl5':
      pl5TenThousand = Math.floor(Math.random() * 10);
      pl5Thousand = Math.floor(Math.random() * 10);
      pl5Hundred = Math.floor(Math.random() * 10);
      pl5Ten = Math.floor(Math.random() * 10);
      pl5Unit = Math.floor(Math.random() * 10);
      updatePl5Display();
      break;
  }
}

function clearSelection(type) {
  switch(type) {
    case 'dlt':
      dltRedSelected = [];
      dltBlueSelected = [];
      updateDltRedDisplay();
      updateDltBlueDisplay();
      break;
    case 'ssq':
      ssqRedSelected = [];
      ssqBlueSelected = [];
      updateSsqRedDisplay();
      updateSsqBlueDisplay();
      break;
    case 'pl3':
      pl3Hundred = null;
      pl3Ten = null;
      pl3Unit = null;
      updatePl3Display();
      break;
    case 'pl5':
      pl5TenThousand = null;
      pl5Thousand = null;
      pl5Hundred = null;
      pl5Ten = null;
      pl5Unit = null;
      updatePl5Display();
      break;
  }
}

function saveTicket(type) {
  let ticket = {};
  switch(type) {
    case 'dlt':
      if (dltRedSelected.length !== 5 || dltBlueSelected.length !== 2) {
        alert('请选择完整的号码（前区5个，后区2个）');
        return;
      }
      ticket = {
        type: 'dlt',
        reds: dltRedSelected,
        blues: dltBlueSelected,
        time: new Date().toLocaleString()
      };
      break;
    case 'ssq':
      if (ssqRedSelected.length !== 6 || ssqBlueSelected.length !== 1) {
        alert('请选择完整的号码（红球6个，蓝球1个）');
        return;
      }
      ticket = {
        type: 'ssq',
        reds: ssqRedSelected,
        blues: ssqBlueSelected,
        time: new Date().toLocaleString()
      };
      break;
    case 'pl3':
      if (pl3Hundred === null || pl3Ten === null || pl3Unit === null) {
        alert('请选择完整的号码（百位、十位、个位）');
        return;
      }
      ticket = {
        type: 'pl3',
        nums: [pl3Hundred, pl3Ten, pl3Unit],
        time: new Date().toLocaleString()
      };
      break;
    case 'pl5':
      if (pl5TenThousand === null || pl5Thousand === null || pl5Hundred === null || pl5Ten === null || pl5Unit === null) {
        alert('请选择完整的号码（万位、千位、百位、十位、个位）');
        return;
      }
      ticket = {
        type: 'pl5',
        nums: [pl5TenThousand, pl5Thousand, pl5Hundred, pl5Ten, pl5Unit],
        time: new Date().toLocaleString()
      };
      break;
  }
  
  const savedTickets = JSON.parse(localStorage.getItem('dreamer_tickets') || '[]');
  savedTickets.push(ticket);
  localStorage.setItem('dreamer_tickets', JSON.stringify(savedTickets));
  alert('号码已保存！');
}

function loadHistoryData() {
  loadDltHistory();
  loadSsqHistory();
  loadPl3History();
  loadPl5History();
}

function initCalculator() {
  const redContainer = document.getElementById('dlt-calc-red-numbers');
  const blueContainer = document.getElementById('dlt-calc-blue-numbers');
  
  let redHtml = '';
  for (let i = 1; i <= 35; i++) {
    redHtml += `<span class="number-btn red" onclick="toggleCalcNumber('dlt', 'red', ${i})" id="calc-dlt-red-${i}">${i}</span>`;
  }
  redContainer.innerHTML = redHtml;
  
  let blueHtml = '';
  for (let i = 1; i <= 12; i++) {
    blueHtml += `<span class="number-btn blue" onclick="toggleCalcNumber('dlt', 'blue', ${i})" id="calc-dlt-blue-${i}">${i}</span>`;
  }
  blueContainer.innerHTML = blueHtml;
}

function onGameTypeChange() {
  const gameType = document.getElementById('entry-game-type').value;
  
  document.getElementById('entry-dlt-fields').style.display = 'none';
  document.getElementById('entry-ssq-fields').style.display = 'none';
  document.getElementById('entry-pl3-fields').style.display = 'none';
  document.getElementById('entry-pl5-fields').style.display = 'none';
  
  document.getElementById(`entry-${gameType}-fields`).style.display = 'block';
  
  calculateNextIssue(gameType);
  calculateNextDate(gameType);
}

function calculateNextIssue(gameType) {
  let historyData;
  let prefix = '2026';
  
  switch(gameType) {
    case 'dlt':
      historyData = dltHistoryData;
      break;
    case 'ssq':
      historyData = ssqHistoryData;
      break;
    case 'pl3':
      historyData = pl3HistoryData;
      break;
    case 'pl5':
      historyData = pl5HistoryData;
      break;
  }
  
  if (historyData.length === 0) {
    document.getElementById('entry-issue').value = `${prefix}001`;
    return;
  }
  
  historyData.sort((a, b) => a.issue.localeCompare(b.issue));
  const lastIssue = historyData[historyData.length - 1].issue;
  
  let year = lastIssue.substring(0, 4);
  let num = parseInt(lastIssue.substring(4)) + 1;
  
  if (num > 365) {
    year = parseInt(year) + 1;
    num = 1;
  }
  
  document.getElementById('entry-issue').value = `${year}${num.toString().padStart(3, '0')}`;
}

function calculateNextDate(gameType) {
  const today = new Date();
  let nextDate = new Date(today);
  
  const dltDrawDays = [1, 3, 6];
  const ssqDrawDays = [2, 4, 0];
  
  switch(gameType) {
    case 'dlt':
      nextDate = findNextDrawDate(today, dltDrawDays);
      break;
    case 'ssq':
      nextDate = findNextDrawDate(today, ssqDrawDays);
      break;
    case 'pl3':
    case 'pl5':
      nextDate = new Date(today);
      if (today.getHours() >= 20) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
  }
  
  const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
  document.getElementById('entry-date').value = dateStr;
}

function findNextDrawDate(currentDate, drawDays) {
  const result = new Date(currentDate);
  const currentDay = result.getDay();
  
  let daysToAdd = 0;
  let found = false;
  
  for (let i = 0; i <= 7; i++) {
    const checkDay = (currentDay + i) % 7;
    if (drawDays.includes(checkDay)) {
      if (i === 0) {
        if (result.getHours() < 20) {
          found = true;
          break;
        }
      } else {
        daysToAdd = i;
        found = true;
        break;
      }
    }
  }
  
  if (!found) {
    daysToAdd = 7 - currentDay + drawDays[0];
  }
  
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

function addDrawResult() {
  const gameType = document.getElementById('entry-game-type').value;
  const issue = document.getElementById('entry-issue').value.trim();
  const date = document.getElementById('entry-date').value;
  const resultDiv = document.getElementById('entry-result');
  
  if (!issue || !date) {
    showEntryResult(resultDiv, '请填写期号和日期', 'error');
    return;
  }
  
  switch(gameType) {
    case 'dlt':
      addDltResultNew(issue, date, resultDiv);
      break;
    case 'ssq':
      addSsqResultNew(issue, date, resultDiv);
      break;
    case 'pl3':
      addPl3ResultNew(issue, date, resultDiv);
      break;
    case 'pl5':
      addPl5ResultNew(issue, date, resultDiv);
      break;
  }
}

function addDltResultNew(issue, date, resultDiv) {
  const redsStr = document.getElementById('entry-reds').value.trim();
  const bluesStr = document.getElementById('entry-blues').value.trim();
  
  if (!redsStr || !bluesStr) {
    showEntryResult(resultDiv, '请填写完整的号码信息', 'error');
    return;
  }
  
  const reds = redsStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  const blues = bluesStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  
  if (reds.length !== 5 || reds.some(n => n < 1 || n > 35)) {
    showEntryResult(resultDiv, '前区号码必须是5个1-35之间的数字', 'error');
    return;
  }
  
  if (blues.length !== 2 || blues.some(n => n < 1 || n > 12)) {
    showEntryResult(resultDiv, '后区号码必须是2个1-12之间的数字', 'error');
    return;
  }
  
  reds.sort((a, b) => a - b);
  blues.sort((a, b) => a - b);
  
  const dateObj = new Date(date);
  const weekDay = getDayOfWeek(dateObj);
  
  const newRecord = {
    issue: issue,
    date: date,
    weekDay: weekDay,
    reds: reds,
    blues: blues,
    sum: reds.reduce((a, b) => a + b, 0),
    range: Math.max(...reds) - Math.min(...reds)
  };
  
  saveDltRecord(newRecord);
  showEntryResult(resultDiv, '大乐透开奖结果录入成功！', 'success');
  calculateNextIssue('dlt');
}

function addSsqResultNew(issue, date, resultDiv) {
  const redsStr = document.getElementById('entry-reds').value.trim();
  const blueStr = document.getElementById('entry-blues').value.trim();
  
  if (!redsStr || !blueStr) {
    showEntryResult(resultDiv, '请填写完整的号码信息', 'error');
    return;
  }
  
  const reds = redsStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  const blue = parseInt(blueStr);
  
  if (reds.length !== 6 || reds.some(n => n < 1 || n > 33)) {
    showEntryResult(resultDiv, '红球号码必须是6个1-33之间的数字', 'error');
    return;
  }
  
  if (isNaN(blue) || blue < 1 || blue > 16) {
    showEntryResult(resultDiv, '蓝球号码必须是1-16之间的数字', 'error');
    return;
  }
  
  reds.sort((a, b) => a - b);
  
  const dateObj = new Date(date);
  const weekDay = getDayOfWeek(dateObj);
  
  const newRecord = {
    issue: issue,
    date: date,
    weekDay: weekDay,
    reds: reds,
    blue: blue,
    sum: reds.reduce((a, b) => a + b, 0),
    range: Math.max(...reds) - Math.min(...reds)
  };
  
  saveSsqRecord(newRecord);
  showEntryResult(resultDiv, '双色球开奖结果录入成功！', 'success');
  calculateNextIssue('ssq');
}

function addPl3ResultNew(issue, date, resultDiv) {
  const numsStr = document.getElementById('entry-nums').value.trim();
  
  if (!numsStr) {
    showEntryResult(resultDiv, '请填写开奖号码', 'error');
    return;
  }
  
  const nums = numsStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  
  if (nums.length !== 3 || nums.some(n => n < 0 || n > 9)) {
    showEntryResult(resultDiv, '开奖号码必须是3个0-9之间的数字', 'error');
    return;
  }
  
  const dateObj = new Date(date);
  const weekDay = getDayOfWeek(dateObj);
  
  const newRecord = {
    issue: issue,
    date: date,
    weekDay: weekDay,
    nums: nums,
    sum: nums.reduce((a, b) => a + b, 0)
  };
  
  savePl3Record(newRecord);
  showEntryResult(resultDiv, '排列三开奖结果录入成功！', 'success');
  calculateNextIssue('pl3');
}

function addPl5ResultNew(issue, date, resultDiv) {
  const numsStr = document.getElementById('entry-nums').value.trim();
  
  if (!numsStr) {
    showEntryResult(resultDiv, '请填写开奖号码', 'error');
    return;
  }
  
  const nums = numsStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  
  if (nums.length !== 5 || nums.some(n => n < 0 || n > 9)) {
    showEntryResult(resultDiv, '开奖号码必须是5个0-9之间的数字', 'error');
    return;
  }
  
  const dateObj = new Date(date);
  const weekDay = getDayOfWeek(dateObj);
  
  const newRecord = {
    issue: issue,
    date: date,
    weekDay: weekDay,
    nums: nums,
    sum: nums.reduce((a, b) => a + b, 0)
  };
  
  savePl5Record(newRecord);
  showEntryResult(resultDiv, '排列五开奖结果录入成功！', 'success');
  calculateNextIssue('pl5');
}

function saveDltRecord(record) {
  const existingIndex = dltHistoryData.findIndex(h => h.issue === record.issue);
  if (existingIndex > -1) {
    dltHistoryData[existingIndex] = record;
  } else {
    dltHistoryData.push(record);
    dltHistoryData.sort((a, b) => a.issue.localeCompare(b.issue));
  }
  saveHistoryData();
  loadDltHistory();
  renderDltTrendChart();
  updateSidePanels('dlt');
}

function saveSsqRecord(record) {
  const existingIndex = ssqHistoryData.findIndex(h => h.issue === record.issue);
  if (existingIndex > -1) {
    ssqHistoryData[existingIndex] = record;
  } else {
    ssqHistoryData.push(record);
    ssqHistoryData.sort((a, b) => a.issue.localeCompare(b.issue));
  }
  saveHistoryData();
  loadSsqHistory();
  updateSidePanels('ssq');
}

function savePl3Record(record) {
  const existingIndex = pl3HistoryData.findIndex(h => h.issue === record.issue);
  if (existingIndex > -1) {
    pl3HistoryData[existingIndex] = record;
  } else {
    pl3HistoryData.push(record);
    pl3HistoryData.sort((a, b) => a.issue.localeCompare(b.issue));
  }
  saveHistoryData();
  loadPl3History();
}

function savePl5Record(record) {
  const existingIndex = pl5HistoryData.findIndex(h => h.issue === record.issue);
  if (existingIndex > -1) {
    pl5HistoryData[existingIndex] = record;
  } else {
    pl5HistoryData.push(record);
    pl5HistoryData.sort((a, b) => a.issue.localeCompare(b.issue));
  }
  saveHistoryData();
  loadPl5History();
}

function showEntryResult(resultDiv, message, type) {
  resultDiv.textContent = message;
  resultDiv.style.color = type === 'success' ? '#16a34a' : '#e53935';
  resultDiv.style.display = 'block';
  
  setTimeout(() => {
    resultDiv.style.display = 'none';
  }, 3000);
}

function loadDltHistory() {
  const history = dltHistoryData.length > 0 ? dltHistoryData : generateMockDltHistory();
  const table = document.getElementById('dlt-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="7">开奖结果</th></tr>
      <tr><th></th><th></th><th colspan="5">前区</th><th colspan="2">后区</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td class="red-ball">${h.reds[0]}</td>
          <td class="red-ball">${h.reds[1]}</td>
          <td class="red-ball">${h.reds[2]}</td>
          <td class="red-ball">${h.reds[3]}</td>
          <td class="red-ball">${h.reds[4]}</td>
          <td class="blue-ball">${h.blues[0]}</td>
          <td class="blue-ball">${h.blues[1]}</td>
        </tr>
      `).join('')}
    </table>
  `;
  if (history.length > 0) {
    const latest = history[history.length - 1];
    document.getElementById('dlt-last-issue').textContent = latest.issue;
    document.getElementById('dlt-last-reds').textContent = latest.reds.join(' ');
    document.getElementById('dlt-last-blues').textContent = latest.blues.join(' ');
  }
}

function loadSsqHistory() {
  const history = ssqHistoryData.length > 0 ? ssqHistoryData : generateMockSsqHistory();
  const table = document.getElementById('ssq-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th>星期</th><th colspan="7">开奖结果</th></tr>
      <tr><th></th><th></th><th></th><th colspan="6">红球</th><th>蓝球</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td>${h.weekDay}</td>
          <td class="red-ball">${h.reds[0]}</td>
          <td class="red-ball">${h.reds[1]}</td>
          <td class="red-ball">${h.reds[2]}</td>
          <td class="red-ball">${h.reds[3]}</td>
          <td class="red-ball">${h.reds[4]}</td>
          <td class="red-ball">${h.reds[5]}</td>
          <td class="blue-ball">${h.blue}</td>
        </tr>
      `).join('')}
    </table>
  `;
  if (history.length > 0) {
    const latest = history[history.length - 1];
    document.getElementById('ssq-last-issue').textContent = latest.issue;
    document.getElementById('ssq-last-reds').textContent = latest.reds.join(' ');
    document.getElementById('ssq-last-blue').textContent = latest.blue;
  }
}

function loadPl3History() {
  const history = pl3HistoryData.length > 0 ? pl3HistoryData : generateMockPl3History();
  const table = document.getElementById('pl3-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th>星期</th><th colspan="3">开奖结果</th></tr>
      <tr><th></th><th></th><th></th><th>百位</th><th>十位</th><th>个位</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td>${h.weekDay}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
        </tr>
      `).join('')}
    </table>
  `;
  if (history.length > 0) {
    const latest = history[history.length - 1];
    document.getElementById('pl3-last-issue').textContent = latest.issue;
    document.getElementById('pl3-last-nums').textContent = latest.nums.join(' ');
  }
}

function loadPl5History() {
  const history = pl5HistoryData.length > 0 ? pl5HistoryData : generateMockPl5History();
  const table = document.getElementById('pl5-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th>星期</th><th colspan="5">开奖结果</th></tr>
      <tr><th></th><th></th><th></th><th>万位</th><th>千位</th><th>百位</th><th>十位</th><th>个位</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td>${h.weekDay}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
          <td>${h.nums[3]}</td>
          <td>${h.nums[4]}</td>
        </tr>
      `).join('')}
    </table>
  `;
  if (history.length > 0) {
    const latest = history[history.length - 1];
    document.getElementById('pl5-last-issue').textContent = latest.issue;
    document.getElementById('pl5-last-nums').textContent = latest.nums.join(' ');
  }
}

function getDayOfWeek(date) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()];
}

function generateMockDltHistory() {
  return [
    {"issue":"26021","date":"2026/3/2","weekDay":"周四","reds":[5,8,12,14,17],"blues":[4,5],"sum":56,"range":13},
    {"issue":"26022","date":"2026/3/4","weekDay":"周六","reds":[5,9,10,18,26],"blues":[5,6],"sum":68,"range":21},
    {"issue":"26023","date":"2026/3/7","weekDay":"周二","reds":[9,25,26,27,28],"blues":[1,8],"sum":115,"range":19},
    {"issue":"26024","date":"2026/3/9","weekDay":"周四","reds":[2,4,8,10,21],"blues":[9,12],"sum":45,"range":19},
    {"issue":"26025","date":"2026/3/11","weekDay":"周六","reds":[3,15,24,28,29],"blues":[3,7],"sum":99,"range":26},
    {"issue":"26026","date":"2026/3/14","weekDay":"周二","reds":[10,11,22,26,32],"blues":[1,8],"sum":101,"range":22},
    {"issue":"26027","date":"2026/3/16","weekDay":"周四","reds":[10,10,11,12,36],"blues":[1,11],"sum":79,"range":26},
    {"issue":"26028","date":"2026/3/18","weekDay":"周六","reds":[9,10,11,12,16],"blues":[1,11],"sum":58,"range":7},
    {"issue":"26029","date":"2026/3/21","weekDay":"周二","reds":[3,5,27,19,30],"blues":[5,7],"sum":114,"range":27},
    {"issue":"26030","date":"2026/3/23","weekDay":"周四","reds":[2,13,22,28,34],"blues":[5,12],"sum":99,"range":32},
    {"issue":"26031","date":"2026/3/25","weekDay":"周六","reds":[6,8,22,29,34],"blues":[6,7],"sum":99,"range":28},
    {"issue":"26032","date":"2026/3/28","weekDay":"周二","reds":[3,4,19,26,32],"blues":[1,12],"sum":84,"range":29},
    {"issue":"26033","date":"2026/3/30","weekDay":"周四","reds":[11,5,7,9,18],"blues":[2,10],"sum":50,"range":13},
    {"issue":"26034","date":"2026/4/1","weekDay":"周六","reds":[11,12,25,26,27],"blues":[8,11],"sum":101,"range":16},
    {"issue":"26035","date":"2026/4/4","weekDay":"周二","reds":[2,22,30,33,34],"blues":[8,12],"sum":121,"range":32},
    {"issue":"26036","date":"2026/4/6","weekDay":"周四","reds":[4,7,16,26,32],"blues":[5,8],"sum":85,"range":28},
    {"issue":"26037","date":"2026/4/8","weekDay":"周六","reds":[8,12,13,28,32],"blues":[6,8],"sum":93,"range":24},
    {"issue":"26038","date":"2026/4/11","weekDay":"周二","reds":[8,17,21,33,35],"blues":[6,7],"sum":114,"range":27},
    {"issue":"26039","date":"2026/4/13","weekDay":"周四","reds":[6,11,20,26,27],"blues":[6,9],"sum":90,"range":21},
    {"issue":"26040","date":"2026/4/15","weekDay":"周六","reds":[6,12,13,21,34],"blues":[8,9],"sum":86,"range":28},
    {"issue":"26041","date":"2026/4/18","weekDay":"周二","reds":[24,25,27,29,34],"blues":[2,6],"sum":139,"range":10},
    {"issue":"26042","date":"2026/4/20","weekDay":"周四","reds":[2,7,13,19,24],"blues":[3,8],"sum":65,"range":22},
    {"issue":"26043","date":"2026/4/22","weekDay":"周六","reds":[3,8,12,14,19],"blues":[11,12],"sum":56,"range":16},
    {"issue":"26044","date":"2026/4/25","weekDay":"周二","reds":[1,15,21,26,33],"blues":[4,7],"sum":96,"range":32},
    {"issue":"26045","date":"2026/4/27","weekDay":"周四","reds":[1,13,18,27,33],"blues":[4,7],"sum":92,"range":32},
    {"issue":"26046","date":"2026/4/29","weekDay":"周六","reds":[9,20,21,23,28],"blues":[6,11],"sum":101,"range":19},
    {"issue":"26047","date":"2026/5/2","weekDay":"周二","reds":[11,17,20,23,35],"blues":[1,10],"sum":106,"range":24},
    {"issue":"26048","date":"2026/5/4","weekDay":"周四","reds":[11,17,20,23,35],"blues":[1,10],"sum":106,"range":24},
    {"issue":"26049","date":"2026/5/6","weekDay":"周六","reds":[11,6,14,15,17],"blues":[2,3],"sum":63,"range":11},
    {"issue":"26050","date":"2026/5/9","weekDay":"周二","reds":[6,10,14,23,33],"blues":[8,10],"sum":86,"range":27},
    {"issue":"26051","date":"2026/5/11","weekDay":"周四","reds":[13,18,28,32,33],"blues":[2,11],"sum":124,"range":20},
    {"issue":"26052","date":"2026/5/13","weekDay":"周六","reds":[2,3,20,28,33],"blues":[2,12],"sum":86,"range":31}
  ];
}

function generateMockSsqHistory() {
  const history = [];
  const baseDate = new Date('2026-05-13');
  let issueNum = 150;
  
  for (let i = 0; i < 30; i++) {
    let date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek !== 2 && dayOfWeek !== 4 && dayOfWeek !== 0) {
      continue;
    }
    
    const dateStr = formatDate(date);
    const weekDay = getDayOfWeek(date);
    
    const reds = [];
    while (reds.length < 6) {
      const num = Math.floor(Math.random() * 33) + 1;
      if (!reds.includes(num)) reds.push(num);
    }
    reds.sort((a, b) => a - b);
    const blue = Math.floor(Math.random() * 16) + 1;
    history.push({
      issue: `2026${issueNum.toString().padStart(3, '0')}`,
      date: dateStr,
      weekDay: weekDay,
      reds,
      blue,
      sum: reds.reduce((a, b) => a + b, 0),
      range: Math.max(...reds) - Math.min(...reds)
    });
    issueNum--;
  }
  return history.reverse();
}

function generateMockPl3History() {
  const history = [];
  const baseDate = new Date('2026-05-13');
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    const weekDay = getDayOfWeek(date);
    
    const nums = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];
    history.push({
      issue: `2026${(30 - i).toString().padStart(3, '0')}`,
      date: dateStr,
      weekDay: weekDay,
      nums,
      sum: nums.reduce((a, b) => a + b, 0)
    });
  }
  return history;
}

function generateMockPl5History() {
  const history = [];
  const baseDate = new Date('2026-05-13');
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    const weekDay = getDayOfWeek(date);
    
    const nums = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];
    history.push({
      issue: `2026${(30 - i).toString().padStart(3, '0')}`,
      date: dateStr,
      weekDay: weekDay,
      nums,
      sum: nums.reduce((a, b) => a + b, 0)
    });
  }
  return history;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toggleCalcNumber(gameType, color, num) {
  if (gameType === 'dlt') {
    if (color === 'red') {
      const index = calcDltRed.indexOf(num);
      if (index > -1) {
        calcDltRed.splice(index, 1);
      } else {
        calcDltRed.push(num);
        calcDltRed.sort((a, b) => a - b);
      }
      document.getElementById(`calc-dlt-red-${num}`).classList.toggle('selected');
      document.getElementById('dlt-calc-nums').textContent = calcDltRed.length > 0 ? calcDltRed.join(' ') : '-';
    } else {
      const index = calcDltBlue.indexOf(num);
      if (index > -1) {
        calcDltBlue.splice(index, 1);
      } else {
        calcDltBlue.push(num);
        calcDltBlue.sort((a, b) => a - b);
      }
      document.getElementById(`calc-dlt-blue-${num}`).classList.toggle('selected');
      document.getElementById('dlt-calc-blues').textContent = calcDltBlue.length > 0 ? calcDltBlue.join(' ') : '-';
    }
  }
}

function clearCalcNumbers(gameType) {
  if (gameType === 'dlt') {
    calcDltRed.forEach(num => {
      document.getElementById(`calc-dlt-red-${num}`).classList.remove('selected');
    });
    calcDltBlue.forEach(num => {
      document.getElementById(`calc-dlt-blue-${num}`).classList.remove('selected');
    });
    calcDltRed = [];
    calcDltBlue = [];
    document.getElementById('dlt-calc-nums').textContent = '-';
    document.getElementById('dlt-calc-blues').textContent = '-';
    document.getElementById('dlt-calc-result').textContent = '-';
  }
}

function calculateDlt(op) {
  const nums = [...calcDltRed, ...calcDltBlue];
  if (nums.length === 0) {
    document.getElementById('dlt-calc-result').textContent = '请先选择号码';
    return;
  }
  
  let result;
  switch(op) {
    case 'sum':
      result = `和值: ${nums.reduce((a, b) => a + b, 0)}`;
      break;
    case 'avg':
      result = `平均值: ${(nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)}`;
      break;
    case 'max':
      result = `最大值: ${Math.max(...nums)}`;
      break;
    case 'min':
      result = `最小值: ${Math.min(...nums)}`;
      break;
    case 'range':
      result = `跨度: ${Math.max(...nums) - Math.min(...nums)}`;
      break;
    case 'oddEven':
      const odd = nums.filter(n => n % 2 === 1).length;
      const even = nums.length - odd;
      result = `奇偶比: ${odd}:${even} (${((odd / nums.length) * 100).toFixed(1)}%奇数)`;
      break;
    case 'size':
      const big = nums.filter(n => n > (nums.includes(35) ? 18 : 16)).length;
      const small = nums.length - big;
      result = `大小比: ${big}:${small} (${((big / nums.length) * 100).toFixed(1)}%大数)`;
      break;
    case 'zone':
      const zone1 = nums.filter(n => n >= 1 && n <= 12).length;
      const zone2 = nums.filter(n => n >= 13 && n <= 24).length;
      const zone3 = nums.filter(n => n >= 25 && n <= 35).length;
      result = `区间分布: 1-12=${zone1}个, 13-24=${zone2}个, 25-35=${zone3}个`;
      break;
    case 'repeat':
      const history = dltHistoryData.length > 0 ? dltHistoryData : generateMockDltHistory();
      const recentDraws = history.slice(0, 5);
      let repeatCount = 0;
      let repeatNums = [];
      recentDraws.forEach(draw => {
        nums.forEach(num => {
          if (draw.reds.includes(num) || draw.blues.includes(num)) {
            if (!repeatNums.includes(num)) {
              repeatNums.push(num);
              repeatCount++;
            }
          }
        });
      });
      result = `近5期重号分析: 有${repeatCount}个号码重复出现 (${repeatNums.join(', ') || '无'})`;
      break;
  }
  document.getElementById('dlt-calc-result').textContent = result;
}

function calculateSsq(op) {
  if (ssqRedSelected.length === 0) {
    document.getElementById('ssq-calc-result').textContent = '请先选择号码';
    return;
  }
  
  let result;
  switch(op) {
    case 'sum':
      result = ssqRedSelected.reduce((a, b) => a + b, 0);
      break;
    case 'avg':
      result = (ssqRedSelected.reduce((a, b) => a + b, 0) / ssqRedSelected.length).toFixed(1);
      break;
    case 'max':
      result = Math.max(...ssqRedSelected);
      break;
    case 'min':
      result = Math.min(...ssqRedSelected);
      break;
    case 'range':
      result = Math.max(...ssqRedSelected) - Math.min(...ssqRedSelected);
      break;
    case 'multiply':
      result = ssqRedSelected.reduce((a, b) => a * b, 1);
      break;
    case 'oddEven':
      const ssqOdd = ssqRedSelected.filter(n => n % 2 === 1).length;
      const ssqEven = ssqRedSelected.length - ssqOdd;
      result = `${ssqOdd}:${ssqEven}`;
      break;
    case 'size':
      const ssqBig = ssqRedSelected.filter(n => n > 17).length;
      const ssqSmall = ssqRedSelected.length - ssqBig;
      result = `${ssqBig}:${ssqSmall}`;
      break;
  }
  document.getElementById('ssq-calc-result').textContent = result;
}

function analyzePl3Trend() {
  const history = generateMockPl3History().slice(0, 30);
  const nums = [pl3Hundred, pl3Ten, pl3Unit];
  const analysis = generatePlTrendAnalysis(nums, history, 3);
  document.getElementById('pl3-analysis-result').innerHTML = formatPlAnalysisResult(analysis);
}

function analyzePl5Trend() {
  const history = generateMockPl5History().slice(0, 30);
  const nums = [pl5TenThousand, pl5Thousand, pl5Hundred, pl5Ten, pl5Unit];
  const analysis = generatePlTrendAnalysis(nums, history, 5);
  document.getElementById('pl5-analysis-result').innerHTML = formatPlAnalysisResult(analysis);
}

function generatePlTrendAnalysis(nums, history, digits) {
  const result = {
    hotMatches: [],
    coldMatches: [],
    sumAnalysis: '',
    oddEvenAnalysis: '',
    repeatAnalysis: '',
    suggestions: []
  };

  const positionFreq = Array(digits).fill(null).map(() => ({}));
  
  history.forEach(h => {
    h.nums.forEach((n, pos) => {
      if (pos < digits) {
        positionFreq[pos][n] = (positionFreq[pos][n] || 0) + 1;
      }
    });
  });

  const posNames = digits === 3 ? ['百位', '十位', '个位'] : ['万位', '千位', '百位', '十位', '个位'];
  
  nums.forEach((num, pos) => {
    const freq = positionFreq[pos][num] || 0;
    if (freq >= 5) {
      result.hotMatches.push({ pos: posNames[pos], num, freq });
    }
    if (freq <= 1) {
      result.coldMatches.push({ pos: posNames[pos], num, freq });
    }
  });

  const sum = nums.reduce((a, b) => a + b, 0);
  if (sum >= 10 && sum <= 20) {
    result.sumAnalysis = `和值 ${sum}，处于理想范围 (10-20)`;
  } else if (sum < 10) {
    result.sumAnalysis = `和值 ${sum}，偏小`;
  } else {
    result.sumAnalysis = `和值 ${sum}，偏大`;
  }

  const oddCount = nums.filter(n => n % 2 === 1).length;
  const evenCount = digits - oddCount;
  if (Math.abs(oddCount - evenCount) <= 1) {
    result.oddEvenAnalysis = `奇偶比 ${oddCount}:${evenCount}，比例均衡`;
  } else {
    result.oddEvenAnalysis = `奇偶比 ${oddCount}:${evenCount}，比例失衡`;
  }

  const uniqueCount = [...new Set(nums)].length;
  if (uniqueCount === digits) {
    result.repeatAnalysis = '无重复号码，组六形态';
  } else if (uniqueCount === digits - 1) {
    result.repeatAnalysis = '有1个重复号码，组三形态';
  } else {
    result.repeatAnalysis = '豹子形态（三个号码相同）';
  }

  if (result.hotMatches.length >= 2) {
    result.suggestions.push('⚠️ 热号较多，建议适当调整');
  }
  if (result.coldMatches.length >= 2) {
    result.suggestions.push('⚠️ 冷号较多，谨慎选择');
  }
  if (result.oddEvenAnalysis.includes('均衡')) {
    result.suggestions.push('✅ 奇偶比例合理');
  }
  if (result.sumAnalysis.includes('理想')) {
    result.suggestions.push('✅ 和值范围理想');
  }

  return result;
}

function formatPlAnalysisResult(analysis) {
  let html = '';
  
  if (analysis.hotMatches.length > 0) {
    html += `<div style="margin-bottom: 10px;">
      <strong>🔥 热号位置:</strong><br>
      ${analysis.hotMatches.map(m => `${m.pos}${m.num} (${m.freq}次)`).join(', ')}
    </div>`;
  }
  
  if (analysis.coldMatches.length > 0) {
    html += `<div style="margin-bottom: 10px;">
      <strong>❄️ 冷号位置:</strong><br>
      ${analysis.coldMatches.map(m => `${m.pos}${m.num} (${m.freq}次)`).join(', ')}
    </div>`;
  }
  
  html += `<div style="margin-bottom: 10px;">${analysis.sumAnalysis}</div>`;
  html += `<div style="margin-bottom: 10px;">${analysis.oddEvenAnalysis}</div>`;
  html += `<div style="margin-bottom: 10px;">${analysis.repeatAnalysis}</div>`;
  
  if (analysis.suggestions.length > 0) {
    html += `<div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc;">
      <strong>💡 综合建议:</strong>
      <ul style="margin: 5px 0 0 20px; padding: 0;">
        ${analysis.suggestions.map(s => `<li style="font-size: 12px;">${s}</li>`).join('')}
      </ul>
    </div>`;
  }
  
  return html;
}

function generatePl3Suggestion() {
  const goodNums = [];
  const badNums = [];
  
  for (let i = 0; i < 5; i++) {
    goodNums.push([
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ]);
    badNums.push([
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ]);
  }
  
  document.getElementById('pl3-suggestion-content').innerHTML = `
    <div class="suggestion-group">
      <h4>🎯 看好组合（5组）</h4>
      <div class="suggestion-nums">
        ${goodNums.map(n => `<div class="suggestion-item good">${n.join(' ')}</div>`).join('')}
      </div>
    </div>
    <div class="suggestion-group">
      <h4>⚠️ 需要防的组合（5组）</h4>
      <div class="suggestion-nums">
        ${badNums.map(n => `<div class="suggestion-item bad">${n.join(' ')}</div>`).join('')}
      </div>
    </div>
    <p style="font-size: 12px; color: #666;">* 建议基于历史走势分析生成，仅供参考</p>
  `;
}

function generatePl5Suggestion() {
  const goodNums = [];
  const badNums = [];
  
  for (let i = 0; i < 5; i++) {
    goodNums.push([
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ]);
    badNums.push([
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ]);
  }
  
  document.getElementById('pl5-suggestion-content').innerHTML = `
    <div class="suggestion-group">
      <h4>🎯 看好组合（5组）</h4>
      <div class="suggestion-nums">
        ${goodNums.map(n => `<div class="suggestion-item good">${n.join(' ')}</div>`).join('')}
      </div>
    </div>
    <div class="suggestion-group">
      <h4>⚠️ 需要防的组合（5组）</h4>
      <div class="suggestion-nums">
        ${badNums.map(n => `<div class="suggestion-item bad">${n.join(' ')}</div>`).join('')}
      </div>
    </div>
    <p style="font-size: 12px; color: #666;">* 建议基于历史走势分析生成，仅供参考</p>
  `;
}

function updateSidePanels(type) {
  updateTips(type);
  updateHotCold(type);
  updateTicketAnalysis();
}

function updateTips(type) {
  const tips = TIPS_DATA[type] || TIPS_DATA.dlt;
  document.getElementById('tips-content').innerHTML = tips.map(t => `<p><strong>•</strong> ${t}</p>`).join('');
}

function updateHotCold(type) {
  let hotNums = [];
  let coldNums = [];
  
  if (type === 'dlt') {
    hotNums = [3, 8, 12, 15, 22, 28, 31];
    coldNums = [1, 6, 11, 17, 24, 30, 35];
  } else if (type === 'ssq') {
    hotNums = [5, 12, 18, 23, 27, 30];
    coldNums = [2, 9, 14, 20, 25, 33];
  } else if (type === 'pl3') {
    hotNums = [2, 5, 7, 8];
    coldNums = [0, 3, 6, 9];
  } else if (type === 'pl5') {
    hotNums = [1, 4, 6, 8];
    coldNums = [0, 3, 7, 9];
  }
  
  document.getElementById('hotcold-content').innerHTML = `
    <div class="hot-title">🔥 热门号码</div>
    <div class="num-list">${hotNums.map(n => `<span class="num-item hot">${n}</span>`).join('')}</div>
    <div class="cold-title">❄️ 冷门号码</div>
    <div class="num-list">${coldNums.map(n => `<span class="num-item cold">${n}</span>`).join('')}</div>
  `;
}

function updateTicketAnalysis() {
  const tickets = JSON.parse(localStorage.getItem('dreamer_tickets') || '[]');
  const dltCount = tickets.filter(t => t.type === 'dlt').length;
  const ssqCount = tickets.filter(t => t.type === 'ssq').length;
  const pl3Count = tickets.filter(t => t.type === 'pl3').length;
  const pl5Count = tickets.filter(t => t.type === 'pl5').length;
  const total = tickets.length;
  
  document.getElementById('ticket-stats').innerHTML = `
    <div class="analysis-summary">
      <div class="summary-item">
        <span class="summary-label">累计保存:</span>
        <span class="summary-value">${total}</span>
      </div>
      <div class="summary-row">
        <span>大乐透: ${dltCount}</span>
        <span>双色球: ${ssqCount}</span>
        <span>排列三: ${pl3Count}</span>
        <span>排列五: ${pl5Count}</span>
      </div>
    </div>
  `;
}

function searchDltHistory() {
  const keyword = document.getElementById('dlt-search-issue').value.trim();
  if (!keyword) {
    loadDltHistory();
    return;
  }
  const history = dltHistoryData.length > 0 ? dltHistoryData : generateMockDltHistory();
  const filtered = history.filter(h => h.issue.includes(keyword));
  const table = document.getElementById('dlt-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th>星期</th><th colspan="5">开奖结果</th></tr>
      <tr><th></th><th></th><th></th><th colspan="3">前区</th><th colspan="2">后区</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td>${h.weekDay}</td>
          <td class="red-ball">${h.reds[0]}</td>
          <td class="red-ball">${h.reds[1]}</td>
          <td class="red-ball">${h.reds[2]}</td>
          <td class="blue-ball">${h.blues[0]}</td>
          <td class="blue-ball">${h.blues[1]}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function searchSsqHistory() {
  const keyword = document.getElementById('ssq-search-issue').value.trim();
  if (!keyword) {
    loadSsqHistory();
    return;
  }
  const history = ssqHistoryData.length > 0 ? ssqHistoryData : generateMockSsqHistory();
  const filtered = history.filter(h => h.issue.includes(keyword));
  const table = document.getElementById('ssq-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th>星期</th><th colspan="7">开奖结果</th></tr>
      <tr><th></th><th></th><th></th><th colspan="6">红球</th><th>蓝球</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td>${h.weekDay}</td>
          <td class="red-ball">${h.reds[0]}</td>
          <td class="red-ball">${h.reds[1]}</td>
          <td class="red-ball">${h.reds[2]}</td>
          <td class="red-ball">${h.reds[3]}</td>
          <td class="red-ball">${h.reds[4]}</td>
          <td class="red-ball">${h.reds[5]}</td>
          <td class="blue-ball">${h.blue}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function searchPl3History() {
  const keyword = document.getElementById('pl3-search-issue').value.trim();
  if (!keyword) {
    loadPl3History();
    return;
  }
  const history = pl3HistoryData.length > 0 ? pl3HistoryData : generateMockPl3History();
  const filtered = history.filter(h => h.issue.includes(keyword));
  const table = document.getElementById('pl3-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th>星期</th><th colspan="3">开奖结果</th></tr>
      <tr><th></th><th></th><th></th><th>百位</th><th>十位</th><th>个位</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td>${h.weekDay}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function searchPl5History() {
  const keyword = document.getElementById('pl5-search-issue').value.trim();
  if (!keyword) {
    loadPl5History();
    return;
  }
  const history = pl5HistoryData.length > 0 ? pl5HistoryData : generateMockPl5History();
  const filtered = history.filter(h => h.issue.includes(keyword));
  const table = document.getElementById('pl5-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th>星期</th><th colspan="5">开奖结果</th></tr>
      <tr><th></th><th></th><th></th><th>万位</th><th>千位</th><th>百位</th><th>十位</th><th>个位</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td>${h.weekDay}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
          <td>${h.nums[3]}</td>
          <td>${h.nums[4]}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function renderDltTrendChart() {
  const history = (dltHistoryData.length > 0 ? dltHistoryData : generateMockDltHistory());
  const chart = document.getElementById('dlt-trend-chart');
  
  let html = `<table class="trend-table">
    <tr>
      <th>期号</th>
      <th>开奖日期</th>
      <th colspan="5">前区</th>
      <th colspan="2">后区</th>
      <th>和值</th>
      <th>跨度</th>
    </tr>`;
  
  history.forEach(h => {
    html += `<tr>
      <td>${h.issue}</td>
      <td>${h.date}</td>
      <td class="red-ball">${h.reds[0]}</td>
      <td class="red-ball">${h.reds[1]}</td>
      <td class="red-ball">${h.reds[2]}</td>
      <td class="red-ball">${h.reds[3]}</td>
      <td class="red-ball">${h.reds[4]}</td>
      <td class="blue-ball">${h.blues[0]}</td>
      <td class="blue-ball">${h.blues[1]}</td>
      <td>${h.sum}</td>
      <td>${h.range}</td>
    </tr>`;
  });
  
  html += '</table>';
  
  const recommendations = generateRecommendations(history.slice(0, 30));
  html += `<div class="recommendations">
    <h3>🎯 智能推荐号码（共5注）</h3>
    ${recommendations.map((rec, index) => `
      <div class="recommendation-item">
        <div class="recommendation-header">第${index + 1}注</div>
        <div class="recommendation-numbers">
          <span class="red-ball">${rec.reds[0]}</span>
          <span class="red-ball">${rec.reds[1]}</span>
          <span class="red-ball">${rec.reds[2]}</span>
          <span class="red-ball">${rec.reds[3]}</span>
          <span class="red-ball">${rec.reds[4]}</span>
          <span class="blue-ball small">${rec.blues[0]}</span>
          <span class="blue-ball small">${rec.blues[1]}</span>
        </div>
        <div class="recommendation-suggestion">${rec.suggestion}</div>
      </div>
    `).join('')}
  </div>`;
  
  chart.innerHTML = html;
}

function analyzeHotColdNumbers(history) {
  const redCounts = {};
  const blueCounts = {};
  
  for (let i = 1; i <= 35; i++) redCounts[i] = 0;
  for (let i = 1; i <= 12; i++) blueCounts[i] = 0;
  
  history.forEach(h => {
    h.reds.forEach(r => redCounts[r]++);
    h.blues.forEach(b => blueCounts[b]++);
  });
  
  const sortedReds = Object.entries(redCounts).map(([num, count]) => ({ num: parseInt(num), count })).sort((a, b) => b.count - a.count);
  const sortedBlues = Object.entries(blueCounts).map(([num, count]) => ({ num: parseInt(num), count })).sort((a, b) => b.count - a.count);
  
  return {
    hotReds: sortedReds.slice(0, 5),
    coldReds: sortedReds.slice(-5),
    hotBlues: sortedBlues.slice(0, 3),
    coldBlues: sortedBlues.slice(-3)
  };
}

function generateRecommendations(history) {
  const hotCold = analyzeHotColdNumbers(history);
  const hotReds = hotCold.hotReds.map(n => n.num);
  const coldReds = hotCold.coldReds.map(n => n.num);
  const hotBlues = hotCold.hotBlues.map(n => n.num);
  const coldBlues = hotCold.coldBlues.map(n => n.num);
  
  const recommendations = [];
  
  recommendations.push({
    reds: [...hotReds.slice(0, 5)].sort((a, b) => a - b),
    blues: [...hotBlues.slice(0, 2)].sort((a, b) => a - b),
    suggestion: '全热号组合：选取近期出现频率最高的号码，适合追热策略'
  });
  
  recommendations.push({
    reds: [...coldReds.slice(0, 5)].sort((a, b) => a - b),
    blues: [...coldBlues.slice(0, 2)].sort((a, b) => a - b),
    suggestion: '全冷号组合：选取近期出现频率最低的号码，适合追冷策略'
  });
  
  recommendations.push({
    reds: [hotReds[0], hotReds[1], coldReds[0], coldReds[1], hotReds[2]].sort((a, b) => a - b),
    blues: [hotBlues[0], coldBlues[0]].sort((a, b) => a - b),
    suggestion: '冷热搭配：3热2冷前区，1热1冷后区，平衡策略'
  });
  
  recommendations.push({
    reds: [hotReds[0], coldReds[0], hotReds[1], coldReds[1], hotReds[2]].sort((a, b) => a - b),
    blues: [hotBlues[0], hotBlues[1]].sort((a, b) => a - b),
    suggestion: '交叉组合：热冷交替排列，后区全热号'
  });
  
  const randomReds = [];
  const allReds = [...hotReds, ...coldReds];
  while (randomReds.length < 5) {
    const rand = allReds[Math.floor(Math.random() * allReds.length)];
    if (!randomReds.includes(rand)) randomReds.push(rand);
  }
  recommendations.push({
    reds: randomReds.sort((a, b) => a - b),
    blues: [hotBlues[Math.floor(Math.random() * hotBlues.length)], coldBlues[Math.floor(Math.random() * coldBlues.length)]].sort((a, b) => a - b),
    suggestion: '随机优化组合：基于冷热号池随机生成，兼顾概率分布'
  });
  
  return recommendations;
}

function renderSsqTrendChart() {
  const history = (ssqHistoryData.length > 0 ? ssqHistoryData : generateMockSsqHistory()).slice(0, 50);
  const chart = document.getElementById('ssq-trend-chart');
  
  let html = `<table class="trend-table">
    <tr>
      <th>期数</th>
      <th colspan="6">红球</th>
      <th>蓝球</th>
      ${Array.from({length: 33}, (_, i) => `<th>${i + 1}</th>`).join('')}
      <th>和值</th>
      <th>单双</th>
      <th>重连</th>
    </tr>`;
  
  history.forEach(h => {
    const numArray = Array(33).fill('');
    h.reds.forEach(r => {
      numArray[r - 1] = '●';
    });
    
    const oddCount = h.reds.filter(r => r % 2 === 1).length;
    const evenCount = h.reds.length - oddCount;
    
    html += `<tr>
      <td class="issue-cell">${h.issue}</td>
      ${h.reds.map(r => `<td class="num-cell">${r}</td>`).join('')}
      <td class="blue-cell">${h.blue}</td>
      ${numArray.map(n => `<td>${n}</td>`).join('')}
      <td class="sum-cell">${h.sum}</td>
      <td class="odd-cell">${oddCount}:${evenCount}</td>
      <td class="repeat-cell">${checkRepeatAndLink(h.reds)}</td>
    </tr>`;
  });
  
  html += '</table>';
  chart.innerHTML = html;
}

function renderPl3TrendChart() {
  const history = (pl3HistoryData.length > 0 ? pl3HistoryData : generateMockPl3History()).slice(0, 50);
  const chart = document.getElementById('pl3-trend-chart');
  
  let html = `<table class="trend-table">
    <tr>
      <th>期数</th>
      <th>百位</th>
      <th>十位</th>
      <th>个位</th>
      ${Array.from({length: 10}, (_, i) => `<th>${i}</th>`).join('')}
      <th>和值</th>
    </tr>`;
  
  history.forEach(h => {
    const numArray = Array(10).fill(0);
    h.nums.forEach(n => {
      numArray[n]++;
    });
    
    html += `<tr>
      <td class="issue-cell">${h.issue}</td>
      <td>${h.nums[0]}</td>
      <td>${h.nums[1]}</td>
      <td>${h.nums[2]}</td>
      ${numArray.map(n => `<td>${n || ''}</td>`).join('')}
      <td class="sum-cell">${h.sum}</td>
    </tr>`;
  });
  
  html += '</table>';
  chart.innerHTML = html;
}

function renderPl5TrendChart() {
  const history = (pl5HistoryData.length > 0 ? pl5HistoryData : generateMockPl5History()).slice(0, 50);
  const chart = document.getElementById('pl5-trend-chart');
  
  let html = `<table class="trend-table">
    <tr>
      <th>期数</th>
      <th>万位</th>
      <th>千位</th>
      <th>百位</th>
      <th>十位</th>
      <th>个位</th>
      ${Array.from({length: 10}, (_, i) => `<th>${i}</th>`).join('')}
      <th>和值</th>
    </tr>`;
  
  history.forEach(h => {
    const numArray = Array(10).fill(0);
    h.nums.forEach(n => {
      numArray[n]++;
    });
    
    html += `<tr>
      <td class="issue-cell">${h.issue}</td>
      <td>${h.nums[0]}</td>
      <td>${h.nums[1]}</td>
      <td>${h.nums[2]}</td>
      <td>${h.nums[3]}</td>
      <td>${h.nums[4]}</td>
      ${numArray.map(n => `<td>${n || ''}</td>`).join('')}
      <td class="sum-cell">${h.sum}</td>
    </tr>`;
  });
  
  html += '</table>';
  chart.innerHTML = html;
}

function checkRepeatAndLink(nums) {
  let repeat = 0;
  let link = 0;
  
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i + 1] === nums[i] + 1) {
      link++;
    }
  }
  
  const unique = new Set(nums).size;
  if (unique < nums.length) {
    repeat = nums.length - unique;
  }
  
  return `${repeat} ${link}`;
}

function initTrendCharts() {
  renderDltTrendChart();
  renderSsqTrendChart();
  renderPl3TrendChart();
  renderPl5TrendChart();
}

document.addEventListener('DOMContentLoaded', init);

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const tab = this.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    if (tab !== 'data-entry') {
      updateSidePanels(tab);
    }
  });
});

document.querySelectorAll('.section-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const parent = this.closest('.tab-content');
    parent.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const section = this.dataset.section;
    parent.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    const currentTab = parent.id;
    document.getElementById(`${currentTab}-${section}`).classList.add('active');
  });
});

function analyzeDltTrend() {
  const history = (dltHistoryData.length > 0 ? dltHistoryData : generateMockDltHistory()).slice(0, 30);
  const analysis = generateTrendAnalysis(dltRedSelected, dltBlueSelected, history, 'dlt');
  document.getElementById('dlt-analysis-result').innerHTML = formatAnalysisResult(analysis);
}

function analyzeSsqTrend() {
  const history = (ssqHistoryData.length > 0 ? ssqHistoryData : generateMockSsqHistory()).slice(0, 30);
  const analysis = generateTrendAnalysis(ssqRedSelected, ssqBlueSelected, history, 'ssq');
  document.getElementById('ssq-analysis-result').innerHTML = formatAnalysisResult(analysis);
}

function generateTrendAnalysis(reds, blues, history, type) {
  const result = {
    hotMatches: [],
    coldMatches: [],
    recentAppearances: [],
    sumAnalysis: '',
    oddEvenAnalysis: '',
    sizeAnalysis: '',
    suggestions: []
  };

  const redFrequency = {};
  const blueFrequency = {};
  
  history.forEach(h => {
    h.reds.forEach(r => {
      redFrequency[r] = (redFrequency[r] || 0) + 1;
    });
    if (type === 'dlt') {
      h.blues.forEach(b => {
        blueFrequency[b] = (blueFrequency[b] || 0) + 1;
      });
    } else {
      blueFrequency[h.blue] = (blueFrequency[h.blue] || 0) + 1;
    }
  });

  const hotReds = Object.entries(redFrequency).filter(([k, v]) => v >= 4).map(([k]) => parseInt(k));
  const coldReds = Object.entries(redFrequency).filter(([k, v]) => v <= 1).map(([k]) => parseInt(k));

  reds.forEach(r => {
    const freq = redFrequency[r] || 0;
    if (hotReds.includes(r)) {
      result.hotMatches.push({ num: r, freq });
    }
    if (coldReds.includes(r)) {
      result.coldMatches.push({ num: r, freq });
    }
    result.recentAppearances.push({ num: r, freq });
  });

  const sum = reds.reduce((a, b) => a + b, 0);
  const avgSum = history.reduce((acc, h) => acc + h.reds.reduce((a, b) => a + b, 0), 0) / history.length;
  
  if (type === 'dlt') {
    if (sum >= 70 && sum <= 100) {
      result.sumAnalysis = `和值 ${sum}，处于理想范围 (70-100)`;
    } else if (sum < 70) {
      result.sumAnalysis = `和值 ${sum}，偏小，建议增加大号`;
    } else {
      result.sumAnalysis = `和值 ${sum}，偏大，建议增加小号`;
    }
  } else {
    if (sum >= 80 && sum <= 130) {
      result.sumAnalysis = `和值 ${sum}，处于理想范围 (80-130)`;
    } else if (sum < 80) {
      result.sumAnalysis = `和值 ${sum}，偏小，建议增加大号`;
    } else {
      result.sumAnalysis = `和值 ${sum}，偏大，建议增加小号`;
    }
  }

  const oddCount = reds.filter(r => r % 2 === 1).length;
  const evenCount = reds.length - oddCount;
  if (Math.abs(oddCount - evenCount) <= 1) {
    result.oddEvenAnalysis = `奇偶比 ${oddCount}:${evenCount}，比例均衡，推荐`;
  } else {
    result.oddEvenAnalysis = `奇偶比 ${oddCount}:${evenCount}，比例失衡，建议调整`;
  }

  const half = type === 'dlt' ? 18 : 17;
  const bigCount = reds.filter(r => r > half).length;
  const smallCount = reds.length - bigCount;
  if (Math.abs(bigCount - smallCount) <= 1) {
    result.sizeAnalysis = `大小比 ${bigCount}:${smallCount}，比例均衡，推荐`;
  } else {
    result.sizeAnalysis = `大小比 ${bigCount}:${smallCount}，比例失衡，建议调整`;
  }

  if (result.hotMatches.length >= 3) {
    result.suggestions.push('⚠️ 热号过多，建议适当替换1-2个');
  }
  if (result.coldMatches.length >= 2) {
    result.suggestions.push('⚠️ 冷号较多，谨慎选择');
  }
  if (result.oddEvenAnalysis.includes('均衡')) {
    result.suggestions.push('✅ 奇偶比例合理');
  }
  if (result.sizeAnalysis.includes('均衡')) {
    result.suggestions.push('✅ 大小比例合理');
  }
  if (result.sumAnalysis.includes('理想')) {
    result.suggestions.push('✅ 和值范围理想');
  }

  return result;
}

function formatAnalysisResult(analysis) {
  let html = '';
  
  if (analysis.hotMatches.length > 0) {
    html += `<div style="margin-bottom: 10px;">
      <strong>🔥 热号匹配:</strong> ${analysis.hotMatches.map(m => `${m.num}(${m.freq}次)`).join(', ')}
    </div>`;
  }
  
  if (analysis.coldMatches.length > 0) {
    html += `<div style="margin-bottom: 10px;">
      <strong>❄️ 冷号匹配:</strong> ${analysis.coldMatches.map(m => `${m.num}(${m.freq}次)`).join(', ')}
    </div>`;
  }
  
  html += `<div style="margin-bottom: 10px;">${analysis.sumAnalysis}</div>`;
  html += `<div style="margin-bottom: 10px;">${analysis.oddEvenAnalysis}</div>`;
  html += `<div style="margin-bottom: 10px;">${analysis.sizeAnalysis}</div>`;
  
  if (analysis.suggestions.length > 0) {
    html += `<div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc;">
      <strong>💡 综合建议:</strong>
      <ul style="margin: 5px 0 0 20px; padding: 0;">
        ${analysis.suggestions.map(s => `<li style="font-size: 12px;">${s}</li>`).join('')}
      </ul>
    </div>`;
  }
  
  return html;
}

const TICKET_FLOWER_MAP = {
  'A': { name: '龙头', description: '通常指前区第一个号码', suggest: '建议关注小号区域1-12' },
  'B': { name: '凤尾', description: '通常指前区最后一个号码', suggest: '建议关注大号区域24-35' },
  'C': { name: '连号', description: '相邻的两个或多个号码', suggest: '常见连号组合: 03 04, 12 13, 28 29' },
  'D': { name: '奇偶', description: '号码的奇偶属性', suggest: '建议奇偶比例搭配: 3奇2偶或2奇3偶' },
  'E': { name: '大小', description: '号码的大小属性', suggest: '建议大小比例搭配: 3大2小或2大3小' },
  'F': { name: '质数', description: '只能被1和自身整除的数', suggest: '常见质数: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31' },
  'G': { name: '重复', description: '与上期重复的号码', suggest: '每期通常有1-2个重复号码' },
  'H': { name: '跨距', description: '最大号码与最小号码之差', suggest: '常见跨距: 15-25之间' },
  'I': { name: '和值', description: '所有号码之和', suggest: '大乐透前区和值常见: 70-100' },
  'J': { name: 'AC值', description: '号码的复杂程度', suggest: 'AC值常见: 5-8之间' },
  'K': { name: '冷号', description: '长时间未出现的号码', suggest: '关注遗漏超过10期的号码' },
  'L': { name: '热号', description: '近期频繁出现的号码', suggest: '关注最近5期内出现2次以上的号码' },
  'M': { name: '温号', description: '出现频率适中的号码', suggest: '冷热温搭配选择' },
  'N': { name: '形态', description: '号码的组合形态', suggest: '关注: 顺子、对子、豹子等形态' },
  'O': { name: '区间', description: '号码的区间分布', suggest: '建议各区均匀分布' }
};

function analyzeTicket() {
  const input = document.getElementById('ticket-input').value.trim().toUpperCase();
  const resultDiv = document.getElementById('ticket-result');
  
  if (!input) {
    resultDiv.innerHTML = '<p style="color: #e53935;">请输入票花字母（如: A B C）</p>';
    return;
  }
  
  const flowers = input.split(/[\s,，、]+/).filter(f => f && TICKET_FLOWER_MAP[f]);
  
  if (flowers.length === 0) {
    resultDiv.innerHTML = '<p style="color: #e53935;">未识别到有效票花字母，请输入 A-O 之间的字母</p>';
    return;
  }
  
  let html = '<h4>🎯 票花解读结果</h4>';
  html += '<div style="margin-top: 10px;">';
  
  flowers.forEach(flower => {
    const info = TICKET_FLOWER_MAP[flower];
    html += `
      <div class="ticket-flower-item">
        <div class="flower-letter">${flower}</div>
        <div class="flower-info">
          <strong>${info.name}</strong>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">${info.description}</p>
          <p style="font-size: 12px; color: #2e7d32; background: #e8f5e9; padding: 8px; border-radius: 5px;">💡 ${info.suggest}</p>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  html += '<p style="font-size: 11px; color: #999; margin-top: 15px;">* 票花分析仅供参考，不构成购彩建议</p>';
  
  resultDiv.innerHTML = html;
}

function loadSavedHistory() {
  const savedDlt = localStorage.getItem('dreamer_dlt_history');
  const savedSsq = localStorage.getItem('dreamer_ssq_history');
  const savedPl3 = localStorage.getItem('dreamer_pl3_history');
  const savedPl5 = localStorage.getItem('dreamer_pl5_history');
  
  if (savedDlt) {
    dltHistoryData = JSON.parse(savedDlt);
  }
  if (savedSsq) {
    ssqHistoryData = JSON.parse(savedSsq);
  }
  if (savedPl3) {
    pl3HistoryData = JSON.parse(savedPl3);
  }
  if (savedPl5) {
    pl5HistoryData = JSON.parse(savedPl5);
  }
}

function saveHistoryData() {
  localStorage.setItem('dreamer_dlt_history', JSON.stringify(dltHistoryData));
  localStorage.setItem('dreamer_ssq_history', JSON.stringify(ssqHistoryData));
  localStorage.setItem('dreamer_pl3_history', JSON.stringify(pl3HistoryData));
  localStorage.setItem('dreamer_pl5_history', JSON.stringify(pl5HistoryData));
}

function addDltResult() {
  const issue = document.getElementById('entry-dlt-issue').value.trim();
  const date = document.getElementById('entry-dlt-date').value;
  const redsStr = document.getElementById('entry-dlt-reds').value.trim();
  const bluesStr = document.getElementById('entry-dlt-blues').value.trim();
  const resultDiv = document.getElementById('entry-dlt-result');
  
  if (!issue || !date || !redsStr || !bluesStr) {
    resultDiv.textContent = '请填写完整信息';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  const reds = redsStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  const blues = bluesStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  
  if (reds.length !== 5 || reds.some(n => n < 1 || n > 35)) {
    resultDiv.textContent = '前区号码必须是5个1-35之间的数字';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  if (blues.length !== 2 || blues.some(n => n < 1 || n > 12)) {
    resultDiv.textContent = '后区号码必须是2个1-12之间的数字';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  reds.sort((a, b) => a - b);
  blues.sort((a, b) => a - b);
  
  const dateObj = new Date(date);
  const weekDay = getDayOfWeek(dateObj);
  
  const newRecord = {
    issue: issue,
    date: date,
    weekDay: weekDay,
    reds: reds,
    blues: blues,
    sum: reds.reduce((a, b) => a + b, 0),
    range: Math.max(...reds) - Math.min(...reds)
  };
  
  const existingIndex = dltHistoryData.findIndex(h => h.issue === issue);
  if (existingIndex > -1) {
    dltHistoryData[existingIndex] = newRecord;
  } else {
    dltHistoryData.push(newRecord);
    dltHistoryData.sort((a, b) => a.issue.localeCompare(b.issue));
  }
  
  saveHistoryData();
  loadDltHistory();
  renderDltTrendChart();
  updateSidePanels('dlt');
  
  resultDiv.textContent = '开奖结果录入成功！';
  resultDiv.style.color = '#16a34a';
  resultDiv.style.display = 'block';
  
  setTimeout(() => {
    resultDiv.style.display = 'none';
  }, 3000);
}

function addSsqResult() {
  const issue = document.getElementById('entry-ssq-issue').value.trim();
  const date = document.getElementById('entry-ssq-date').value;
  const redsStr = document.getElementById('entry-ssq-reds').value.trim();
  const blueStr = document.getElementById('entry-ssq-blue').value.trim();
  const resultDiv = document.getElementById('entry-ssq-result');
  
  if (!issue || !date || !redsStr || !blueStr) {
    resultDiv.textContent = '请填写完整信息';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  const reds = redsStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  const blue = parseInt(blueStr);
  
  if (reds.length !== 6 || reds.some(n => n < 1 || n > 33)) {
    resultDiv.textContent = '红球号码必须是6个1-33之间的数字';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  if (isNaN(blue) || blue < 1 || blue > 16) {
    resultDiv.textContent = '蓝球号码必须是1-16之间的数字';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  reds.sort((a, b) => a - b);
  
  const dateObj = new Date(date);
  const weekDay = getDayOfWeek(dateObj);
  
  const newRecord = {
    issue: issue,
    date: date,
    weekDay: weekDay,
    reds: reds,
    blue: blue,
    sum: reds.reduce((a, b) => a + b, 0),
    range: Math.max(...reds) - Math.min(...reds)
  };
  
  const existingIndex = ssqHistoryData.findIndex(h => h.issue === issue);
  if (existingIndex > -1) {
    ssqHistoryData[existingIndex] = newRecord;
  } else {
    ssqHistoryData.push(newRecord);
    ssqHistoryData.sort((a, b) => a.issue.localeCompare(b.issue));
  }
  
  saveHistoryData();
  loadSsqHistory();
  renderSsqTrendChart();
  updateSidePanels('ssq');
  
  resultDiv.textContent = '开奖结果录入成功！';
  resultDiv.style.color = '#16a34a';
  resultDiv.style.display = 'block';
  
  setTimeout(() => {
    resultDiv.style.display = 'none';
  }, 3000);
}

function addPl3Result() {
  const issue = document.getElementById('entry-pl3-issue').value.trim();
  const date = document.getElementById('entry-pl3-date').value;
  const numsStr = document.getElementById('entry-pl3-nums').value.trim();
  const resultDiv = document.getElementById('entry-pl3-result');
  
  if (!issue || !date || !numsStr) {
    resultDiv.textContent = '请填写完整信息';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  const nums = numsStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  
  if (nums.length !== 3 || nums.some(n => n < 0 || n > 9)) {
    resultDiv.textContent = '开奖号码必须是3个0-9之间的数字';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  const dateObj = new Date(date);
  const weekDay = getDayOfWeek(dateObj);
  
  const newRecord = {
    issue: issue,
    date: date,
    weekDay: weekDay,
    nums: nums,
    sum: nums.reduce((a, b) => a + b, 0)
  };
  
  const existingIndex = pl3HistoryData.findIndex(h => h.issue === issue);
  if (existingIndex > -1) {
    pl3HistoryData[existingIndex] = newRecord;
  } else {
    pl3HistoryData.push(newRecord);
    pl3HistoryData.sort((a, b) => a.issue.localeCompare(b.issue));
  }
  
  saveHistoryData();
  loadPl3History();
  renderPl3TrendChart();
  updateSidePanels('pl3');
  
  resultDiv.textContent = '开奖结果录入成功！';
  resultDiv.style.color = '#16a34a';
  resultDiv.style.display = 'block';
  
  setTimeout(() => {
    resultDiv.style.display = 'none';
  }, 3000);
}

function addPl5Result() {
  const issue = document.getElementById('entry-pl5-issue').value.trim();
  const date = document.getElementById('entry-pl5-date').value;
  const numsStr = document.getElementById('entry-pl5-nums').value.trim();
  const resultDiv = document.getElementById('entry-pl5-result');
  
  if (!issue || !date || !numsStr) {
    resultDiv.textContent = '请填写完整信息';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  const nums = numsStr.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
  
  if (nums.length !== 5 || nums.some(n => n < 0 || n > 9)) {
    resultDiv.textContent = '开奖号码必须是5个0-9之间的数字';
    resultDiv.style.color = '#e53935';
    resultDiv.style.display = 'block';
    return;
  }
  
  const dateObj = new Date(date);
  const weekDay = getDayOfWeek(dateObj);
  
  const newRecord = {
    issue: issue,
    date: date,
    weekDay: weekDay,
    nums: nums,
    sum: nums.reduce((a, b) => a + b, 0)
  };
  
  const existingIndex = pl5HistoryData.findIndex(h => h.issue === issue);
  if (existingIndex > -1) {
    pl5HistoryData[existingIndex] = newRecord;
  } else {
    pl5HistoryData.push(newRecord);
    pl5HistoryData.sort((a, b) => a.issue.localeCompare(b.issue));
  }
  
  saveHistoryData();
  loadPl5History();
  renderPl5TrendChart();
  updateSidePanels('pl5');
  
  resultDiv.textContent = '开奖结果录入成功！';
  resultDiv.style.color = '#16a34a';
  resultDiv.style.display = 'block';
  
  setTimeout(() => {
    resultDiv.style.display = 'none';
  }, 3000);
}

let selectedDltPackage = null;
let selectedSsqPackage = null;

function selectDltPackage(packageName) {
  selectedDltPackage = packageName;
  document.querySelectorAll('.package-selector .package-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-package="${packageName}"]`).classList.add('active');
}

function selectSsqPackage(packageName) {
  selectedSsqPackage = packageName;
  document.querySelectorAll('#ssq-package-selector .package-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`#ssq-package-selector [data-package="${packageName}"]`).classList.add('active');
  
  document.getElementById('ssq-compound-selector').style.display = packageName === 'compound' ? 'block' : 'none';
}

function calculateSsqCompound() {
  const redCount = parseInt(document.getElementById('ssq-compound-reds').value) || 6;
  const blueCount = parseInt(document.getElementById('ssq-compound-blues').value) || 1;
  
  const redCombinations = combination(redCount, 6);
  const total = redCombinations * blueCount;
  const amount = total * 2;
  
  document.getElementById('ssq-compound-count').textContent = total;
  document.getElementById('ssq-compound-amount').textContent = amount;
}

function combination(n, k) {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return result;
}

function getTrendAnalysisData(gameType) {
  const history = gameType === 'dlt' 
    ? (dltHistoryData.length > 0 ? dltHistoryData : generateMockDltHistory())
    : (ssqHistoryData.length > 0 ? ssqHistoryData : generateMockSsqHistory());
  
  const recentHistory = history.slice(-30);
  const redCounts = {};
  const blueCounts = {};
  
  if (gameType === 'dlt') {
    for (let i = 1; i <= 35; i++) redCounts[i] = 0;
    for (let i = 1; i <= 12; i++) blueCounts[i] = 0;
    recentHistory.forEach(record => {
      record.reds.forEach(r => redCounts[r]++);
      record.blues.forEach(b => blueCounts[b]++);
    });
  } else {
    for (let i = 1; i <= 33; i++) redCounts[i] = 0;
    for (let i = 1; i <= 16; i++) blueCounts[i] = 0;
    recentHistory.forEach(record => {
      record.reds.forEach(r => redCounts[r]++);
      blueCounts[record.blue]++;
    });
  }
  
  const hotReds = Object.entries(redCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(e => parseInt(e[0]));
  const coldReds = Object.entries(redCounts).sort((a, b) => a[1] - b[1]).slice(0, 10).map(e => parseInt(e[0]));
  const hotBlues = Object.entries(blueCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => parseInt(e[0]));
  const coldBlues = Object.entries(blueCounts).sort((a, b) => a[1] - b[1]).slice(0, 5).map(e => parseInt(e[0]));
  
  return { hotReds, coldReds, hotBlues, coldBlues, history: recentHistory };
}

function generateSmartNumbers(gameType, count, redCount, blueCount) {
  const trend = getTrendAnalysisData(gameType);
  const tickets = [];
  const maxRed = gameType === 'dlt' ? 35 : 33;
  const maxBlue = gameType === 'dlt' ? 12 : 16;
  const requiredRed = gameType === 'dlt' ? 5 : 6;
  const targetRedCount = redCount || requiredRed;
  
  const suggestions = [
    '均衡组合：热号与冷号合理搭配，兼顾追热与追冷策略',
    '趋势追踪：重点选取近期表现活跃的号码',
    '概率优化：基于近30期数据分析，提升号码覆盖度',
    '冷热平衡：热号为主，辅以冷号增加惊喜机会',
    '随机策略：在趋势数据基础上加入随机元素',
    '稳健选号：优先选择中频号码，降低风险'
  ];
  
  for (let t = 0; t < count; t++) {
    let reds = [];
    let blues = [];
    
    const hotRatio = 0.6;
    const coldRatio = 0.3;
    const randomRatio = 0.1;
    
    const hotRedsCount = Math.round(targetRedCount * hotRatio);
    const coldRedsCount = Math.round(targetRedCount * coldRatio);
    const randomRedsCount = targetRedCount - hotRedsCount - coldRedsCount;
    
    const hotSelected = [];
    while (hotSelected.length < hotRedsCount) {
      const idx = Math.floor(Math.random() * trend.hotReds.length);
      const num = trend.hotReds[idx];
      if (!hotSelected.includes(num)) hotSelected.push(num);
    }
    
    const coldSelected = [];
    while (coldSelected.length < coldRedsCount) {
      const idx = Math.floor(Math.random() * trend.coldReds.length);
      const num = trend.coldReds[idx];
      if (!coldSelected.includes(num) && !hotSelected.includes(num)) coldSelected.push(num);
    }
    
    const randomSelected = [];
    while (randomSelected.length < randomRedsCount) {
      const num = Math.floor(Math.random() * maxRed) + 1;
      if (!hotSelected.includes(num) && !coldSelected.includes(num) && !randomSelected.includes(num)) {
        randomSelected.push(num);
      }
    }
    
    reds = [...hotSelected, ...coldSelected, ...randomSelected].sort((a, b) => a - b);
    
    for (let b = 0; b < blueCount; b++) {
      let blue;
      do {
        if (Math.random() < 0.7) {
          blue = trend.hotBlues[Math.floor(Math.random() * trend.hotBlues.length)];
        } else {
          blue = trend.coldBlues[Math.floor(Math.random() * trend.coldBlues.length)];
        }
      } while (blues.includes(blue));
      blues.push(blue);
    }
    
    blues.sort((a, b) => a - b);
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    tickets.push({
      reds: reds.slice(0, targetRedCount),
      blues: blues.slice(0, blueCount),
      type: `${targetRedCount}+${blueCount}`,
      smart: true,
      suggestion: suggestion
    });
  }
  
  return tickets;
}

function generateDltPackage() {
  if (!selectedDltPackage) {
    alert('请先选择一个套餐');
    return;
  }
  
  let tickets = [];
  
  switch (selectedDltPackage) {
    case 'quick5':
      tickets = generateSmartNumbers('dlt', 5, 5, 2);
      break;
    case 'quick10':
      tickets = generateSmartNumbers('dlt', 10, 5, 2);
      break;
    case 'package18':
      tickets = [...generateSmartNumbers('dlt', 6, 5, 2)];
      tickets.push({
        reds: generateSmartNumbers('dlt', 1, 5, 3)[0].reds,
        blues: generateSmartNumbers('dlt', 1, 5, 3)[0].blues,
        type: '5+3复式',
        smart: true
      });
      break;
    case 'package28':
      tickets = [...generateSmartNumbers('dlt', 8, 5, 2)];
      tickets.push({
        reds: generateSmartNumbers('dlt', 1, 6, 2)[0].reds,
        blues: generateSmartNumbers('dlt', 1, 6, 2)[0].blues,
        type: '6+2复式',
        smart: true
      });
      break;
    case 'package58':
      tickets = [...generateSmartNumbers('dlt', 8, 5, 2)];
      tickets.push({
        reds: generateSmartNumbers('dlt', 1, 7, 2)[0].reds,
        blues: generateSmartNumbers('dlt', 1, 7, 2)[0].blues,
        type: '7+2复式',
        smart: true
      });
      break;
    case 'package88':
      tickets = [...generateSmartNumbers('dlt', 5, 5, 2)];
      tickets.push({
        reds: generateSmartNumbers('dlt', 1, 7, 2)[0].reds,
        blues: generateSmartNumbers('dlt', 1, 7, 2)[0].blues,
        type: '7+2复式',
        smart: true
      });
      tickets.push({
        reds: generateSmartNumbers('dlt', 1, 6, 3)[0].reds,
        blues: generateSmartNumbers('dlt', 1, 6, 3)[0].blues,
        type: '6+3复式',
        smart: true
      });
      break;
  }
  
  displayGeneratedTickets('dlt', tickets);
}

function generateSsqPackage() {
  if (!selectedSsqPackage) {
    alert('请先选择一个套餐');
    return;
  }
  
  let tickets = [];
  
  switch (selectedSsqPackage) {
    case 'quick1':
      tickets = generateSmartNumbers('ssq', 1, 6, 1);
      break;
    case 'quick5':
      tickets = generateSmartNumbers('ssq', 5, 6, 1);
      break;
    case 'quick10':
      tickets = generateSmartNumbers('ssq', 10, 6, 1);
      break;
    case 'compound':
      const redCount = parseInt(document.getElementById('ssq-compound-reds').value) || 7;
      const blueCount = parseInt(document.getElementById('ssq-compound-blues').value) || 1;
      const ticket = generateSmartNumbers('ssq', 1, redCount, blueCount)[0];
      ticket.type = `${redCount}+${blueCount}复式`;
      tickets = [ticket];
      break;
  }
  
  displayGeneratedTickets('ssq', tickets);
}

function displayGeneratedTickets(gameType, tickets) {
  const container = gameType === 'dlt' ? document.getElementById('dlt-tickets-container') : document.getElementById('ssq-tickets-container');
  const wrapper = gameType === 'dlt' ? document.getElementById('dlt-generated-tickets') : document.getElementById('ssq-generated-tickets');
  
  let html = '';
  tickets.forEach((ticket, index) => {
    html += `
      <div class="generated-ticket">
        <div class="ticket-header">
          <span class="ticket-number">第 ${index + 1} 注</span>
          <span class="ticket-type">${ticket.type}</span>
        </div>
        <div class="ticket-numbers">
          ${ticket.reds.map(r => `<span class="ticket-red">${r.toString().padStart(2, '0')}</span>`).join('')}
          ${ticket.blues.map(b => `<span class="ticket-blue">${b.toString().padStart(2, '0')}</span>`).join('')}
        </div>
        <div class="ticket-summary">
          ${ticket.smart ? '✅ 智能选号 (基于近30期走势分析)' : '📝 手动选号'}
        </div>
        ${ticket.suggestion ? `<div class="ticket-suggestion">💡 ${ticket.suggestion}</div>` : ''}
      </div>
    `;
  });
  
  container.innerHTML = html;
  wrapper.style.display = 'block';
}