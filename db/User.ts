import mongoose, { Schema } from 'mongoose';

const evIvSchema = new Schema({
  hp: {
    type: Number,
    default: 0,
  },
  attack: {
    type: Number,
    default: 0,
  },
  defense: {
    type: Number,
    default: 0,
  },
  specialAttack: {
    type: Number,
    default: 0,
  },
  specialDefense: {
    type: Number,
    default: 0,
  },
  speed: {
    type: Number,
    default: 0,
  },
});

export interface EvIvType {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

const teamMemberSchema = new Schema({
  id: Number,
  name: String,
  level: {
    type: Number,
    default: 1,
  },
  ev: {
    type: evIvSchema,
  },
  iv: {
    type: evIvSchema,
  },
});

export interface TeamMemberType {
  id: number;
  name: string;
  level: number;
  ev: EvIvType;
  iv: EvIvType;
}

const shinyCountSchema = new Schema({
  count: Object,
  deleted: [String],
});

export interface ShinyCountType {
  count: Record<string, number>;
  deleted: string[];
}

const teamSettingsSchema = new Schema({
  hideUncaughtImage: {
    type: Boolean,
    default: false,
  },
  shinyCount: shinyCountSchema,
});

export interface TeamSettingsType {
  hideUncaughtImage: boolean;
  shinyCount: ShinyCountType;
}

const teamSchema = new Schema({
  name: String,
  generation: Number,
  members: [teamMemberSchema],
  settings: teamSettingsSchema,
});

export interface TeamType {
  name: string;
  generation: number;
  members: TeamMemberType[];
}

const userSchema = new Schema({
  username: String,
  password: String,
  teams: [teamSchema],
  currentTeam: Number,
});

export interface UserType {
  username: string;
  password: string;
  teams: TeamType[];
  currentTeam: number;
}

userSchema.methods.getCurrentTeam = function() {
  return this.teams[this.currentTeam];
};

export default mongoose.models.User || mongoose.model('User', userSchema);
