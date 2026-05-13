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
}

function updateDltBlueDisplay() {
  const buttons = document.querySelectorAll('#dlt-blue-grid button');
  buttons.forEach(btn => {
    const num = parseInt(btn.textContent);
    btn.classList.toggle('selected', dltBlueSelected.includes(num));
  });
  document.getElementById('dlt-blue-selected').textContent = dltBlueSelected.join(' ');
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
}

function updateSsqBlueDisplay() {
  const buttons = document.querySelectorAll('#ssq-blue-grid button');
  buttons.forEach(btn => {
    const num = parseInt(btn.textContent);
    btn.classList.toggle('selected', ssqBlueSelected.includes(num));
  });
  document.getElementById('ssq-blue-selected').textContent = ssqBlueSelected.join(' ');
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
      <tr><th>期号</th><th>前区</th><th>后区</th><th>和值</th><th>跨度</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.reds.join(' ')}</td>
          <td>${h.blues.join(' ')}</td>
          <td>${h.sum}</td>
          <td>${h.range}</td>
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
      <tr><th>期号</th><th>红球</th><th>蓝球</th><th>和值</th><th>跨度</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.reds.join(' ')}</td>
          <td>${h.blue}</td>
          <td>${h.sum}</td>
          <td>${h.range}</td>
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
      <tr><th>期号</th><th>百位</th><th>十位</th><th>个位</th><th>和值</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
          <td>${h.sum}</td>
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
      <tr><th>期号</th><th>万位</th><th>千位</th><th>百位</th><th>十位</th><th>个位</th><th>和值</th></tr>
      ${history.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
          <td>${h.nums[3]}</td>
          <td>${h.nums[4]}</td>
          <td>${h.sum}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function generateMockDltHistory() {
  const history = [];
  for (let i = 150; i >= 130; i--) {
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
      issue: `2024${i.toString().padStart(3, '0')}`,
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
  for (let i = 150; i >= 130; i--) {
    const reds = [];
    while (reds.length < 6) {
      const num = Math.floor(Math.random() * 33) + 1;
      if (!reds.includes(num)) reds.push(num);
    }
    reds.sort((a, b) => a - b);
    const blue = Math.floor(Math.random() * 16) + 1;
    history.push({
      issue: `2024${i.toString().padStart(3, '0')}`,
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
  for (let i = 150; i >= 130; i--) {
    const nums = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];
    history.push({
      issue: `2024${i.toString().padStart(3, '0')}`,
      nums,
      sum: nums.reduce((a, b) => a + b, 0)
    });
  }
  return history;
}

function generateMockPl5History() {
  const history = [];
  for (let i = 150; i >= 130; i--) {
    const nums = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10)
    ];
    history.push({
      issue: `2024${i.toString().padStart(3, '0')}`,
      nums,
      sum: nums.reduce((a, b) => a + b, 0)
    });
  }
  return history;
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
  }
  document.getElementById('ssq-calc-result').textContent = result;
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
  
  document.getElementById('ticket-analysis-content').innerHTML = `
    <div class="analysis-item">
      <span class="analysis-label">累计保存:</span>
      <span class="analysis-value">${total} 注</span>
    </div>
    <div class="analysis-item">
      <span class="analysis-label">大乐透:</span>
      <span class="analysis-value">${dltCount} 注</span>
    </div>
    <div class="analysis-item">
      <span class="analysis-label">双色球:</span>
      <span class="analysis-value">${ssqCount} 注</span>
    </div>
    <div class="analysis-item">
      <span class="analysis-label">排列三:</span>
      <span class="analysis-value">${pl3Count} 注</span>
    </div>
    <div class="analysis-item">
      <span class="analysis-label">排列五:</span>
      <span class="analysis-value">${pl5Count} 注</span>
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
      <tr><th>期号</th><th>前区</th><th>后区</th><th>和值</th><th>跨度</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.reds.join(' ')}</td>
          <td>${h.blues.join(' ')}</td>
          <td>${h.sum}</td>
          <td>${h.range}</td>
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
      <tr><th>期号</th><th>红球</th><th>蓝球</th><th>和值</th><th>跨度</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.reds.join(' ')}</td>
          <td>${h.blue}</td>
          <td>${h.sum}</td>
          <td>${h.range}</td>
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
      <tr><th>期号</th><th>百位</th><th>十位</th><th>个位</th><th>和值</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
          <td>${h.sum}</td>
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
      <tr><th>期号</th><th>万位</th><th>千位</th><th>百位</th><th>十位</th><th>个位</th><th>和值</th></tr>
      ${filtered.map(h => `
        <tr>
          <td>${h.issue}</td>
          <td>${h.nums[0]}</td>
          <td>${h.nums[1]}</td>
          <td>${h.nums[2]}</td>
          <td>${h.nums[3]}</td>
          <td>${h.nums[4]}</td>
          <td>${h.sum}</td>
        </tr>
      `).join('')}
    </table>
  `;
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