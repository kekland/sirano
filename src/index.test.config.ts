import rimraf from 'rimraf'
import { LevelDbAdapter } from './lapisdb/tests/leveldb.adapter.test'
import { Datastore, Model } from '.'
import { DatastoreManager } from './lapisdb/datastore/datastore.manager';

/** @ignore */
export class Human {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}

/** @ignore */
export class Planet extends Model<Planet> {
  name: string;
  index: number;
  people: Human[];

  constructor(name: string, index: number) {
    super(Planet)
    this.name = name
    this.index = index
    this.people = []
  }

  public addHuman() {
    this.people.push(new Human(`Citizen of planet ${this.name} number ${this.people.length + 1}`, 0))
  }

  public age() {
    this.people.forEach(human => human.age += 1)
  }
}

export let testStore: Datastore<Planet>

beforeEach(async () => {
  testStore = new Datastore<Planet>('test', Planet, new LevelDbAdapter(Planet, { name: 'test', directory: './database' }))
  DatastoreManager.register(testStore)
  const items = await testStore.getItems()
  for (const item of items) {
    await item.delete()
  }
})

afterEach(async () => {
  await testStore.adapter.close()
})

export const testCreateRandomPlanets = async (push: boolean = false) => {
  const data: Planet[] = []
  for (let i = 0; i < 100; i++) {
    data.push(new Planet(`Planet ${i}`, i))
  }

  if (push) {
    for (const item of data) {
      await item.save()
    }
  }

  return data
}
