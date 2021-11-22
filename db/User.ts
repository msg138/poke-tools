import mongoose, { Schema } from 'mongoose';

// Todo may need to involve schema from './Pokemon';
const teamMemberSchema = new Schema({
  id: Number,
  name: String,
  level: {
    type: Number,
    default: 1,
  },
});

export interface TeamMemberType {
  id: number;
  name: string;
}

const teamSettingsSchema = new Schema({
  hideUncaughtImage: {
    type: Boolean,
    default: false,
  },
});

export interface TeamSettingsType {
  hideUncaughtImage: boolean;
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
