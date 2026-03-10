import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  let url = '';
  
  if (lat && lon) {
    url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`;
  } else if (query && query.length >= 3) {
    url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`;
  } else {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PH-Toll-Calc-Test',
      },
    });

    if (!response.ok) {
       console.error(`Nominatim Error: ${response.status} ${response.statusText}`);
       return NextResponse.json([], { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Geocoding Internal Crash:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
