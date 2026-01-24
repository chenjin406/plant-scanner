import { getEnv, isDev } from '../utils/env';
import { IdentificationResult, SuggestedSpecies, ApiResponse } from '../types';
import { cacheService } from '../utils/cache';
import { monitoringService } from './monitoring';

// Plant Identification API service with retry logic and caching
export class PlantIdentificationService {
  private static instance: PlantIdentificationService;
  private baseUrl: string;
  private maxRetries = 3;
  private retryDelay = 1000;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Use relative URL for same-origin requests, or full URL in production
    this.baseUrl = getEnv('NEXT_PUBLIC_API_URL') || '/api';
  }

  static getInstance(): PlantIdentificationService {
    if (!PlantIdentificationService.instance) {
      PlantIdentificationService.instance = new PlantIdentificationService();
    }
    return PlantIdentificationService.instance;
  }

  /**
   * Identify plant from image with retry logic and caching
   * @param image Base64 image data or URL
   * @param userId Optional user ID for tracking
   * @returns Identification result
   */
  async identifyPlant(
    image: string,
    userId?: string
  ): Promise<ApiResponse<IdentificationResult>> {
    return monitoringService.measure(
      'plant_identification',
      async () => {
        const startTime = Date.now();

        // Generate cache key based on image hash (simplified)
        const imageHash = image.substring(0, 100);
        const cacheKey = `identify_${imageHash}`;

        // Check cache first
        const cached = cacheService.get<ApiResponse<IdentificationResult>>(cacheKey);
        if (cached) {
          console.log('[PlantIdentification] Using cached result');
          return cached;
        }

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
          try {
            const response = await fetch(`${this.baseUrl}/identify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ image, userId }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Identification failed');
            }

            // Handle low confidence responses
            if (!data.success && data.data?.threshold_met === false) {
              const result: ApiResponse<IdentificationResult> = {
                success: false,
                error: data.error || '识别准确率不足，请提供更清晰的照片或尝试手动搜索',
                data: data.data,
              };
              
              // Cache low confidence results for shorter time
              cacheService.set(cacheKey, result, 60000); // 1 minute
              
              return result;
            }

            const result: ApiResponse<IdentificationResult> = {
              success: true,
              data: data.data,
            };

            // Cache successful results
            cacheService.set(cacheKey, result, this.cacheTTL);

            // Log performance metrics
            const duration = Date.now() - startTime;
            console.log(`[PlantIdentification] Success in ${duration}ms (attempt ${attempt})`);

            return result;
          } catch (error: any) {
            lastError = error;
            console.error(`[PlantIdentification] Attempt ${attempt} failed:`, error);

            // Track error
            monitoringService.trackError(error, {
              attempt,
              userId,
              endpoint: '/api/identify',
            });

            // Don't retry on client errors (4xx)
            if (error.message?.includes('400') || error.message?.includes('401') || error.message?.includes('403')) {
              break;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < this.maxRetries) {
              await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
            }
          }
        }

        const errorResult: ApiResponse<IdentificationResult> = {
          success: false,
          error: lastError?.message || '识别失败，请检查网络连接后重试',
        };

        // Log error metrics
        const duration = Date.now() - startTime;
        console.error(`[PlantIdentification] Failed after ${duration}ms`);

        return errorResult;
      },
      { userId }
    );
  }

  /**
   * Get scan result by ID with caching
   */
  async getScanResult(scanId: string): Promise<ApiResponse<IdentificationResult>> {
    const cacheKey = `scan_${scanId}`;

    // Check cache first
    const cached = cacheService.get<ApiResponse<IdentificationResult>>(cacheKey);
    if (cached) {
      console.log('[PlantIdentification] Using cached scan result');
      return cached;
    }

    try {
      const response = await fetch(`${this.baseUrl}/scans/${scanId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get scan result');
      }

      const result: ApiResponse<IdentificationResult> = {
        success: true,
        data: data.data,
      };

      // Cache scan results
      cacheService.set(cacheKey, result, this.cacheTTL);

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '获取识别结果失败',
      };
    }
  }

  /**
   * Retry identification with a different image
   */
  async retryIdentification(
    scanId: string,
    image: string,
    userId?: string
  ): Promise<ApiResponse<IdentificationResult>> {
    // Clear cache for this image to force fresh identification
    const imageHash = image.substring(0, 100);
    const cacheKey = `identify_${imageHash}`;
    cacheService.delete(cacheKey);

    return this.identifyPlant(image, userId);
  }

  /**
   * Clear cache for a specific identification
   */
  clearCache(image: string): void {
    const imageHash = image.substring(0, 100);
    const cacheKey = `identify_${imageHash}`;
    cacheService.delete(cacheKey);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const plantIdentificationService = PlantIdentificationService.getInstance();
