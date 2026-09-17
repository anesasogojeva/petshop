const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = process.env.SUPABASE_IMAGES_BUCKET || 'images';

const uploadImage = async (file, folder) => {
  const safeName = file.originalname.replace(/\s+/g, '-');
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
};

const deleteImage = async (publicUrl) => {
  if (!publicUrl) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return; // not a Supabase Storage URL (e.g. an old local/seeded path)
  const path = publicUrl.slice(index + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
};

module.exports = { uploadImage, deleteImage };
