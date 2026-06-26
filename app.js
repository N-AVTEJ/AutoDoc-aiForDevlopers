// ── Config ──
const HISTORY_KEY = 'autodoc_history';
const PROVIDER_KEY = 'autodoc_provider';
const APIKEY_PREFIX = 'autodoc_apikey_';

const MODELS = {
  anthropic: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  gemini: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash']
};

// ── Provider Details ──
const PROVIDERS = {
  anthropic: {
    name: 'Anthropic Claude',
    placeholder: 'sk-ant-api03-...',
    hintUrl: 'https://console.anthropic.com',
    hintText: 'console.anthropic.com',
    desc: 'Your key is stored only in your browser (localStorage). Never sent anywhere except directly to Anthropic\'s API.'
  },
  openai: {
    name: 'OpenAI GPT',
    placeholder: 'sk-proj-...',
    hintUrl: 'https://platform.openai.com/api-keys',
    hintText: 'platform.openai.com',
    desc: 'Your key is stored only in your browser (localStorage). Never sent anywhere except directly to OpenAI\'s API.'
  },
  gemini: {
    name: 'Google Gemini',
    placeholder: 'AIzaSy...',
    hintUrl: 'https://aistudio.google.com',
    hintText: 'aistudio.google.com',
    desc: 'Your key is stored only in your browser (localStorage). Never sent anywhere except directly to Google Gemini API.'
  }
};

// ── State ──
let lastOutput = '';
let startTime = 0;
let totalDocs = 0;
let totalIssues = 0;

// ── Format prompts ──
const FMT_PROMPTS = {
  docstring: `Write only the docstring or JSDoc comment block to place directly above the function or class.
Include: a clear description, all parameters with types and descriptions, return value with type, any exceptions/errors raised, and one concise usage example.
Output ONLY the comment block. No explanation, no extra text, no markdown fences.`,
  readme: `Write a professional README section in Markdown for this code.
Include:
- Short description (2-3 sentences)
- Installation / setup note if relevant
- Usage code block with a real example
- Parameters table: | Name | Type | Required | Description |
- Return value description
- Notes on edge cases or limitations
Output only the Markdown content.`,
  inline: `Return the EXACT original code with added inline comments explaining what each logical block does.
Rules:
- Do NOT change any code whatsoever
- Add a comment above each logical section
- Add parameter/variable explanations where useful
- Keep comments concise and informative
Output the commented code only, no explanation.`,
  api: `Write a complete API reference in Markdown.
Include:
- Function/class signature
- Description
- Parameters table: | Name | Type | Required | Default | Description |
- Return type and description
- Error conditions and what triggers them
- A complete usage example with expected output
Output only the Markdown content.`
};

// ── API Key ──
function getProvider() {
  return localStorage.getItem(PROVIDER_KEY) || 'anthropic';
}

function setProvider(provider) {
  localStorage.setItem(PROVIDER_KEY, provider);
}

function getProviderName(provider) {
  return PROVIDERS[provider]?.name || 'Unknown';
}

function getApiKey(provider = getProvider()) {
  // Migration support for older single key format if provider is anthropic
  if (provider === 'anthropic') {
    const oldKey = localStorage.getItem('autodoc_apikey');
    if (oldKey) {
      localStorage.setItem(APIKEY_PREFIX + 'anthropic', oldKey);
      localStorage.removeItem('autodoc_apikey');
      return oldKey;
    }
  }
  return localStorage.getItem(APIKEY_PREFIX + provider) || '';
}

function saveApiKey(provider, key) {
  localStorage.setItem(APIKEY_PREFIX + provider, key.trim());
}

function loadApiKeyInput() {
  const provider = getProvider();
  const select = document.getElementById('apiProviderSelect');
  if (select) select.value = provider;

  updateProviderUi(provider);
}

function updateProviderUi(provider) {
  const info = PROVIDERS[provider];
  if (!info) return;

  const descEl = document.getElementById('keyPanelDesc');
  const inputEl = document.getElementById('apiKeyInput');
  const hintEl = document.getElementById('keyHint');

  if (descEl) descEl.textContent = info.desc;
  if (inputEl) {
    inputEl.placeholder = info.placeholder;
    inputEl.value = getApiKey(provider);
  }
  if (hintEl) {
    hintEl.innerHTML = `Get your key at <a href="${info.hintUrl}" target="_blank" rel="noopener">${info.hintText}</a>`;
  }

  updateKeyStatus(getApiKey(provider));
}

function onProviderChange() {
  const select = document.getElementById('apiProviderSelect');
  if (!select) return;
  const provider = select.value;
  setProvider(provider);
  updateProviderUi(provider);
}

function updateKeyStatus(key) {
  const el = document.getElementById('keyStatus');
  const modelSelect = document.getElementById('modelSelect');
  if (!el) return;
  const provider = getProvider();
  
  if (key) {
    let isValid = false;
    if (provider === 'anthropic' && key.startsWith('sk-ant-')) isValid = true;
    else if (provider === 'openai' && key.startsWith('sk-')) isValid = true;
    else if (provider === 'gemini' && key.startsWith('AIzaSy')) isValid = true;
    else if (key.length > 25) isValid = true; // basic fallback

    if (isValid) {
      el.textContent = '✓ Key saved';
      el.style.color = 'var(--green)';
    } else {
      el.textContent = '⚠ Invalid format';
      el.style.color = 'var(--amber)';
    }
    
    if (modelSelect) {
      modelSelect.innerHTML = MODELS[provider].map(m => `<option value="${m}">${m}</option>`).join('');
      modelSelect.disabled = false;
    }
  } else {
    el.textContent = 'No key set';
    el.style.color = 'var(--text3)';
    
    if (modelSelect) {
      modelSelect.innerHTML = `<option value="free">Gemini 2.5 Flash (Free)</option>`;
      modelSelect.disabled = true;
    }
  }
  if (typeof updateStatusBar === 'function') updateStatusBar();
}

function onApiKeyChange() {
  let provider = getProvider();
  const val = document.getElementById('apiKeyInput').value.trim();
  
  let detectedProvider = null;
  if (val.startsWith('sk-ant-')) {
    detectedProvider = 'anthropic';
  } else if (val.startsWith('sk-')) {
    detectedProvider = 'openai';
  } else if (val.startsWith('AIzaSy')) {
    detectedProvider = 'gemini';
  }
  
  if (detectedProvider && detectedProvider !== provider) {
    provider = detectedProvider;
    setProvider(provider);
    const select = document.getElementById('apiProviderSelect');
    if (select) select.value = provider;
    updateProviderUi(provider);
  }

  saveApiKey(provider, val);
  updateKeyStatus(val);
}

function toggleKeyVisibility() {
  const input = document.getElementById('apiKeyInput');
  const btn = document.getElementById('toggleKeyBtn');
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = 'Hide';
  } else {
    input.type = 'password';
    btn.textContent = 'Show';
  }
}

// ── History ──
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift(entry); // newest first
  if (history.length > 50) history.pop(); // keep max 50
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function clearHistory() {
  if (!confirm('Clear all history? This cannot be undone.')) return;
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const empty = document.getElementById('historyEmpty');
  const counter = document.getElementById('historyCount');
  if (!list) return;

  const history = getHistory();
  counter.textContent = history.length;

  if (history.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = history.map((item, i) => `
    <div class="hist-item" onclick="loadFromHistory(${i})">
      <div class="hist-top">
        <span class="hist-source">${escapeHtml(item.source)}</span>
        <span class="hist-badges">
          <span class="hist-badge">${escapeHtml(item.lang)}</span>
          <span class="hist-badge">${escapeHtml(item.fmt)}</span>
          ${item.issueCount > 0 ? `<span class="hist-badge hist-badge-warn">${item.issueCount} issues</span>` : ''}
        </span>
      </div>
      <div class="hist-preview">${escapeHtml(item.codePreview)}</div>
      <div class="hist-time">${item.time}</div>
    </div>
  `).join('');
}

function loadFromHistory(index) {
  const history = getHistory();
  const item = history[index];
  if (!item) return;

  document.getElementById('codeIn').value = item.code;
  document.getElementById('lang').value = item.lang;
  document.getElementById('fmt').value = item.fmt;
  document.getElementById('outArea').textContent = item.output;
  lastOutput = item.output;

  document.getElementById('copyBtn').style.display = 'flex';
  document.getElementById('exportBtn').style.display = 'flex';

  // Close panel and show status
  toggleHistory(false);
  setStatus(`Loaded from history: ${item.source}`, 'done');
}

function toggleHistory(forceOpen) {
  const panel = document.getElementById('historyPanel');
  const isOpen = panel.classList.contains('open');
  if (forceOpen === false || isOpen) {
    panel.classList.remove('open');
  } else {
    renderHistory();
    panel.classList.add('open');
  }
}

// ── Free Tier & Modals ──
function getFreeUsage() {
  const today = new Date().toISOString().split('T')[0];
  let data;
  try { data = JSON.parse(localStorage.getItem('autodoc_free') || '{}'); }
  catch (e) { data = {}; }
  if (data.date !== today) {
    data = { count: 0, date: today };
    localStorage.setItem('autodoc_free', JSON.stringify(data));
  }
  return data;
}

function incrementFreeUsage() {
  const data = getFreeUsage();
  data.count++;
  localStorage.setItem('autodoc_free', JSON.stringify(data));
}

function showLimitModal() {
  document.getElementById('limitModal').classList.add('open');
}

function showServerQuotaModal() {
  document.getElementById('serverQuotaModal').classList.add('open');
}

function showKeyExhaustedModal(provider) {
  const body = document.getElementById('keyExhaustedBody');
  if (body) body.textContent = `Your ${provider} API key has run out of credits or hit its rate limit. Please top up your account or switch to a different provider.`;
  document.getElementById('keyExhaustedModal').classList.add('open');
}

function showInvalidKeyModal(provider) {
  const body = document.getElementById('invalidKeyBody');
  if (body) body.textContent = `Your ${provider} API key was rejected. Please check it's correct and has not expired.`;
  document.getElementById('invalidKeyModal').classList.add('open');
}

// ── Helpers ──
function setStatus(msg, state = 'idle') {
  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  txt.textContent = msg;
  dot.className = 'status-dot';
  if (state === 'loading') dot.classList.add('active');
  if (state === 'done') dot.classList.add('done');
  if (msg.startsWith('✗')) {
    dot.className = 'status-dot';
    dot.style.background = 'var(--red)';
  } else {
    dot.style.background = '';
  }
}

function updateStatusBar() {
  const key = getApiKey(getProvider());
  const providerName = getProviderName(getProvider());
  const modelSelect = document.getElementById('modelSelect');
  const modelName = modelSelect ? modelSelect.options[modelSelect.selectedIndex]?.text : '';
  
  if (key) {
    setStatus(`✦ Using ${providerName} · ${modelName} · Unlimited`, 'idle');
  } else {
    const free = getFreeUsage();
    if (free.count >= 5) {
      setStatus(`✦ Free limit reached — add your key for unlimited`, 'idle');
    } else {
      setStatus(`✦ ${free.count} of 5 free docs used today`, 'idle');
    }
  }
}

function updateNavStats() {
  const ns = document.getElementById('navStats');
  ns.style.display = 'flex';
  document.getElementById('totalDocs').textContent = totalDocs;
  document.getElementById('totalIssues').textContent = totalIssues;
}

// ── GitHub Fetch ──
async function fetchGithub() {
  const url = document.getElementById('ghUrl').value.trim();
  if (!url) { setStatus('Paste a GitHub file URL first.'); return; }
  setStatus('Fetching from GitHub…', 'loading');
  try {
    const raw = url
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/');
    const res = await fetch(raw);
    if (!res.ok) throw new Error('Could not fetch. Make sure the file URL is correct and the repo is public.');
    const code = await res.text();
    document.getElementById('codeIn').value = code;
    const ext = url.split('.').pop().toLowerCase();
    const langMap = { py: 'Python', js: 'JavaScript', ts: 'TypeScript', java: 'Java', go: 'Go', rs: 'Rust', cpp: 'C++', cc: 'C++' };
    if (langMap[ext]) document.getElementById('lang').value = langMap[ext];
    const filename = url.split('/').pop();
    document.querySelectorAll('.panel-label')[0].textContent = filename;
    document.querySelectorAll('.panel-label')[1].textContent = 'documented_' + filename;
    setStatus('Code loaded from GitHub — ready to generate.', 'done');
  } catch (e) {
    setStatus('Error: ' + e.message);
  }
}

// ── API Call ──
async function callAI(prompt, promptType, code, lang, fmt) {
  const provider = getProvider();
  const apiKey = getApiKey(provider);
  const providerName = getProviderName(provider);

  if (!apiKey) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, lang, fmt, promptType })
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.limitReached) {
        showLimitModal();
        throw new Error('Limit reached');
      }
      if (data.serverQuotaExhausted) {
        showServerQuotaModal();
        throw new Error('Server quota exhausted');
      }
      if (res.status >= 500 && res.status < 600) {
         setStatus("Network error. Check your connection.");
         throw new Error("Network error. Check your connection.");
      }
      throw new Error(data.error || `API error ${res.status}`);
    }
    const data = await res.json();
    return data.result;
  }

  const model = document.getElementById('modelSelect').value;
  
  try {
    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!res.ok) {
         if (res.status === 429) { showKeyExhaustedModal(providerName); throw new Error('Key rate limit'); }
         if (res.status === 401 || res.status === 403) { showInvalidKeyModal(providerName); throw new Error('Invalid key'); }
         if (res.status === 400) { setStatus("Bad request. Check your code input."); throw new Error('Bad request'); }
         throw new Error(`API error ${res.status}`);
      }
      const data = await res.json();
      return (data.content || []).map(b => b.text || '').join('');
    } else if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!res.ok) {
         if (res.status === 429) { showKeyExhaustedModal(providerName); throw new Error('Key rate limit'); }
         if (res.status === 401 || res.status === 403) { showInvalidKeyModal(providerName); throw new Error('Invalid key'); }
         if (res.status === 400) { setStatus("Bad request. Check your code input."); throw new Error('Bad request'); }
         throw new Error(`API error ${res.status}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } else if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1500 }
        })
      });
      if (!res.ok) {
         if (res.status === 429) { showKeyExhaustedModal(providerName); throw new Error('Key rate limit'); }
         if (res.status === 401 || res.status === 403) { showInvalidKeyModal(providerName); throw new Error('Invalid key'); }
         if (res.status === 400) { setStatus("Bad request. Check your code input."); throw new Error('Bad request'); }
         throw new Error(`API error ${res.status}`);
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  } catch (e) {
     if (e.message.includes('fetch') || e.name === 'TypeError') {
        setStatus("Network error. Check your connection.");
        throw new Error("Network error. Check your connection.");
     }
     if (e.message !== 'Key rate limit' && e.message !== 'Invalid key' && e.message !== 'Bad request' && e.message !== 'Limit reached' && e.message !== 'Server quota exhausted') {
        setStatus("Unexpected error: " + e.message);
     }
     throw e;
  }
}

// ── Main Generate ──
async function generate() {
  const code = document.getElementById('codeIn').value.trim();
  const lang = document.getElementById('lang').value;
  const fmt = document.getElementById('fmt').value;

  if (!code) { setStatus('✗ Paste some code first.'); return; }
  if (code.length < 10) { setStatus('✗ Code too short to analyse.'); return; }
  if (code.length > 50000) { setStatus('✗ Code too long. Max 50,000 characters.'); return; }
  
  const provider = getProvider();
  if (!getApiKey(provider)) {
    const free = getFreeUsage();
    if (free.count >= 5) {
      showLimitModal();
      return;
    }
  }

  setStatus('⟳ Running AI analysis…', 'loading');
  document.getElementById('runBtn').disabled = true;
  document.getElementById('outArea').innerHTML = '<div class="output-placeholder"><div class="cursor" style="font-family:var(--mono);font-size:13px;color:var(--accent)">Generating</div></div>';
  document.getElementById('statsBar').style.display = 'none';
  document.getElementById('issuesPanel').style.display = 'none';
  document.getElementById('exportBtn').style.display = 'none';
  document.getElementById('copyBtn').style.display = 'none';
  startTime = Date.now();

  const docPrompt = `You are a senior ${lang} developer writing production-quality documentation.
${FMT_PROMPTS[fmt]}

Code to document:
\`\`\`${lang.toLowerCase()}
${code}
\`\`\``;

  const bugPrompt = `You are a senior ${lang} code reviewer and security engineer.
Analyse this code and find real bugs, security vulnerabilities, code smells, and performance issues.

Return ONLY a valid JSON array with no markdown fences, no explanation, no extra text. Format:
[{"severity":"high","issue":"Clear description of the problem","line":"line number or function name"}]

Severity values: "high", "medium", "low"
Find between 3 and 6 genuine issues. If the code is clean, return an empty array: []

Code to review:
\`\`\`${lang.toLowerCase()}
${code}
\`\`\``;

  try {
    const [docText, bugText] = await Promise.all([
      callAI(docPrompt, 'doc', code, lang, fmt),
      callAI(bugPrompt, 'bug', code, lang, fmt)
    ]);
    
    if (!getApiKey(provider)) {
      incrementFreeUsage();
      updateStatusBar();
    }

    lastOutput = docText;
    const outArea = document.getElementById('outArea');
    outArea.textContent = docText;
    outArea.style.color = '';
    document.getElementById('copyBtn').style.display = 'flex';
    document.getElementById('exportBtn').style.display = 'flex';

    let issues = [];
    try {
      const clean = bugText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      issues = Array.isArray(parsed) ? parsed : [];
    } catch (e) { issues = []; }

    totalDocs++;
    totalIssues += issues.length;
    updateNavStats();
    showStats(code, docText, issues.length);
    showIssues(issues);

    // ── Save to history ──
    const ghUrl = document.getElementById('ghUrl').value.trim();
    const source = ghUrl ? ghUrl.split('/').pop() : 'manual paste';
    saveToHistory({
      time: new Date().toLocaleString(),
      source,
      lang,
      fmt,
      code,
      output: docText,
      issueCount: issues.length,
      codePreview: code.split('\n').slice(0, 2).join(' ').substring(0, 80) + '…'
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    setStatus(`✓ Done in ${elapsed}s — ${issues.length} issue${issues.length !== 1 ? 's' : ''} found.`, 'done');

  } catch (e) {
    document.getElementById('outArea').innerHTML = `<div class="output-placeholder" style="color:#f87171">Error: ${e.message}</div>`;
    setStatus('Request failed: ' + e.message);
  }

  document.getElementById('runBtn').disabled = false;
}

// ── Show Stats ──
function showStats(before, after, issueCount) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const addedLines = after.split('\n').length;
  const fnCount = (before.match(/def |function |const .+=.*=>|func |fn |public \w+ \w+\(/g) || []).length || 1;
  const docHints = (after.match(/"""|\*\*|@param|\/\/|:param|Args:|Returns:/g) || []).length;
  const coverage = Math.min(100, Math.round((docHints / fnCount) * 25)) + '%';
  document.getElementById('sLines').textContent = '+' + addedLines;
  document.getElementById('sTime').textContent = elapsed + 's';
  document.getElementById('sCov').textContent = coverage;
  document.getElementById('sIssues').textContent = issueCount;
  document.getElementById('statsBar').style.display = 'grid';
}

// ── Show Issues ──
function showIssues(issues) {
  if (!issues || issues.length === 0) return;
  const list = document.getElementById('issuesList');
  list.innerHTML = issues.map(issue => {
    const sev = issue.severity || 'low';
    const sevClass = sev === 'high' ? 'sev-high' : sev === 'medium' ? 'sev-medium' : 'sev-low';
    return `<div class="issue-item">
      <span class="sev-badge ${sevClass}">${sev}</span>
      <div class="issue-content">
        <div class="issue-text">${escapeHtml(issue.issue || '')}</div>
        ${issue.line ? `<div class="issue-line">${escapeHtml(issue.line)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
  document.getElementById('issuesPanel').style.display = 'block';
}

// ── Copy / Export ──
function copyOut() {
  if (!lastOutput) return;
  navigator.clipboard.writeText(lastOutput).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    setTimeout(() => {
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  });
}

function exportMd() {
  if (!lastOutput) return;
  const lang = document.getElementById('lang').value;
  const fmt = document.getElementById('fmt').value;
  const header = `# AutoDoc AI — Generated Documentation\n\n**Language:** ${lang}  \n**Format:** ${fmt}  \n**Generated:** ${new Date().toLocaleString()}\n\n---\n\n`;
  const blob = new Blob([header + lastOutput], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `autodoc-${lang.toLowerCase()}-${Date.now()}.md`;
  a.click();
}

// ── Utility ──
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ──
function initCharCounter() {
  const codeIn = document.getElementById('codeIn');
  const charCount = document.getElementById('charCount');
  if (!codeIn || !charCount) return;
  
  codeIn.addEventListener('input', () => {
    const len = codeIn.value.length;
    charCount.textContent = `${len.toLocaleString()} / 50,000 characters`;
    charCount.className = 'char-counter';
    if (len >= 50000) charCount.classList.add('danger');
    else if (len >= 40000) charCount.classList.add('warn');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadApiKeyInput();
  renderHistory();
  initCharCounter();
  updateStatusBar();

  document.getElementById('ghUrl').addEventListener('keydown', e => {
    if (e.key === 'Enter') fetchGithub();
  });

  // Close panels on outside click
  document.addEventListener('click', e => {
    const keyPanel = document.getElementById('keyPanel');
    const histPanel = document.getElementById('historyPanel');
    if (keyPanel && keyPanel.classList.contains('open') && !keyPanel.contains(e.target) && !e.target.closest('[onclick*="keyPanel"]')) {
      keyPanel.classList.remove('open');
    }
    if (histPanel && histPanel.classList.contains('open') && !histPanel.contains(e.target) && !e.target.closest('[onclick*="toggleHistory"]')) {
      histPanel.classList.remove('open');
    }
  });
});
