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

  // 진단 목록에 있었던 안정적인 모델 별칭 사용
  const modelName = "gemini-flash-latest";
  const apiVersion = "v1beta";
  
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
