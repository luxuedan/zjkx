const ALLOWED_USERS = [
  { username: 'root', password: 'zhuqi', nickname: '管理员', role: 'admin' }
];

let currentUser = null;
let dltRedSelected = [];
let dltBlueSelected = [];
let ssqRedSelected = [];
let ssqBlueSelected = [];
let pl3Hundred = null;
let pl3Ten = null;
let pl3Unit = null;
let pl5TenThousand = null;
let pl5Thousand = null;
let pl5Hundred = null;
let pl5Ten = null;
let pl5Unit = null;

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
  loadHistoryData();
  initTrendCharts();
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

function loadDltHistory() {
  const history = generateMockDltHistory();
  const table = document.getElementById('dlt-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="5">开奖结果</th></tr>
      <tr><th></th><th></th><th colspan="3">前区</th><th colspan="2">后区</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
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

function loadSsqHistory() {
  const history = generateMockSsqHistory();
  const table = document.getElementById('ssq-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="7">开奖结果</th></tr>
      <tr><th></th><th></th><th colspan="6">红球</th><th>蓝球</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
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

function loadPl3History() {
  const history = generateMockPl3History();
  const table = document.getElementById('pl3-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="3">开奖结果</th></tr>
      <tr><th></th><th></th><th>百位</th><th>十位</th><th>个位</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function loadPl5History() {
  const history = generateMockPl5History();
  const table = document.getElementById('pl5-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="5">开奖结果</th></tr>
      <tr><th></th><th></th><th>万位</th><th>千位</th><th>百位</th><th>十位</th><th>个位</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
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

function generateMockDltHistory() {
  const history = [];
  const baseDate = new Date('2026-05-13');
  for (let i = 0; i < 150; i++) {
    const daysToSubtract = i * 2 + (i % 3 === 0 ? 1 : 0);
    const date = new Date(baseDate);
    date.setDate(date.getDate() - daysToSubtract);
    const dateStr = formatDate(date);
    
    const reds = [];
    while (reds.length < 5) {
      const num = Math.floor(Math.random() * 35) + 1;
      if (!reds.includes(num)) reds.push(num);
    }
    reds.sort((a, b) => a - b);
    const blues = [];
    while (blues.length < 2) {
      const num = Math.floor(Math.random() * 12) + 1;
      if (!blues.includes(num)) blues.push(num);
    }
    blues.sort((a, b) => a - b);
    history.push({
      issue: `2026${(150 - i).toString().padStart(3, '0')}`,
      date: dateStr,
      reds,
      blues,
      sum: reds.reduce((a, b) => a + b, 0),
      range: Math.max(...reds) - Math.min(...reds)
    });
  }
  return history;
}

function generateMockSsqHistory() {
  const history = [];
  const baseDate = new Date('2026-05-13');
  for (let i = 0; i < 150; i++) {
    const daysToSubtract = i * 2;
    const date = new Date(baseDate);
    date.setDate(date.getDate() - daysToSubtract);
    const dateStr = formatDate(date);
    
    const reds = [];
    while (reds.length < 6) {
      const num = Math.floor(Math.random() * 33) + 1;
      if (!reds.includes(num)) reds.push(num);
    }
    reds.sort((a, b) => a - b);
    const blue = Math.floor(Math.random() * 16) + 1;
    history.push({
      issue: `2026${(150 - i).toString().padStart(3, '0')}`,
      date: dateStr,
      reds,
      blue,
      sum: reds.reduce((a, b) => a + b, 0),
      range: Math.max(...reds) - Math.min(...reds)
    });
  }
  return history;
}

function generateMockPl3History() {
  const history = [];
  const baseDate = new Date('2026-05-13');
  for (let i = 0; i < 300; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    
    const nums = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];
    history.push({
      issue: `2026${(300 - i).toString().padStart(3, '0')}`,
      date: dateStr,
      nums,
      sum: nums.reduce((a, b) => a + b, 0)
    });
  }
  return history;
}

function generateMockPl5History() {
  const history = [];
  const baseDate = new Date('2026-05-13');
  for (let i = 0; i < 300; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);
    
    const nums = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];
    history.push({
      issue: `2026${(300 - i).toString().padStart(3, '0')}`,
      date: dateStr,
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

function calculateDlt(op) {
  if (dltRedSelected.length === 0) {
    document.getElementById('dlt-calc-result').textContent = '请先选择号码';
    return;
  }
  
  let result;
  switch(op) {
    case 'sum':
      result = dltRedSelected.reduce((a, b) => a + b, 0);
      break;
    case 'avg':
      result = (dltRedSelected.reduce((a, b) => a + b, 0) / dltRedSelected.length).toFixed(1);
      break;
    case 'max':
      result = Math.max(...dltRedSelected);
      break;
    case 'min':
      result = Math.min(...dltRedSelected);
      break;
    case 'range':
      result = Math.max(...dltRedSelected) - Math.min(...dltRedSelected);
      break;
    case 'multiply':
      result = dltRedSelected.reduce((a, b) => a * b, 1);
      break;
    case 'oddEven':
      const dltOdd = dltRedSelected.filter(n => n % 2 === 1).length;
      const dltEven = dltRedSelected.length - dltOdd;
      result = `${dltOdd}:${dltEven}`;
      break;
    case 'size':
      const dltBig = dltRedSelected.filter(n => n > 18).length;
      const dltSmall = dltRedSelected.length - dltBig;
      result = `${dltBig}:${dltSmall}`;
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
  const history = generateMockDltHistory();
  const filtered = history.filter(h => h.issue.includes(keyword));
  const table = document.getElementById('dlt-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="5">开奖结果</th></tr>
      <tr><th></th><th></th><th colspan="3">前区</th><th colspan="2">后区</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
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
  const history = generateMockSsqHistory();
  const filtered = history.filter(h => h.issue.includes(keyword));
  const table = document.getElementById('ssq-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="7">开奖结果</th></tr>
      <tr><th></th><th></th><th colspan="6">红球</th><th>蓝球</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
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
  const history = generateMockPl3History();
  const filtered = history.filter(h => h.issue.includes(keyword));
  const table = document.getElementById('pl3-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="3">开奖结果</th></tr>
      <tr><th></th><th></th><th>百位</th><th>十位</th><th>个位</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
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
  const history = generateMockPl5History();
  const filtered = history.filter(h => h.issue.includes(keyword));
  const table = document.getElementById('pl5-history-list');
  table.innerHTML = `
    <table>
      <tr><th>期号</th><th>开奖日期</th><th colspan="5">开奖结果</th></tr>
      <tr><th></th><th></th><th>万位</th><th>千位</th><th>百位</th><th>十位</th><th>个位</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.date}</td>
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
  const history = generateMockDltHistory().slice(0, 50);
  const chart = document.getElementById('dlt-trend-chart');
  
  let html = `<table class="trend-table">
    <tr>
      <th>期数</th>
      <th colspan="5">开奖号码</th>
      ${Array.from({length: 35}, (_, i) => `<th>${i + 1}</th>`).join('')}
      <th>和值</th>
      <th>单双</th>
      <th>重连</th>
    </tr>`;
  
  history.forEach(h => {
    const numArray = Array(35).fill('');
    h.reds.forEach(r => {
      numArray[r - 1] = '●';
    });
    
    const oddCount = h.reds.filter(r => r % 2 === 1).length;
    const evenCount = h.reds.length - oddCount;
    
    html += `<tr>
      <td class="issue-cell">${h.issue}</td>
      ${h.reds.map(r => `<td class="num-cell">${r}</td>`).join('')}
      ${numArray.map(n => `<td>${n}</td>`).join('')}
      <td class="sum-cell">${h.sum}</td>
      <td class="odd-cell">${oddCount}:${evenCount}</td>
      <td class="repeat-cell">${checkRepeatAndLink(h.reds)}</td>
    </tr>`;
  });
  
  html += '</table>';
  chart.innerHTML = html;
}

function renderSsqTrendChart() {
  const history = generateMockSsqHistory().slice(0, 50);
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
  const history = generateMockPl3History().slice(0, 50);
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
  const history = generateMockPl5History().slice(0, 50);
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
    updateSidePanels(tab);
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
  const history = generateMockDltHistory().slice(0, 30);
  const analysis = generateTrendAnalysis(dltRedSelected, dltBlueSelected, history, 'dlt');
  document.getElementById('dlt-analysis-result').innerHTML = formatAnalysisResult(analysis);
}

function analyzeSsqTrend() {
  const history = generateMockSsqHistory().slice(0, 30);
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