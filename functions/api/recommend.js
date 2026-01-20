export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS 처리를 위한 헤더
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

  // 환경변수 확인 (여러 경로 체크)
  const apiKey = env.JOJIGI_API_KEY || (typeof process !== 'undefined' ? process.env.JOJIGI_API_KEY : undefined);
  
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: "API Key 미설정: Cloudflare 대시보드의 'Settings > Functions > Environment variables'에 JOJIGI_API_KEY를 등록했는지 확인해주세요. (Production/Preview 모두 등록 권장)" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const prompt = `너는 세상에서 가장 창의적이고 무해한 장난을 설계하는 '조지기 마스터'야. 
  20대 사용자가 친구나 직장 동료에게 할 수 있는 '킹받지만 웃음 터지는' 장난을 하나 추천해줘. 
  준비물, 실행 단계, 그리고 걸렸을 때의 변명까지 세트로 알려줘. 
  말투는 장난끼 넘치고 친근하게 해줘.`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "조지기 마스터가 잠시 자리를 비웠어. 다시 시도해봐!";

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