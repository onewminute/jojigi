export async function onRequest(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
      status: 405, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  const apiKey = env.JOJIGI_API_KEY || (typeof process !== 'undefined' ? process.env.JOJIGI_API_KEY : undefined);
  
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: "API Key 미설정: Cloudflare 대시보드에서 JOJIGI_API_KEY를 확인해주세요." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // 요청 데이터 파싱 (대상, 강도)
  let requestData = {};
  try {
    requestData = await request.json();
  } catch (e) {
    // JSON 파싱 실패 시 기본값 사용
  }

  const target = requestData.target || '친구';
  const intensity = requestData.intensity || 'mild';

  // 강도에 따른 프롬프트 상세 설정
  const intensityMap = {
    'mild': '귀엽고 웃긴 수준. 피해가 없고 10초 뒤에 바로 웃을 수 있는 가벼운 장난.',
    'medium': '킹받지만 용서 가능한 수준. 약간 당황스럽고 해결하는 데 1~5분 정도 걸리는 귀찮은 장난.',
    'spicy': '정신적 타격이 꽤 있는 수준. 아주 교묘하고 치밀해서 당하면 멘붕이 오지만, 결코 물리적 피해나 금전적 손해는 없는 "안전한" 범위 내의 혼돈.'
  };

  const intensityDesc = intensityMap[intensity] || intensityMap['mild'];

  const modelName = "gemini-flash-latest";
  const apiVersion = "v1beta";
  
  // 프롬프트 강화
  const prompt = `
  너는 세상에서 가장 창의적이고 무해한 장난을 설계하는 '조지기 마스터'야. 
  
  [요청 내용]
  - 타겟: ${target}
  - 장난 강도: ${intensity} (${intensityDesc})
  
  [지시사항]
  위 조건에 맞춰 타겟에게 할 수 있는 기발한 장난을 하나 추천해줘.
  반드시 **물리적 상해, 불법 행위, 심각한 괴롭힘은 절대 제외**하고, 유쾌하거나 킹받는 선을 지켜야 해.
  
  [출력 형식]
  1. 작전명: (센스 있는 제목)
  2. 준비물:
  3. 실행 단계: (1, 2, 3... 순서대로 구체적으로)
  4. 예상 반응 및 대처법:
  5. 걸렸을 때의 변명:
  
  말투는 장난끼 넘치고 친근하게(반말) 해줘.`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "조지기 마스터가 아이디어가 고갈됐나봐. 다시 시도해봐!";

    return new Response(JSON.stringify({ recommendation: generatedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}