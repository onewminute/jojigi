const translations = {
  ko: {
    headerTitle: "노잼 탈출! 조지기 마스터",
    headerDesc: "지루한 일상에 매운맛 한 스푼!\n(*'조지다'는 '장난치다'의 유쾌한 표현입니다)",
    targetTitle: "🎯 누구를 조질까?",
    typeTitle: "✨ 장난 스타일",
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
    classic: "📜 클래식",
    trendy: "🚀 요즘 유행",
    creative: "💡 신박한",
    mild: "😇 착한맛",
    medium: "😏 중간맛",
    spicy: "🥵 매운맛",
    langBtn: "🇺🇸 English",
    copyBtn: "복사",
    shareBtn: "공유",
    twitterBtn: "X (트윗)",
    redditBtn: "레딧",
    copySuccess: "클립보드에 복사되었습니다!",
    shareTitle: "조지기 마스터 - 작전명: "
  },
  en: {
    headerTitle: "Escape Boredom! Prank Master",
    headerDesc: "Add a spoonful of spice to your boring daily life!",
    targetTitle: "🎯 Who is the target?",
    typeTitle: "✨ Prank Style",
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
    classic: "📜 Classic",
    trendy: "🚀 Trendy",
    creative: "💡 Creative",
    mild: "😇 Mild",
    medium: "😏 Medium",
    spicy: "🥵 Spicy",
    langBtn: "🇰🇷 한국어",
    infoTitle1: "🛡️ 3 Rules for Safe Pranking",
    infoDesc1: "Pranks are only meaningful when everyone can laugh. 'Prank Master' recommends only pranks that follow these principles. First, never cause physical pain. Second, do not touch the other person's complex. Third, if the atmosphere gets cold, apologize immediately and restore it.",
    infoTitle2: "🤖 Custom Humor Recommended by AI",
    infoDesc2: "We use the latest Google Gemini AI technology to provide creative ideas tailored to the situation. If you are tired of the same repertoire of pranks every day, try finding different fun through the intensity control function. You can use it in various situations such as bets with friends, ice breaking at company dinners, and small events with lovers.",
    infoTitle3: "💡 Tips for Use",
    infoDesc3: "If you don't like the result or it doesn't fit the situation, try clicking the 'Give me another one' button. AI will generate unlimited new ideas with a different approach than before.",
    privacyLink: "Privacy Policy",
    copyBtn: "Copy",
    shareBtn: "Share",
    twitterBtn: "X (Tweet)",
    redditBtn: "Reddit",
    copySuccess: "Copied to clipboard!",
    shareTitle: "Prank Master - Operation: "
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const recommendBtn = document.getElementById('recommendBtn');
  const resultArea = document.getElementById('resultArea');
  const resultText = document.getElementById('resultText');
  const loading = document.getElementById('loading');
  const retryBtn = document.getElementById('retryBtn');
  const langBtn = document.getElementById('langBtn');
  const shareContainer = document.getElementById('shareContainer');
  const copyBtn = document.getElementById('copyBtn');
  const nativeShareBtn = document.getElementById('nativeShareBtn');
  const twitterShareBtn = document.getElementById('twitterShareBtn');
  const redditShareBtn = document.getElementById('redditShareBtn');

  // Detect initial language
  const urlParams = new URLSearchParams(window.location.search);
  const browserLang = navigator.language || navigator.userLanguage;
  const initialLang = urlParams.get('lang') || (browserLang.startsWith('en') ? 'en' : 'ko');

  // State
  let state = {
    target: '친구',
    type: 'classic',
    intensity: 'mild',
    lang: initialLang
  };

  // Setup Selection Logic
  setupSelection('targetGroup', (val) => state.target = val);
  setupSelection('typeGroup', (val) => state.type = val);
  setupSelection('intensityGroup', (val) => state.intensity = val);
  
  // Setup Lang Switch
  langBtn.addEventListener('click', toggleLanguage);
  
  // Setup Share Buttons
  copyBtn.addEventListener('click', copyToClipboard);
  nativeShareBtn.addEventListener('click', shareNative);
  twitterShareBtn.addEventListener('click', shareTwitter);
  redditShareBtn.addEventListener('click', shareReddit);

  // Initial UI Update
  updateUI();
  
  // Check and Show Cookie Consent
  checkCookieConsent();

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

  function checkCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
      const banner = document.createElement('div');
      banner.id = 'cookieConsent';
      const isEn = state.lang === 'en';
      
      banner.innerHTML = `
        <p>${isEn 
          ? 'We use cookies to improve your experience and display ads. By continuing to use this site, you agree to our use of cookies.' 
          : '우리는 더 나은 경험과 광고 제공을 위해 쿠키를 사용합니다. 사이트를 계속 이용하면 쿠키 사용에 동의하는 것으로 간주합니다.'}</p>
        <div class="btn-container">
          <button id="rejectCookies">${isEn ? 'Close' : '닫기'}</button>
          <button id="acceptCookies">${isEn ? 'Accept' : '동의'}</button>
        </div>
      `;
      
      document.body.appendChild(banner);

      document.getElementById('acceptCookies').onclick = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.remove();
      };

      document.getElementById('rejectCookies').onclick = () => {
        localStorage.setItem('cookieConsent', 'rejected'); // Still store choice to avoid spamming
        banner.remove();
      };
    }
  }

  function toggleLanguage() {
    state.lang = state.lang === 'ko' ? 'en' : 'ko';
    updateUI();
    // Optional: Update URL without reloading
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('lang', state.lang);
    window.history.pushState({}, '', newUrl);
  }

  function updateUI() {
    const t = translations[state.lang];
    
    // Update HTML lang attribute
    document.documentElement.lang = state.lang;

    // Update Meta Description & Title
    document.title = state.lang === 'en' ? 'Prank Master - Escape Boredom!' : '조지기 마스터 - 노잼 탈출!';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = state.lang === 'en' 
        ? "AI-powered Prank Recommendation Service. Creative and safe pranks for friends, coworkers, and partners." 
        : "AI 기반 장난 추천 서비스. 친구, 동료, 연인에게 할 수 있는 창의적이고 안전한 장난을 추천해드립니다.";
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.content = state.lang === 'en'
        ? "Add a spoonful of spice to your boring daily life! Creative and safe pranks recommended by AI."
        : "지루한 일상에 매운맛 한 스푼! AI가 추천하는 기발하고 안전한 장난.";
    }

    // Static IDs
    document.getElementById('headerTitle').textContent = t.headerTitle;
    document.getElementById('headerDesc').textContent = t.headerDesc;
    document.getElementById('targetTitle').textContent = t.targetTitle;
    document.getElementById('typeTitle').textContent = t.typeTitle;
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
    shareContainer.classList.add('hidden'); // Hide share while loading
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
          type: state.type,
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
      shareContainer.classList.remove('hidden'); // Show share buttons

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

  // --- Share Functions ---

  function getShareUrl() {
    return `https://jojigi.pages.dev/?lang=${state.lang}`;
  }

  function copyToClipboard() {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      const t = translations[state.lang];
      alert(t.copySuccess);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  function shareNative() {
    const t = translations[state.lang];
    const url = getShareUrl();
    if (navigator.share) {
      navigator.share({
        title: t.headerTitle,
        text: t.headerDesc.split('\n')[0], // Short description
        url: url
      }).catch(console.error);
    } else {
      // Fallback
      copyToClipboard();
    }
  }

  function shareTwitter() {
    const t = translations[state.lang];
    const text = t.headerTitle; // Simple title
    const url = getShareUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  }

  function shareReddit() {
    const t = translations[state.lang];
    const title = t.headerTitle;
    const url = getShareUrl();
    const redditUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(redditUrl, '_blank');
  }
});
