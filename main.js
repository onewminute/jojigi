document.addEventListener('DOMContentLoaded', () => {
  const recommendBtn = document.getElementById('recommendBtn');
  const resultArea = document.getElementById('resultArea');
  const resultText = document.getElementById('resultText');
  const loading = document.getElementById('loading');
  const retryBtn = document.getElementById('retryBtn');

  recommendBtn.addEventListener('click', fetchPrank);
  retryBtn.addEventListener('click', fetchPrank);

  async function fetchPrank() {
    // UI Reset
    resultArea.classList.remove('hidden');
    loading.classList.remove('hidden');
    resultText.innerHTML = '';
    retryBtn.classList.add('hidden');
    recommendBtn.disabled = true;

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
      });

      if (response.status === 404) {
        throw new Error("API 엔드포인트를 찾을 수 없습니다. (로컬 환경에서는 'wrangler pages dev'가 필요하거나 배포 후 동작합니다)");
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '알 수 없는 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      // Simple typing effect or just show text
      resultText.textContent = data.recommendation;
      retryBtn.classList.remove('hidden');

    } catch (error) {
      console.error(error);
      resultText.innerHTML = `<div style="color:red; text-align:center;">
        <strong>⚠️ 오류 발생!</strong><br>
        ${error.message}<br><br>
        <em>Cloudflare Pages에 배포되었는지, 또는 로컬에서 Wrangler를 사용 중인지 확인해주세요.</em>
      </div>`;
    } finally {
      loading.classList.add('hidden');
      recommendBtn.disabled = false;
    }
  }
});
