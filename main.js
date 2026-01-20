const translations = {
  ko: {
    headerTitle: "😈 조지기 마스터",
    headerDesc: "오늘 뭐 조질까? 고민하지 마!",
    targetTitle: "🎯 누구를 조질까?",
    intensityTitle: "🔥 장난 강도 (매운맛)",
    recommendBtn: "장난 설계 시작하기",
    resultTitle: "📜 조지기 작전 계획서",
    loadingText: "상황 분석 중... (사악한 웃음)",
    retryBtn: "다른 작전 줘",
    errorTitle: "⚠️ 작전 수립 실패!",
    friend: "친구",
    coworker: "직장동료",
    partner: "연인",
    family: "가족",
    mild: "😇 착한맛",
    medium: "😏 중간맛",
    spicy: "🥵 매운맛",
    langBtn: "🇺🇸 English"
  },
  en: {
    headerTitle: "😈 Prank Master",
    headerDesc: "Who are we pranking today? Don't hesitate!",
    targetTitle: "🎯 Who is the target?",
    intensityTitle: "🔥 Intensity Level",
    recommendBtn: "Generate Prank Plan",
    resultTitle: "📜 The Master Plan",
    loadingText: "Analyzing situation... (Evil laugh)",
    retryBtn: "Give me another one",
    errorTitle: "⚠️ Mission Failed!",
    friend: "Friend",
    coworker: "Coworker",
    partner: "Partner",
    family: "Family",
    mild: "😇 Mild",
    medium: "😏 Medium",
    spicy: "🥵 Spicy",
    langBtn: "🇰🇷 한국어"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const recommendBtn = document.getElementById('recommendBtn');
  const resultArea = document.getElementById('resultArea');
  const resultText = document.getElementById('resultText');
  const loading = document.getElementById('loading');
  const retryBtn = document.getElementById('retryBtn');
  const langBtn = document.getElementById('langBtn');

  // State
  let state = {
    target: '친구',
    intensity: 'mild',
    lang: 'ko' // 'ko' or 'en'
  };

  // Setup Selection Logic
  setupSelection('targetGroup', (val) => state.target = val);
  setupSelection('intensityGroup', (val) => state.intensity = val);
  
  // Setup Lang Switch
  langBtn.addEventListener('click', toggleLanguage);

  function setupSelection(groupId, callback) {
    const group = document.getElementById(groupId);
    const buttons = group.querySelectorAll('.select-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        callback(btn.dataset.value);
      });
    });
  }

  function toggleLanguage() {
    state.lang = state.lang === 'ko' ? 'en' : 'ko';
    updateUI();
  }

  function updateUI() {
    const t = translations[state.lang];
    
    // Static IDs
    document.getElementById('headerTitle').textContent = t.headerTitle;
    document.getElementById('headerDesc').textContent = t.headerDesc;
    document.getElementById('targetTitle').textContent = t.targetTitle;
    document.getElementById('intensityTitle').textContent = t.intensityTitle;
    document.getElementById('recommendBtn').textContent = t.recommendBtn;
    document.getElementById('resultTitle').textContent = t.resultTitle;
    document.getElementById('loadingText').textContent = t.loadingText;
    document.getElementById('retryBtn').textContent = t.retryBtn;
    document.getElementById('langBtn').textContent = t.langBtn;

    // Dynamic Spans (Buttons)
    document.querySelectorAll('[data-t]').forEach(el => {
      const key = el.dataset.t;
      if (t[key]) el.textContent = t[key];
    });
  }

  recommendBtn.addEventListener('click', fetchPrank);
  retryBtn.addEventListener('click', fetchPrank);

  async function fetchPrank() {
    resultArea.classList.remove('hidden');
    loading.classList.remove('hidden');
    resultText.innerHTML = '';
    retryBtn.classList.add('hidden');
    recommendBtn.disabled = true;

    // Scroll to result
    setTimeout(() => {
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: state.target,
          intensity: state.intensity,
          lang: state.lang // Send language state
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Unknown Error');
      }

      const data = await response.json();
      resultText.textContent = data.recommendation;
      retryBtn.classList.remove('hidden');

    } catch (error) {
      console.error(error);
      const t = translations[state.lang];
      resultText.innerHTML = `<div style="color:red; text-align:center;">
        <strong>${t.errorTitle}</strong><br>
        ${error.message}<br>
      </div>`;
    } finally {
      loading.classList.add('hidden');
      recommendBtn.disabled = false;
    }
  }
});
