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

  // 1차 시도: v1beta 버전의 gemini-1.5-flash
  const modelName = "gemini-1.5-flash";
  const apiVersion = "v1beta"; // v1beta가 보통 가장 많은 모델을 지원함
  
  const prompt = `너는 세상에서 가장 창의적이고 무해한 장난을 설계하는 '조지기 마스터'야. 
  20대 사용자가 친구나 직장 동료에게 할 수 있는 '킹받지만 웃음 터지는' 장난을 하나 추천해줘. 
  준비물, 실행 단계, 그리고 걸렸을 때의 변명까지 세트로 알려줘. 
  말투는 장난끼 넘치고 친근하게 해줘.`;

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
      // 에러 발생 시 상세 정보 수집
      const errText = await response.text();
      let debugInfo = `Error ${response.status}: ${errText}`;

      // 404 에러라면(모델 못 찾음), 사용 가능한 모델 목록을 조회해서 알려줌
      if (response.status === 404) {
        try {
          const listUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`;
          const listResp = await fetch(listUrl);
          if (listResp.ok) {
            const listData = await listResp.json();
            const availableModels = listData.models
              ? listData.models.map(m => m.name).filter(n => n.includes('gemini')).join(", ")
              : "없음";
            debugInfo += `\n\n[진단 결과] 사용 가능한 모델 목록: ${availableModels}`;
          } else {
             debugInfo += `\n\n[진단 실패] 모델 목록 조회도 실패했습니다. API Key가 올바른지 확인해주세요.`;
          }
        } catch (listErr) {
          debugInfo += `\n\n[진단 오류] ${listErr.message}`;
        }
      }
      
      throw new Error(debugInfo);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "생성된 내용이 없습니다.";

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
