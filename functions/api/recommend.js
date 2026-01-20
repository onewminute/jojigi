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
      error: "API Key Missing" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  let requestData = {};
  try {
    requestData = await request.json();
  } catch (e) {}

  const target = requestData.target || 'friend';
  const intensity = requestData.intensity || 'mild';
  const lang = requestData.lang || 'ko'; // 언어 설정 (기본 ko)

  // Language Config
  const isEn = lang === 'en';
  
  const intensityMap = {
    'mild': isEn 
      ? 'Cute and funny. No harm, laughter after 10 seconds.' 
      : '귀엽고 웃긴 수준. 피해가 없고 10초 뒤에 바로 웃을 수 있는 가벼운 장난.',
    'medium': isEn 
      ? 'Annoying but forgivable. Confusing and takes 1-5 mins to resolve.' 
      : '킹받지만 용서 가능한 수준. 약간 당황스럽고 해결하는 데 1~5분 정도 걸리는 귀찮은 장난.',
    'spicy': isEn 
      ? 'High psychological impact. Clever and confusing, causing mental chaos but NO physical damage or financial loss.' 
      : '정신적 타격이 꽤 있는 수준. 아주 교묘하고 치밀해서 당하면 멘붕이 오지만, 결코 물리적 피해나 금전적 손해는 없는 "안전한" 범위 내의 혼돈.'
  };

  const intensityDesc = intensityMap[intensity] || intensityMap['mild'];

  const modelName = "gemini-flash-latest";
  const apiVersion = "v1beta";
  
  // Prompt Construction based on Language
  let prompt = "";

  if (isEn) {
    prompt = `
    You are the 'Prank Master', designing the most creative and harmless pranks.
    
    [Request]
    - Target: ${target}
    - Intensity: ${intensity} (${intensityDesc})
    
    [Instructions]
    Suggest a unique prank based on the criteria above.
    MUST exclude any physical injury, illegal acts, or serious bullying. Keep it fun or slightly annoying but safe.
    
    [Output Format]
    1. Operation Name: (Creative Title)
    2. Preparation:
    3. Execution Steps: (Step-by-step)
    4. Expected Reaction & Countermeasure:
    5. Excuse when caught:
    
    Tone: Mischievous, friendly, and casual. Reply in English.
    `;
  } else {
    prompt = `
    너는 세상에서 가장 창의적이고 무해한 장난을 설계하는 '조지기 마스터'야. 
    
    [요청 내용]
    - 타겟: ${target} (영어 입력일 경우 한국어 문맥에 맞게 해석해: friend->친구, coworker->직장동료 등)
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
    
    말투는 장난끼 넘치고 친근하게(반말) 해줘. 한국어로 답변해.`;
  }

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
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || (isEn ? "Prank Master is out of ideas. Try again!" : "조지기 마스터가 아이디어가 고갈됐나봐. 다시 시도해봐!");

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
