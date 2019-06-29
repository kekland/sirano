import { DatastoreAdapter } from './adapter';
import { Model } from '../../model/model';
import levelup, { LevelUp } from 'levelup';
import leveldown from 'leveldown';
import EncodingDown from 'encoding-down';
import { join } from 'path';
import { ModelIterable, LevelIterator } from '../interfaces/model.iterator';
import { plainToClass, classToPlain } from 'class-transformer';
import { ClassType } from '../interfaces/class.type';

export class LevelDbAdapter<T extends Model<T>> implements DatastoreAdapter<T> {
  private name: string;
  private type: ClassType<T>;
  private level: LevelUp<EncodingDown<string, any>>;

  convertToClass(item: object): T {
    return plainToClass(this.type, item)
  }

  async get(id: string): Promise<T | null> {
    try {
      const item: object = await this.level.get(id)
      const converted = this.convertToClass(item)
      return converted
    }
    catch (e) {
      return null
    }
  }

  async put(item: T): Promise<T> {
    if (item.hasMetadata()) {
      const plain = classToPlain(item)
      await this.level.put(item.meta.id, plain)
      return item
    }
    else {
      throw Error('Item has no metadata')
    }
  }

  async remove(id: string): Promise<T | null> {
    const item = await this.get(id)
    if (item == null) {
      return null
    }
    await this.level.del(id)
    return item
  }

  *stream(): Iterable<ModelIterable<T>> {
    const stream = this.level.createReadStream()
    while (stream.readable) {
      const item = stream.read(1)
      console.log(item)
      return;
    }
  }

  constructor(type: ClassType<T>, options: { name: string, directory: string }) {
    this.type = type
    this.name = options.name

    this.level = levelup(EncodingDown<string, any>(
      leveldown(join(options.directory, options.name)),
      { valueEncoding: 'json' }
    ))
  }
}