import mongoose, { Schema } from 'mongoose';

const abilitySchema = new Schema({
  hidden: Boolean,
  slot: Number,
  ability: {
    name: String,
    effects: [String],
  },
});

export interface AbilityType {
  hidden: boolean;
  slot: number;
  ability: {
    name: string;
    effects: string[];
  };
}

const statSchema = new Schema({
  base: Number,
  effort: Number,
  stat: String,
});

export interface StatType {
  base: number;
  effort: number;
  stat: string;
}

const typeSchema = new Schema({
  slot: Number,
  type: {
    type: String,
  },
});

export interface TypeType {
  slot: number;
  type: string;
}

const moveSchema = new Schema({
  name: String,
  accuracy: Number,
  effectChance: Number,
  pp: Number,
  priority: Number,
  power: Number,
  // 'physical' | 'special'
  damageType: String,
  meta: Object,
  // 'level-up' | 'tutor' | 'machine'
  learnMethod: String,
  learnLevel: {
    type: Number,
    default: 0,
  },
});

export interface MoveType {
  name: string;
  accuracy: number;
  effectChance: number | null;
  pp: number;
  priority: number;
  power: number;
  damageType: 'physical' | 'special';
  meta: object;
  learnMethod: string;
  learnLevel: number;
}

const locationSchema = new Schema({
  id: Number,
  keyName: String,
  name: String,
});

export interface LocationType {
  id: number;
  keyName: string;
  name: string;
}

const encounterSchema = new Schema({
  minLevel: Number,
  maxLevel: Number,
  chance: Number,
  maxChance: Number,
  location: locationSchema,
  time: String,
  method: String,
  generation: Number,
  conditions: [String],
});

export interface EncounterType {
  minLevel: number;
  maxLevel: number;
  chance: number;
  maxChance: number;
  location: LocationType;
  time: string;
  method: string;
  generation: number;
  conditions: string[];
}

const pokemonImageSchema = new Schema({
  art: String,
  default: String,
  shiny: String,
});

export interface PokemonImageType {
  art: string;
  default: string;
  shiny: string;
}

const pokemonSchema = new Schema({
  id: Number,
  generation: Number,
  name: String,
  baseExperience: Number,
  height: Number,
  order: Number,
  weight: Number,
  image: pokemonImageSchema,
  abilities: [abilitySchema],
  stats: [statSchema],
  moves: [moveSchema],
  types: [typeSchema],
  encounters: [encounterSchema],
});

export interface PokemonType {
  id: number;
  generation: number;
  name: string;
  baseExperience: number;
  height: number;
  order: number;
  weight: number;
  image: PokemonImageType;
  abilities: AbilityType[];
  stats: StatType[];
  moves: MoveType[];
  types: TypeType[];
  encounters: EncounterType[];
}

export default mongoose.models.Pokemon || mongoose.model('Pokemon', pokemonSchema);
