import { Model } from '../../model/model';
import { ModelIterable } from '../interfaces/model.iterator';

export abstract class DatastoreAdapter<T extends Model<T>> {
  abstract async get(id: string): Promise<T>;
  abstract async put(id: string, item: T): Promise<T>;
  abstract async remove(id: string): Promise<T>;
  abstract stream(): Iterable<ModelIterable<T>>;
}