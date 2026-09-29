import { Document, Model } from 'mongoose';
import { IBaseRepository } from '../interfaces/base-repository.interface';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { NotFoundException } from '@nestjs/common';

function isObjectId(value: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export abstract class BaseRepository<
  T extends Document,
> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(createDto: any): Promise<T> {
    const createdEntity = new this.model(createDto);
    return createdEntity.save() as unknown as Promise<T>;
  }

  async findAll(
    queryDto: PaginationQueryDto = {},
    searchableFields: string[] = ['name', 'title'],
    additionalFilter: Record<string, any> = {},
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filter,
    } = queryDto || {};

    const queryConditions: Record<string, any>[] = [];

    // Combine additional static filters
    if (additionalFilter && Object.keys(additionalFilter).length > 0) {
      queryConditions.push(additionalFilter);
    }

    // Parse JSON filter if passed as string
    if (filter) {
      try {
        const parsedFilter =
          typeof filter === 'string' ? JSON.parse(filter) : filter;
        queryConditions.push(parsedFilter);
      } catch {
        // Ignore JSON parse errors for non-JSON filter strings
      }
    }

    // Add regex search across searchable fields
    if (search && searchableFields.length > 0) {
      const searchRegex = new RegExp(search, 'i');
      const searchConditions = searchableFields.map((field) => ({
        [field]: searchRegex,
      }));
      queryConditions.push({ $or: searchConditions });
    }

    const finalQuery: Record<string, any> =
      queryConditions.length > 0 ? { $and: queryConditions } : {};

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(1000, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const sortDirection =
      String(sortOrder).toLowerCase() === 'asc' || String(sortOrder) === '1' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortDirection };

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedQ}`, 'i');

      const [allDocs, total] = await Promise.all([
        this.model.find(finalQuery).lean().exec(),
        this.model.countDocuments(finalQuery).exec(),
      ]);

      const scored = (allDocs as any[]).map((doc) => {
        let score = 0;

        const titleStr = String(doc.title || doc.name || '').toLowerCase();
        const slugStr = String(doc.slug || doc.targetUrl || '').toLowerCase();

        if (titleStr === q || slugStr === q) {
          score += 2000;
        } else if (titleStr.startsWith(q) || slugStr.startsWith(q)) {
          score += 1000;
        } else if (wordBoundaryRegex.test(titleStr) || wordBoundaryRegex.test(slugStr)) {
          score += 600;
        } else if (titleStr.includes(q) || slugStr.includes(q)) {
          score += 400;
        }

        searchableFields.forEach((field) => {
          const rawVal = doc[field];
          if (typeof rawVal === 'string') {
            const val = rawVal.toLowerCase();
            const cleanVal = val.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

            if (val === q) score += 500;
            else if (val.startsWith(q)) score += 300;
            else if (wordBoundaryRegex.test(cleanVal)) score += 150;
            else if (cleanVal.includes(q)) score += 50;
          }
        });

        return { doc, score };
      });

      scored.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (a.doc.order !== undefined && b.doc.order !== undefined && a.doc.order !== b.doc.order) {
          return a.doc.order - b.doc.order;
        }
        const valA = a.doc[sortBy];
        const valB = b.doc[sortBy];
        if (valA < valB) return -1 * sortDirection;
        if (valA > valB) return 1 * sortDirection;
        return 0;
      });

      const paginatedDocs = scored.slice(skip, skip + limitNum).map((s) => s.doc);
      const totalPages = Math.ceil(total / limitNum) || 1;

      return {
        items: paginatedDocs as unknown as T[],
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      };
    }

    const [items, total] = await Promise.all([
      this.model
        .find(finalQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      this.model.countDocuments(finalQuery).exec(),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      items: items as unknown as T[],
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };
  }

  async findById(id: string): Promise<T> {
    const filter = isObjectId(id) ? { _id: id } : { publicId: id };
    const entity = await this.model.findOne(filter).lean().exec();
    if (!entity) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    return entity as unknown as T;
  }

  async update(id: string, updateDto: any): Promise<T> {
    const filter = isObjectId(id) ? { _id: id } : { publicId: id };
    const { _id, id: _dummyId, createdAt, updatedAt, __v, ...cleanDto } = updateDto || {};
    const updatedEntity = await this.model
      .findOneAndUpdate(filter, cleanDto, {
        returnDocument: 'after',
        runValidators: false,
      })
      .lean()
      .exec();
    if (!updatedEntity) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    return updatedEntity as unknown as T;
  }

  async delete(id: string): Promise<T> {
    const filter = isObjectId(id) ? { _id: id } : { publicId: id };
    const deletedEntity = await this.model.findOneAndDelete(filter).lean().exec();
    if (!deletedEntity) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    return deletedEntity as unknown as T;
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
