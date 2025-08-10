/**
 * Cloudinary 图片服务
 * 处理用户头像、成就图标等图片资源
 */

interface UploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  };
  publicId?: string;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string = 'brain-training'; // 需要在 Cloudinary 控制台创建

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
  }

  /**
   * 上传图片到 Cloudinary
   */
  async uploadImage(file: File | Blob | string, options: UploadOptions = {}): Promise<{
    url: string;
    publicId: string;
    width: number;
    height: number;
  }> {
    const formData = new FormData();
    
    // 处理不同类型的输入
    if (typeof file === 'string') {
      // Base64 或 URL
      formData.append('file', file);
    } else {
      // File 或 Blob
      formData.append('file', file);
    }

    formData.append('upload_preset', this.uploadPreset);
    
    if (options.folder) {
      formData.append('folder', `brain-training/${options.folder}`);
    }
    
    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
      };
    } catch (error) {
      console.error('Cloudinary 上传错误:', error);
      // 降级到默认头像
      return this.getDefaultImage(options.folder || 'avatar');
    }
  }

  /**
   * 获取优化后的图片 URL
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}): string {
    const transformations = [];

    if (options.width) {
      transformations.push(`w_${options.width}`);
    }
    
    if (options.height) {
      transformations.push(`h_${options.height}`);
    }
    
    if (options.crop) {
      transformations.push(`c_${options.crop}`);
    }
    
    transformations.push(`q_${options.quality || 'auto'}`);
    transformations.push(`f_${options.format || 'auto'}`);

    const transformation = transformations.join(',');

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformation}/${publicId}`;
  }

  /**
   * 生成用户头像 URL
   */
  getAvatarUrl(userId: string, size: number = 200): string {
    // 如果用户有上传头像，使用 Cloudinary
    const publicId = `brain-training/avatars/${userId}`;
    
    // 检查是否存在（这里简化处理，实际应该查询数据库）
    const hasCustomAvatar = false;
    
    if (hasCustomAvatar) {
      return this.getOptimizedUrl(publicId, {
        width: size,
        height: size,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      });
    }
    
    // 否则使用 DiceBear 生成默认头像
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&size=${size}`;
  }

  /**
   * 获取成就图标 URL
   */
  getAchievementIcon(achievementId: string, size: number = 100): string {
    const publicId = `brain-training/achievements/${achievementId}`;
    
    return this.getOptimizedUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    });
  }

  /**
   * 获取游戏缩略图
   */
  getGameThumbnail(gameId: string, width: number = 400, height: number = 300): string {
    const publicId = `brain-training/games/${gameId}/thumbnail`;
    
    return this.getOptimizedUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    });
  }

  /**
   * 删除图片
   */
  async deleteImage(publicId: string): Promise<boolean> {
    // 注意：删除操作需要在服务端进行，使用 API 密钥
    // 这里只是标记，实际删除应该通过 API 路由
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });

      return response.ok;
    } catch (error) {
      console.error('删除图片失败:', error);
      return false;
    }
  }

  /**
   * 获取默认图片
   */
  private getDefaultImage(type: string): {
    url: string;
    publicId: string;
    width: number;
    height: number;
  } {
    const defaults = {
      avatar: 'https://res.cloudinary.com/dlkr7fot9/image/upload/v1/brain-training/defaults/avatar.png',
      achievement: 'https://res.cloudinary.com/dlkr7fot9/image/upload/v1/brain-training/defaults/achievement.png',
      game: 'https://res.cloudinary.com/dlkr7fot9/image/upload/v1/brain-training/defaults/game.png',
    };

    return {
      url: defaults[type as keyof typeof defaults] || defaults.avatar,
      publicId: `brain-training/defaults/${type}`,
      width: 200,
      height: 200,
    };
  }

  /**
   * 预加载图片
   */
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }
}

// 导出单例
export const cloudinary = new CloudinaryService();