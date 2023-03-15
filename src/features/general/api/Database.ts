import Dexie, { Table } from 'dexie';

export interface PokemonAbility {
    // TODO type out from endpoint.
    name: string;
}

export interface PokemonMove {
    // TODO type out from endpoint.
    name: string;
}

export interface PokemonStat {
    // TODO type out from endpoint.
    name: string;
    base_stat: number;
    effort: number;
}

export interface PokemonType {
    // TODO type out from endpoint.
    name: string;
}

export interface PokemonInterface {
    abilities: PokemonAbility;
    base_experience: number;
    height: number;
    id: number;
    // TODO type this better.
    encounters?: unknown;
    moves: Array<PokemonMove>;
    name: string;
    order: number;
    stats: Array<PokemonStat>;
    types: Array<PokemonType>;
}
// TODO Potentially create a partial pokemon interface to not make assumptions.

export interface DBIndex {
    type: string;
    key: string;
    values: Array<string | number>;
    ready: 'yes' | 'no';
    id?: number;
}

export interface DatabaseProgress {
    max: number;
    completed: number;
    averageTime: number;
    estimatedRemaining: number;
}

export interface SettingInterface {
    id: number;
    name: string;
    value: string | number;
}

export interface DatabaseActionOptions {
    onProgressUpdate?: (progress: DatabaseProgress) => void;
}

const performRequest = async (path: string) => {
    const request = await fetch(`https://pokeapi.co/api/v2${path}`);
    return request.json();
};

class Database extends Dexie {
    pokemon!: Table<PokemonInterface, number>;

    dbIndex!: Table<DBIndex, number>;

    settings!: Table<SettingInterface, number>;

    constructor() {
        super('poketools');

        this.version(1.1).stores({
            pokemon: '++id, name, types',
            dbIndex: '++id, type, key, values, ready',
            settings: '++id, name, value',
        });
    }

    async reset() {
        this.pokemon.clear();
    }

    async isReady(type?: string) {
        if ((await this.dbIndex.count()) === 0) {
            return false;
        }
        if (!type) {
            return !(await this.dbIndex.where('ready').equals('no'));
        }
        return !!(await this.dbIndex.where('type').equals(type).and((dbIndex) => dbIndex.ready === 'yes').first());
    }

    async setupPokemon(options?: DatabaseActionOptions) {
        if ((await this.isReady('pokemon'))) {
            return false;
        }
        let dbIndex = await this.dbIndex.where('type').equals('pokemon').first();
        const pokemons = await performRequest('/pokemon?limit=10000&offset=0') as { count: number; results: Array<PokemonInterface>; };
        if (!dbIndex) {
            dbIndex = {
                type: 'pokemon',
                key: 'name',
                values: pokemons.results.map((pokemon) => pokemon.name),
                ready: 'no',
            };
        }
        await this.dbIndex.put(dbIndex!);
        let fetchedPokemons: Array<PokemonInterface> = [];
        let finished = 0;
        let times: Array<number> = [];
        for (const pokemon of pokemons.results) {
            const start = Date.now();
            const existingPokemon = await this.pokemon.where('name').equals(pokemon.name).first();
            console.log('pokemon', pokemon.name, existingPokemon);
            if (!!existingPokemon) {
                const pokemonDetails = await performRequest(`/pokemon/${pokemon.name}`);
                fetchedPokemons.push(pokemonDetails);
            }
            times.push(Date.now() - start);
            if (finished % 10 === 0) {
                await this.transaction('rw', this.pokemon, () => {
                    this.pokemon.bulkPut(fetchedPokemons);
                });
                fetchedPokemons = [];
            }
            finished += 1;
            if (options?.onProgressUpdate) {
                const averageTime = times.reduce((total, time) => total + time, 0) / times.length;
                options.onProgressUpdate({
                    max: pokemons.count,
                    completed: finished,
                    averageTime,
                    estimatedRemaining: averageTime * (pokemons.count - finished),
                })
            }
        }
        await this.transaction('rw', this.pokemon, this.dbIndex, () => {
            dbIndex!.ready = 'yes';
            this.pokemon.bulkPut(fetchedPokemons);
            this.dbIndex.put(dbIndex!);
        });
    }

    async setupAll(options?: Record<string, DatabaseActionOptions>) {
        await this.setupPokemon(options?.pokemon);
    }
}

export default Database;
