import './Connection';
import mongoose, { Schema } from 'mongoose';

const typeSchema = new Schema({
  generation: Number,
  name: String,
  attackSuperEffective: [String],
  attackResistance: [String],
  attackImmune: [String],
  defenseSuperEffective: [String],
  defenseResistance: [String],
  defenseImmune: [String],
});

export interface TypeType {
  generation: number;
  name: string;
  attackSuperEffective: string[];
  attackResistance: string[];
  attackImmune: string[];
  defenseSuperEffective: string[];
  defenseResistance: string[];
  defenseImmune: string[];
}

export default mongoose.models.Type || mongoose.model('Type', typeSchema);
