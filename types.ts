/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AbilityType = 'raza' | 'objeto' | 'clase' | 'hechizo' | 'dnd' | 'otro';

export interface Column {
  id: string;
  type: AbilityType;
  customTypeLabel?: string; // Used if type is 'otro'
  spellLevel?: number;      // 1-9 if type is 'hechizo'
  name: string;
  maxUses: number;
  currentUses: number;
  representation: 'cubos' | 'numerico';
  recovery: 'corto' | 'largo' | 'turno' | 'dm';
}

export interface CharacterState {
  characterName: string;
  columns: Column[];
}
