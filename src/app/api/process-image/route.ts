// ================= FRONTEND (route.ts) =================
export async function POST(request: Request) {
  const formData = await request.formData();

  const externalApiUrl = 'http://localhost:8000/process'; // Point to your FastAPI server

  try {
    const response = await fetch(externalApiUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Processing failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
