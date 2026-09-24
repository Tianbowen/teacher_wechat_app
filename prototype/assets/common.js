function toast(text) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 1600);
}

const App = {
  history: [],
  titles: {},

  init(defaultPage) {
    document.querySelectorAll('.page').forEach(p => { this.titles[p.id] = p.dataset.title || ''; });
    document.querySelectorAll('.tabbar button').forEach(b => {
      b.addEventListener('click', () => this.tab(b.dataset.page));
    });
    document.querySelectorAll('.mask').forEach(m => {
      m.addEventListener('click', e => { if (e.target === m) m.classList.remove('on'); });
    });
    this.tab(defaultPage);
  },

  show(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('on', p.id === id));
    const nav = document.querySelector('.navbar .t');
    if (nav) nav.textContent = this.titles[id] || '';
    const back = document.querySelector('.navbar .back');
    if (back) back.classList.toggle('hidden', this.history.length === 0);
    const isTab = !!document.querySelector(`.tabbar button[data-page="${id}"]`);
    const tabbar = document.querySelector('.tabbar');
    if (tabbar) tabbar.classList.toggle('hidden', !isTab);
    const fab = document.querySelector('.fab');
    if (fab) fab.classList.toggle('hidden', !isTab);
    document.querySelectorAll('.stage-side .nav-list button').forEach(b => b.classList.toggle('on', b.dataset.page === id));
    const page = document.getElementById(id);
    if (page) page.scrollTop = 0;
  },

  tab(id) {
    this.history = [];
    document.querySelectorAll('.tabbar button').forEach(b => b.classList.toggle('on', b.dataset.page === id));
    this.show(id);
  },

  go(id) {
    const cur = document.querySelector('.page.on');
    if (cur) this.history.push(cur.id);
    this.show(id);
  },

  back() {
    const prev = this.history.pop();
    if (prev) this.show(prev);
  },

  jump(id) {
    if (document.querySelector(`.tabbar button[data-page="${id}"]`)) this.tab(id);
    else { this.history = []; this.go(id); }
  },
};

function openSheet(id) { document.getElementById(id).classList.add('on'); }
function closeSheet(id) { document.getElementById(id).classList.remove('on'); }

function bindGroup(selector, onChange) {
  document.querySelectorAll(selector).forEach(group => {
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        if (onChange) onChange(btn, group);
      });
    });
  });
}

/* ---------- AI 助手（演示用规则匹配，正式版接入大模型 + 工具调用） ---------- */
const Agent = {
  chatEl: null,
  rules: [],

  mount(chatEl, inputEl, sendBtn, rules, welcome) {
    this.chatEl = chatEl;
    this.rules = rules;
    const send = () => {
      const v = inputEl.value.trim();
      if (!v) return;
      inputEl.value = '';
      this.ask(v);
    };
    sendBtn.addEventListener('click', send);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    this.bot(welcome);
  },

  ask(text) {
    this.push('me', text);
    const typing = this.push('bot', '<span class="muted">正在思考…</span>');
    setTimeout(() => {
      typing.remove();
      const rule = this.rules.find(r => r.match.some(k => text.includes(k)));
      this.bot(rule ? rule.reply : '我暂时还不太理解，你可以试试：<br>“这周还有几节课”、“帮我约周六私教”、“我还剩几节课”');
    }, 700);
  },

  bot(html) { this.push('bot', html); },

  push(who, html) {
    const el = document.createElement('div');
    el.className = 'msg ' + (who === 'me' ? 'me' : '');
    const av = who === 'me'
      ? '<div class="avatar sm">我</div>'
      : '<div class="avatar sm" style="background:linear-gradient(135deg,#8b5cf6,#2f6bff)">AI</div>';
    el.innerHTML = av + '<div class="bubble">' + html + '</div>';
    this.chatEl.appendChild(el);
    this.chatEl.scrollTop = this.chatEl.scrollHeight;
    return el;
  },

  confirm(btn, doneText) {
    const box = btn.closest('.card-in');
    box.querySelectorAll('button').forEach(b => b.remove());
    box.insertAdjacentHTML('beforeend', '<div style="margin-top:8px;color:var(--primary-dark);font-weight:600">✅ 已完成</div>');
    this.bot(doneText);
  },

  cancel(btn) {
    const box = btn.closest('.card-in');
    box.querySelectorAll('button').forEach(b => b.remove());
    box.insertAdjacentHTML('beforeend', '<div class="muted" style="margin-top:8px">已取消操作</div>');
  },
};
