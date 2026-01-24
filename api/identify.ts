import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// PlantNet API configuration
const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;
const PLANTNET_API_URL = 'https://my-api.plantnet.org/v2/identify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { image, userId } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'Image is required' });
    }

    // Check if image is a base64 string or URL
    let imageBuffer: Buffer;

    if (image.startsWith('data:image')) {
      // Base64 image
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (image.startsWith('http')) {
      // URL - fetch the image
      const response = await fetch(image);
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid image format' });
    }

    // Compress image to 1024px max dimension with JPEG quality 0.8 (PRD requirement)
    const compressedImage = await sharp(imageBuffer)
      .resize(1024, 1024, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload compressed image to Supabase Storage
    const imagePath = `scans/${userId || 'anonymous'}/${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('plant-images')
      .upload(imagePath, compressedImage, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Continue without storing image - the identification is more important
    }

    const publicUrl = uploadData
      ? supabase.storage.from('plant-images').getPublicUrl(uploadData.path).data.publicUrl
      : null;

    // Call PlantNet API with compressed image
    const formData = new FormData();
    formData.append('images', new Blob([compressedImage], { type: 'image/jpeg' }));
    formData.append('organs', 'leaf'); // Default to leaf
    formData.append('api-key', PLANTNET_API_KEY!);

    const plantNetResponse = await fetch(PLANTNET_API_URL, {
      method: 'POST',
      body: formData
    });

    if (!plantNetResponse.ok) {
      throw new Error(`PlantNet API error: ${plantNetResponse.statusText}`);
    }

    const plantNetData = await plantNetResponse.json();

    // Process results with confidence threshold check (PRD requirement: 0.5)
    const suggestions = plantNetData.suggestions || [];
    const topSuggestion = suggestions[0];

    // Check if top suggestion meets confidence threshold
    if (!topSuggestion || topSuggestion.score < 0.5) {
      return res.status(200).json({
        success: false,
        error: '识别准确率不足，请提供更清晰的照片或尝试手动搜索',
        data: {
          scan_id: uploadData?.path || `temp_${Date.now()}`,
          confidence: topSuggestion?.score || 0,
          threshold_met: false
        }
      });
    }

    // Enrich with local database data (top 3 results as per PRD)
    let enrichedResults = await Promise.all(
      suggestions.slice(0, 3).map(async (suggestion: any) => {
        const { data: speciesData } = await supabase
          .from('plant_species')
          .select('*')
          .eq('scientific_name', suggestion.scientific_name)
          .single();

        return {
          species_id: speciesData?.id || null,
          common_name: speciesData?.common_name || suggestion.common_name,
          scientific_name: suggestion.scientific_name,
          confidence: suggestion.score,
          care_profile: speciesData?.care_profile || null,
          description: speciesData?.description || null,
          image_url: speciesData?.image_urls?.[0] || null
        };
      })
    );

    // Save scan record
    if (userId) {
      await supabase.from('scan_records').insert({
        user_id: userId,
        image_url: publicUrl || '',
        result_species_id: enrichedResults[0]?.species_id || null,
        result_species_name: enrichedResults[0]?.scientific_name,
        confidence: enrichedResults[0]?.confidence || 0,
        suggested_species: enrichedResults
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        scan_id: uploadData?.path || `temp_${Date.now()}`,
        top_suggestion: enrichedResults[0],
        all_suggestions: enrichedResults,
        image_url: publicUrl
      }
    });

  } catch (error: any) {
    console.error('Identification error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Identification failed'
    });
  }
}
