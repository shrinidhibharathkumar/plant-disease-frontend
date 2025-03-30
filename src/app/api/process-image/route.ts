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
      return new Response(JSON.stringify({ error: 'Processing failed' }), { status: 500 });
    }

    const blob = await response.blob();
    return new Response(blob, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
