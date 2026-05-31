import { NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo');
    const userId = formData.get('user_id');
    const photoType = formData.get('photo_type');
    const weekNumber = parseInt(formData.get('week_number') || '1', 10);

    if (!file || !userId || !photoType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${userId}/${photoType}_week${weekNumber}_${Date.now()}.${fileExt}`;
    const buffer = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await supabaseServer.storage
      .from('champion-photos')
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseServer.storage
      .from('champion-photos')
      .getPublicUrl(fileName);

    await supabaseServer.from('user_photos').insert({
      user_id: userId,
      photo_url: urlData.publicUrl,
      photo_type: photoType,
      week_number: weekNumber,
    });

    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
