/**
 * Repository 基础架构
 * 
 * 为什么需要 Repository 模式？
 * 1. 数据访问逻辑与业务逻辑分离
 * 2. 统一的数据操作接口
 * 3. 便于切换存储方案（localStorage -> IndexedDB -> 云端）
 * 4. 集中化的数据验证和转换
 */

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: Record<string, any>;
}

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findOne(query: Partial<T>): Promise<T | null>;
  findMany(query: QueryOptions): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(query?: Partial<T>): Promise<number>;
}

export abstract class BaseRepository<T extends { id: string }> implements Repository<T> {
  protected abstract storageKey: string;
  
  /**
   * 获取所有数据
   */
  protected async getAllData(): Promise<T[]> {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to parse ${this.storageKey} data:`, error);
      return [];
    }
  }
  
  /**
   * 保存所有数据
   */
  protected async saveAllData(data: T[]): Promise<void> {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  /**
   * 生成唯一 ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 添加时间戳
   */
  protected addTimestamps<K>(data: K): K & { createdAt: Date; updatedAt: Date } {
    const now = new Date();
    return {
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * 更新时间戳
   */
  protected updateTimestamp<K>(data: K): K & { updatedAt: Date } {
    return {
      ...data,
      updatedAt: new Date()
    };
  }
  
  async findById(id: string): Promise<T | null> {
    const data = await this.getAllData();
    return data.find(item => item.id === id) || null;
  }
  
  async findOne(query: Partial<T>): Promise<T | null> {
    const data = await this.getAllData();
    
    return data.find(item => {
      return Object.entries(query).every(([key, value]) => {
        return (item as any)[key] === value;
      });
    }) || null;
  }
  
  async findMany(options: QueryOptions = {}): Promise<T[]> {
    let data = await this.getAllData();
    
    // 应用 where 条件
    if (options.where) {
      data = data.filter(item => {
        return Object.entries(options.where!).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });
    }
    
    // 应用排序
    if (options.orderBy) {
      data.sort((a, b) => {
        const aValue = (a as any)[options.orderBy!];
        const bValue = (b as any)[options.orderBy!];
        
        if (options.orderDirection === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    // 应用分页
    if (options.offset !== undefined) {
      data = data.slice(options.offset);
    }
    
    if (options.limit !== undefined) {
      data = data.slice(0, options.limit);
    }
    
    return data;
  }
  
  async create(data: Omit<T, 'id'>): Promise<T> {
    const allData = await this.getAllData();
    
    const newItem = {
      ...data,
      id: this.generateId()
    } as T;
    
    const itemWithTimestamps = this.addTimestamps(newItem);
    allData.push(itemWithTimestamps as T);
    
    await this.saveAllData(allData);
    return itemWithTimestamps as T;
  }
  
  async update(id: string, data: Partial<T>): Promise<T> {
    const allData = await this.getAllData();
    const index = allData.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }
    
    const updatedItem = {
      ...allData[index],
      ...data,
      id // 确保 ID 不被覆盖
    };
    
    const itemWithTimestamp = this.updateTimestamp(updatedItem);
    allData[index] = itemWithTimestamp as T;
    
    await this.saveAllData(allData);
    return itemWithTimestamp as T;
  }
  
  async delete(id: string): Promise<boolean> {
    const allData = await this.getAllData();
    const filteredData = allData.filter(item => item.id !== id);
    
    if (filteredData.length === allData.length) {
      return false;
    }
    
    await this.saveAllData(filteredData);
    return true;
  }
  
  async count(query?: Partial<T>): Promise<number> {
    if (!query) {
      const data = await this.getAllData();
      return data.length;
    }
    
    const filtered = await this.findMany({ where: query });
    return filtered.length;
  }
  
  /**
   * 批量创建
   */
  async createMany(items: Omit<T, 'id'>[]): Promise<T[]> {
    const allData = await this.getAllData();
    
    const newItems = items.map(item => {
      const newItem = {
        ...item,
        id: this.generateId()
      } as T;
      
      return this.addTimestamps(newItem) as T;
    });
    
    allData.push(...newItems);
    await this.saveAllData(allData);
    
    return newItems;
  }
  
  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    await this.saveAllData([]);
  }
}