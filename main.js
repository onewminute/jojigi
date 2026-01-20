document.addEventListener('DOMContentLoaded', () => {
  const recommendBtn = document.getElementById('recommendBtn');
  const resultArea = document.getElementById('resultArea');
  const resultText = document.getElementById('resultText');
  const loading = document.getElementById('loading');
  const retryBtn = document.getElementById('retryBtn');

  // State
  let state = {
    target: '친구',
    intensity: 'mild'
  };

  // Setup Selection Logic
  setupSelection('targetGroup', (val) => state.target = val);
  setupSelection('intensityGroup', (val) => state.intensity = val);

  function setupSelection(groupId, callback) {
    const group = document.getElementById(groupId);
    const buttons = group.querySelectorAll('.select-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all siblings
        buttons.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');
        // Update state
        callback(btn.dataset.value);
      });
    });
  }

  recommendBtn.addEventListener('click', fetchPrank);
  retryBtn.addEventListener('click', fetchPrank);

  async function fetchPrank() {
    // UI Reset
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
          intensity: state.intensity
        })
      });

      if (response.status === 404) {
        throw new Error("API 엔드포인트를 찾을 수 없습니다.");
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '알 수 없는 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      // Update Text
      resultText.textContent = data.recommendation;
      retryBtn.classList.remove('hidden');

    } catch (error) {
      console.error(error);
      resultText.innerHTML = `<div style="color:red; text-align:center;">
        <strong>⚠️ 작전 수립 실패!</strong><br>
        ${error.message}<br><br>
      </div>`;
    } finally {
      loading.classList.add('hidden');
      recommendBtn.disabled = false;
    }
  }
});