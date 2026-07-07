/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Column, AbilityType } from './types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Shield, 
  Sparkles, 
  Sword, 
  Hourglass, 
  Moon, 
  RotateCcw, 
  Download, 
  User, 
  HelpCircle, 
  AlertTriangle,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  X,
  RefreshCw,
  Award
} from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [characterName, setCharacterName] = useState<string>('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Name Input State for Splash
  const [tempName, setTempName] = useState<string>('');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);

  // Form State for Add/Edit
  const [formType, setFormType] = useState<AbilityType>('dnd');
  const [formCustomType, setFormCustomType] = useState<string>('');
  const [formSpellLevel, setFormSpellLevel] = useState<number>(1);
  const [formName, setFormName] = useState<string>('');
  const [formMaxUses, setFormMaxUses] = useState<number>(1);
  const [formRepresentation, setFormRepresentation] = useState<'cubos' | 'numerico'>('cubos');
  const [formRecovery, setFormRecovery] = useState<'corto' | 'largo' | 'turno' | 'dm'>('corto');

  // Custom confirmation modals state to bypass iframe blocks
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Rest Modal state
  const [isRestOpen, setIsRestOpen] = useState<boolean>(false);

  // Edit Name Modal state
  const [isEditNameOpen, setIsEditNameOpen] = useState<boolean>(false);
  const [editNameValue, setEditNameValue] = useState<string>('');

  // Native Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // --- INITIALIZATION & PERSISTENCE ---
  useEffect(() => {
    // Load from localStorage
    const savedName = localStorage.getItem('dnd_character_name');
    const savedColumns = localStorage.getItem('dnd_columns');

    if (savedName) {
      setCharacterName(savedName);
      setTempName(savedName);
      setEditNameValue(savedName);
      setIsInitialized(true);
    }
    
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (e) {
        console.error("Error reading columns from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage automatically on changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('dnd_character_name', characterName);
      localStorage.setItem('dnd_columns', JSON.stringify(columns));
    }
  }, [characterName, columns, isInitialized]);

  // --- HANDLERS ---
  const handleStartAdventure = (e: React.FormEvent) => {
    e.preventDefault();
    const name = tempName.trim() || 'Héroe Desconocido';
    
    // Set default columns as requested
    const defaultColumns: Column[] = [
      {
        id: 'default-reaccion',
        type: 'dnd',
        name: 'Reacción',
        maxUses: 1,
        currentUses: 1,
        representation: 'cubos',
        recovery: 'turno'
      },
      {
        id: 'default-inspiracion',
        type: 'dnd',
        name: 'Inspiración',
        maxUses: 3,
        currentUses: 3,
        representation: 'cubos',
        recovery: 'dm'
      }
    ];

    setCharacterName(name);
    setEditNameValue(name);
    setColumns(defaultColumns);
    setIsInitialized(true);
  };

  // Restores all columns based on rest type
  const handlePerformRest = (restType: 'corto' | 'largo') => {
    const updated = columns.map(col => {
      if (restType === 'largo') {
        // Long rest restores EVERYTHING
        return { ...col, currentUses: col.maxUses };
      } else {
        // Short rest restores only marked 'corto'
        if (col.recovery === 'corto') {
          return { ...col, currentUses: col.maxUses };
        }
      }
      return col;
    });
    setColumns(updated);
    setIsRestOpen(false);
  };

  // Restores all columns with recovery 'turno'
  const handleCombatTurn = () => {
    const updated = columns.map(col => {
      if (col.recovery === 'turno') {
        return { ...col, currentUses: col.maxUses };
      }
      return col;
    });
    setColumns(updated);
  };

  // Adjust uses manually
  const adjustUses = (id: string, amount: number) => {
    setColumns(prev => prev.map(col => {
      if (col.id === id) {
        const newValue = Math.min(col.maxUses, Math.max(0, col.currentUses + amount));
        return { ...col, currentUses: newValue };
      }
      return col;
    }));
  };

  // Direct toggle by clicking visual cubes
  const handleToggleCubeIndex = (columnId: string, cubeIndex: number, isCurrentlyFilled: boolean) => {
    setColumns(prev => prev.map(col => {
      if (col.id === columnId) {
        // If they click on a filled cube, we spend up to that index (decreasing count)
        // If they click on an empty cube, we restore up to that index (increasing count)
        const targetUses = isCurrentlyFilled ? cubeIndex : cubeIndex + 1;
        return { ...col, currentUses: targetUses };
      }
      return col;
    }));
  };

  // Open modal for Adding
  const openAddModal = () => {
    setEditingColumnId(null);
    setFormType('dnd');
    setFormCustomType('');
    setFormSpellLevel(1);
    setFormName('');
    setFormMaxUses(1);
    setFormRepresentation('cubos');
    setFormRecovery('corto');
    setIsAddEditOpen(true);
  };

  // Open modal for Editing
  const openEditModal = (col: Column) => {
    setEditingColumnId(col.id);
    setFormType(col.type);
    setFormCustomType(col.customTypeLabel || '');
    setFormSpellLevel(col.spellLevel || 1);
    setFormName(col.name);
    setFormMaxUses(col.maxUses);
    setFormRepresentation(col.representation);
    setFormRecovery(col.recovery);
    setIsAddEditOpen(true);
  };

  // Handle spell slot requirements dynamically when type changes
  useEffect(() => {
    if (formType === 'hechizo') {
      setFormName(`Nivel ${formSpellLevel}`);
      setFormRepresentation('cubos'); // Force cubos
    }
  }, [formType, formSpellLevel]);

  // Handle Form Submit
  const handleSaveColumn = (e: React.FormEvent) => {
    e.preventDefault();

    let finalName = formName.trim();
    if (formType === 'hechizo') {
      finalName = `Espacio de Hechizo Nivel ${formSpellLevel}`;
    } else if (!finalName) {
      finalName = 'Habilidad';
    }

    const columnData: Column = {
      id: editingColumnId || `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: formType,
      customTypeLabel: formType === 'otro' ? formCustomType.trim() || 'Otro' : undefined,
      spellLevel: formType === 'hechizo' ? formSpellLevel : undefined,
      name: finalName,
      maxUses: Number(formMaxUses) || 1,
      currentUses: editingColumnId 
        ? Math.min(Number(formMaxUses), (columns.find(c => c.id === editingColumnId)?.currentUses ?? Number(formMaxUses)))
        : Number(formMaxUses), // New columns start fully charged
      representation: formType === 'hechizo' ? 'cubos' : formRepresentation,
      recovery: formRecovery
    };

    if (editingColumnId) {
      // Edit existing
      setColumns(prev => prev.map(c => c.id === editingColumnId ? columnData : c));
    } else {
      // Add new
      setColumns(prev => [...prev, columnData]);
    }

    setIsAddEditOpen(false);
  };

  // Delete Column
  const handleDeleteColumn = (id: string) => {
    setDeleteConfirmId(id);
  };

  // Clear/Reset App
  const handleResetApp = () => {
    setIsResetConfirmOpen(true);
  };

  // Save Name Change
  const handleSaveNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = editNameValue.trim();
    if (clean) {
      setCharacterName(clean);
      setIsEditNameOpen(false);
    }
  };

  // --- DRAG AND DROP REORDER ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const reordered = [...columns];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, removed);
    setColumns(reordered);
    setDraggedIndex(null);
  };

  const moveColumn = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    const reordered = [...columns];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setColumns(reordered);
  };

  // --- STANDALONE HTML GENERATION & DOWNLOAD ---
  const handleExportHtml = () => {
    // Generate JSON strings for columns and name to inject as initial template states
    const serializedName = JSON.stringify(characterName);
    const serializedColumns = JSON.stringify(columns);

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D&D 5e - Tracker de Habilidades: ${characterName.replace(/"/g, '&quot;')}</title>
    <!-- Tailwind CSS v3 CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0c0d10;
            background-image: radial-gradient(circle at center, #1a1c23 0%, #0c0d10 100%);
            color: #e0e0e0;
        }
        .font-serif {
            font-family: 'Cinzel', Georgia, serif;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
        .dnd-card {
            background-color: #16181d;
            border: 1px solid #2d3139;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dnd-card:hover {
            border-color: #c5a05940;
            box-shadow: 0 0 20px rgba(197, 160, 89, 0.08);
        }
        .dnd-btn-gold {
            background: linear-gradient(135deg, #c5a059 0%, #8a6d3b 100%);
            border: 1px solid #c5a05950;
            color: #0c0d10;
            text-shadow: 0 1px 1px rgba(255,255,255,0.2);
            transition: all 0.2s ease;
        }
        .dnd-btn-gold:hover {
            background: linear-gradient(135deg, #d5b069 0%, #9a7d4b 100%);
            border-color: #d5b06980;
            transform: translateY(-1px);
        }
        .dnd-input {
            background-color: #0c0d10;
            border: 1px solid #2d3139;
            color: #e0e0e0;
        }
        .dnd-input:focus {
            border-color: #c5a059;
            outline: none;
            box-shadow: 0 0 5px rgba(197, 160, 89, 0.3);
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #0c0d10;
        }
        ::-webkit-scrollbar-thumb {
            background: #2d3139;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #c5a059;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col justify-between selection:bg-[#c5a059]/30 selection:text-white">

    <!-- SPLASH SCREEN -->
    <div id="splashScreen" class="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0d10] px-4">
        <div class="max-w-md w-full bg-[#14161b] border border-[#2d3139] rounded-xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div class="absolute -top-12 -left-12 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl"></div>
            <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl"></div>
            
            <!-- d20 Crest representation -->
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#c5a059]/20 to-[#8a6d3b]/40 rounded-2xl flex items-center justify-center border border-[#c5a059]/40 shadow-inner">
                <svg class="w-12 h-12 text-[#c5a059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                </svg>
            </div>
            
            <h1 class="font-serif text-3xl font-bold text-[#c5a059] tracking-wider mb-2">ARCHIVISTA D&amp;D</h1>
            <p class="text-stone-400 text-sm mb-6">Tracker interactivo de Habilidades, Rasgos y Espacios de Conjuro</p>
            
            <form id="startForm" class="space-y-4">
                <div class="text-left">
                    <label class="block text-stone-300 font-serif text-sm mb-1.5 uppercase tracking-wider">Nombre de tu Personaje</label>
                    <input type="text" id="characterNameInput" class="w-full dnd-input p-3 rounded-lg text-lg focus:ring-1 focus:ring-[#c5a059] font-serif" placeholder="Ej. Elminster Pendragon" required>
                </div>
                
                <button type="submit" class="w-full dnd-btn-gold p-3.5 rounded-lg font-serif text-base font-bold tracking-widest cursor-pointer flex items-center justify-center gap-2">
                    EMPEZAR AVENTURA
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
            </form>
        </div>
    </div>

    <!-- MAIN APP WRAPPER -->
    <div id="appContainer" class="hidden flex-1 flex flex-col">
        
        <!-- HEADER -->
        <header class="bg-[#14161b] border-b border-[#2d3139] shadow-2xl">
            <div class="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                
                <!-- Left side name -->
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-[#c5a059] to-[#8a6d3b] rounded-lg flex items-center justify-center text-[#0c0d10] font-bold text-xl shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                        <span id="charFirstLetter">E</span>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h2 id="displayCharName" class="font-serif text-2xl font-bold text-[#c5a059] tracking-wider leading-none">Cargando...</h2>
                            <button onclick="openEditNameModal()" class="text-stone-500 hover:text-[#c5a059] p-1 transition-colors" title="Editar Nombre">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                </svg>
                              </button>
                          </div>
                        <p class="text-[#6b7280] text-xs uppercase tracking-widest font-semibold italic mt-1">Héroe de D&amp;D 5ª Edición — Rastreador Activo</p>
                    </div>
                </div>

                <!-- Right side controls -->
                <div class="flex flex-wrap items-center gap-2.5">
                    <button onclick="openAddModal()" class="dnd-btn-gold px-4 py-2 rounded-lg font-serif text-sm font-bold tracking-wider flex items-center gap-1.5 cursor-pointer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                        NUEVA HABILIDAD
                    </button>
                    
                    <button onclick="openRestModal()" class="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-[#c5a059] px-4 py-2 rounded-lg font-serif text-sm font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        DESCANSAR
                    </button>
                    
                    <button onclick="performCombatTurn()" class="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-sky-400 hover:text-sky-300 px-4 py-2 rounded-lg font-serif text-sm font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer" title="Reiniciar habilidades de inicio de ronda o turno de combate">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7H19M4 9h5"/>
                        </svg>
                        INICIO DE RONDA
                    </button>
                    
                    <button onclick="resetApp()" class="bg-red-950/20 hover:bg-red-900/30 border border-red-800/40 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer" title="Reiniciar Personaje">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a3 3 0 003 3h10M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </header>

        <!-- MAIN CONTAINER -->
        <main class="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
            
            <!-- Empty state -->
            <div id="emptyState" class="hidden text-center py-20 max-w-md mx-auto">
                <svg class="w-16 h-16 text-stone-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 class="font-serif text-xl text-[#c5a059] mb-2">No tienes habilidades registradas</h3>
                <p class="text-stone-400 text-sm mb-6">Crea tu primera columna de rastreo usando el botón "+ Nueva Habilidad".</p>
                <button onclick="openAddModal()" class="dnd-btn-gold px-6 py-3 rounded-lg font-serif text-sm font-bold tracking-wider inline-flex items-center gap-1.5">
                    AÑADIR MI PRIMERA HABILIDAD
                </button>
            </div>

            <!-- Grid of Column Cards -->
            <div id="columnsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <!-- Javascript will inject cards here -->
            </div>
        </main>
    </div>

    <!-- MODAL: ADD / EDIT ABILITY -->
    <div id="addEditModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div class="bg-[#16181d] border-b border-[#2d3139] p-4 flex items-center justify-between">
                <h3 id="modalTitle" class="font-serif text-lg font-bold text-[#c5a059] tracking-wider uppercase">AÑADIR NUEVA HABILIDAD</h3>
                <button onclick="closeAddModal()" class="text-stone-400 hover:text-white p-1">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <form id="abilityForm" class="p-6 space-y-4">
                <input type="hidden" id="editColId">
                
                <!-- Skill Type -->
                <div>
                    <label class="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">Tipo de Habilidad</label>
                    <select id="formType" onchange="handleFormTypeChange()" class="w-full dnd-input p-2.5 rounded-lg text-sm font-serif">
                        <option value="raza">Raza (Rasgo Racial)</option>
                        <option value="objeto">Objeto Mágico</option>
                        <option value="clase">Clase (Rasgo de Clase)</option>
                        <option value="hechizo">Espacio de Hechizo</option>
                        <option value="dnd" selected>D&amp;D (Genérico)</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>

                <!-- Custom Type Label -->
                <div id="customTypeContainer" class="hidden">
                    <label class="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">Especificar Tipo</label>
                    <input type="text" id="formCustomType" class="w-full dnd-input p-2.5 rounded-lg text-sm" placeholder="Ej. Dote, Trasfondo">
                </div>

                <!-- Spell Level Selector -->
                <div id="spellLevelContainer" class="hidden">
                    <label class="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">Nivel de Hechizo (1-9)</label>
                    <select id="formSpellLevel" onchange="handleSpellLevelChange()" class="w-full dnd-input p-2.5 rounded-lg text-sm font-mono">
                        <option value="1">Nivel 1</option>
                        <option value="2">Nivel 2</option>
                        <option value="3">Nivel 3</option>
                        <option value="4">Nivel 4</option>
                        <option value="5">Nivel 5</option>
                        <option value="6">Nivel 6</option>
                        <option value="7">Nivel 7</option>
                        <option value="8">Nivel 8</option>
                        <option value="9">Nivel 9</option>
                    </select>
                </div>

                <!-- Ability Name -->
                <div>
                    <label class="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">Nombre de la Habilidad</label>
                    <input type="text" id="formName" class="w-full dnd-input p-2.5 rounded-lg text-sm" placeholder="Ej. Furia, Canalizar Divinidad, Imposición de Manos" required>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Max Uses -->
                    <div>
                        <label class="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">Usos Máximos</label>
                        <input type="number" id="formMaxUses" min="1" max="99" value="1" class="w-full dnd-input p-2.5 rounded-lg text-sm font-mono" required>
                    </div>

                    <!-- Recovery Time -->
                    <div>
                        <label class="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">Recuperación</label>
                        <select id="formRecovery" class="w-full dnd-input p-2.5 rounded-lg text-sm font-serif">
                            <option value="corto" selected>Descanso Corto</option>
                            <option value="largo">Descanso Largo</option>
                            <option value="turno">Inicio de ronda o turno de combate</option>
                            <option value="dm">Dungeon Master</option>
                        </select>
                    </div>
                </div>

                <!-- Representation -->
                <div>
                    <label class="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">Representación de Usos</label>
                    <select id="formRepresentation" class="w-full dnd-input p-2.5 rounded-lg text-sm font-serif">
                        <option value="cubos" selected>Cubos (Visuales)</option>
                        <option value="numerico">Contador Numérico Grande</option>
                    </select>
                    <p id="representationNote" class="text-stone-500 text-xs mt-1 hidden">*Para espacios de hechizo solo se permite la representación en cubos.</p>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#2d3139]">
                    <button type="button" onclick="closeAddModal()" class="bg-[#2d3139] hover:bg-[#3d424e] border border-[#404552] text-stone-300 px-4 py-2 rounded-lg font-serif text-xs tracking-wider cursor-pointer">
                        CANCELAR
                    </button>
                    <button type="submit" class="dnd-btn-gold px-5 py-2.5 rounded-lg font-serif text-xs font-bold tracking-widest cursor-pointer">
                        GUARDAR
                    </button>
                </div>
            </form>
        <!-- MODAL: REST -->
    <div id="restModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
        <div class="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div class="bg-[#16181d] border-b border-[#2d3139] p-4 flex items-center justify-between">
                <h3 class="font-serif text-lg font-bold text-[#c5a059] tracking-wider">REPOSAR Y RESTAURAR</h3>
                <button onclick="closeRestModal()" class="text-stone-400 hover:text-white p-1">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <div class="p-6 space-y-6">
                <p class="text-stone-300 text-sm text-center">Selecciona el tipo de descanso. Esto recargará los usos de tus habilidades automáticamente.</p>
                
                <div class="grid grid-cols-1 gap-4">
                    <!-- Short Rest Button -->
                    <button onclick="performRest('corto')" class="group text-left p-4 rounded-xl border border-[#2d3139] bg-[#0c0d10] hover:bg-[#16181d] hover:border-[#c5a059]/40 transition-all cursor-pointer flex items-center gap-4">
                        <div class="w-12 h-12 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-xl flex items-center justify-center text-[#c5a059] group-hover:bg-[#c5a059]/20 transition-all">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div>
                            <h4 class="font-serif font-bold text-[#c5a059] tracking-wide">Descanso Corto</h4>
                            <p class="text-stone-400 text-xs mt-0.5">Restaura habilidades que se recargan con Descanso Corto (como Canalizar Divinidad, Furia, etc.).</p>
                        </div>
                    </button>
                    
                    <!-- Long Rest Button -->
                    <button onclick="performRest('largo')" class="group text-left p-4 rounded-xl border border-[#2d3139] bg-[#0c0d10] hover:bg-[#16181d] hover:border-emerald-500/20 transition-all cursor-pointer flex items-center gap-4">
                        <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                            </svg>
                        </div>
                        <div>
                            <h4 class="font-serif font-bold text-emerald-400 tracking-wide">Descanso Largo</h4>
                            <p class="text-stone-400 text-xs mt-0.5">Restaura TODAS las habilidades del personaje (incluyendo espacios de conjuros y rasgos de descanso corto).</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL: EDIT NAME -->
    <div id="editNameModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
        <div class="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div class="bg-[#16181d] border-b border-[#2d3139] p-4 flex items-center justify-between">
                <h3 class="font-serif text-lg font-bold text-[#c5a059] tracking-wider uppercase">CAMBIAR NOMBRE</h3>
                <button onclick="closeEditNameModal()" class="text-stone-400 hover:text-white p-1">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <form id="editNameForm" class="p-6 space-y-4">
                <div>
                    <label class="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">Nuevo Nombre del Personaje</label>
                    <input type="text" id="newNameInput" class="w-full dnd-input p-2.5 rounded-lg text-sm font-serif" required>
                </div>
                <div class="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onclick="closeEditNameModal()" class="bg-[#2d3139] hover:bg-[#3d424e] border border-[#404552] text-stone-300 px-3 py-1.5 rounded-lg text-xs tracking-wider cursor-pointer">
                        CANCELAR
                    </button>
                    <button type="submit" class="dnd-btn-gold px-4 py-1.5 rounded-lg font-serif text-xs font-bold tracking-widest cursor-pointer">
                        CONFIRMAR
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL: CONFIRM DELETE -->
    <div id="deleteConfirmModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
        <div class="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
            <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 class="font-serif text-lg font-bold text-[#c5a059] tracking-wider uppercase mb-2">¿ELIMINAR HABILIDAD?</h3>
            <p id="deleteConfirmMessage" class="text-stone-400 text-xs mb-6 font-serif">¿Estás seguro de que deseas eliminar esta habilidad?</p>
            <input type="hidden" id="deleteColId">
            <div class="flex items-center justify-center gap-3">
                <button type="button" onclick="closeDeleteModal()" class="bg-[#2d3139] hover:bg-[#3d424e] border border-[#404552] text-stone-300 px-4 py-2 rounded-lg font-serif text-xs tracking-wider cursor-pointer">
                    CANCELAR
                </button>
                <button type="button" onclick="confirmDeleteColumn()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-serif text-xs font-bold tracking-widest cursor-pointer">
                    ELIMINAR
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL: CONFIRM RESET -->
    <div id="resetConfirmModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
        <div class="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
            <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 class="font-serif text-lg font-bold text-[#c5a059] tracking-wider uppercase mb-2">¿REINICIAR PERSONAJE?</h3>
            <p class="text-stone-400 text-xs mb-6 font-serif">¿Estás seguro de que deseas borrar todos los datos de tu personaje y empezar de nuevo? Se eliminarán todas tus habilidades y el nombre.</p>
            <div class="flex items-center justify-center gap-3">
                <button type="button" onclick="closeResetModal()" class="bg-[#2d3139] hover:bg-[#3d424e] border border-[#404552] text-stone-300 px-4 py-2 rounded-lg font-serif text-xs tracking-wider cursor-pointer">
                    CANCELAR
                </button>
                <button type="button" onclick="confirmResetApp()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-serif text-xs font-bold tracking-widest cursor-pointer">
                    REINICIAR
                </button>
            </div>
        </div>
    </div>

    <!-- FOOTER & MANUAL DE INSTRUCCIONES -->
    <footer class="bg-[#14161b] border-t border-[#2d3139] py-8 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center space-y-4">
            <div class="text-[#6b7280] text-xs font-serif uppercase tracking-widest">
                ARCHIVISTA D&amp;D 5E — CONSTRUIDO CON PASIÓN POR EL ROL
            </div>
            
            <!-- Instructions Panel -->
            <div class="max-w-3xl mx-auto text-left bg-[#0c0d10]/60 border border-[#2d3139] rounded-xl p-5 text-stone-400 text-xs space-y-2.5">
                <h4 class="font-serif text-[#c5a059] text-sm font-bold tracking-wide uppercase mb-1 flex items-center gap-1">
                    <svg class="w-4 h-4 text-[#c5a059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Instrucciones de Uso Rápido
                </h4>
                <p>1. <strong>Gastos Rápidos:</strong> Haz clic directamente en cualquiera de los cubos de uso visuales para vaciar o rellenar ese recurso con un solo toque.</p>
                <p>2. <strong>Ajustes Manuales:</strong> Utiliza los botones <strong class="text-[#c5a059]">+</strong> y <strong class="text-[#c5a059]">-</strong> de cada tarjeta para alterar el contador a tu gusto en cualquier dirección.</p>
                <p>3. <strong>Reordenación Inteligente:</strong> Mantén pulsada una tarjeta y arrástrala (Drag &amp; Drop) a otra posición de la cuadrícula para reordenarla. En dispositivos móviles, puedes pulsar en las pequeñas flechas laterales para moverlas.</p>
                <p>4. <strong>Descanso y Restauración:</strong> Pulsa el botón "Descansar" arriba a la derecha. El <strong>Descanso Corto</strong> recuperará automáticamente los rasgos que tengan dicha especificación; un <strong>Descanso Largo</strong> restaurará todas las habilidades y espacios de conjuros al 100%.</p>
                <p>5. <strong>Persistencia Garantizada:</strong> Los datos se guardan de forma instantánea y automática en el navegador utilizando <code class="font-mono bg-stone-900 px-1 rounded text-[#c5a059]">localStorage</code>. No perderás tu progreso al refrescar la página.</p>
            </div>
            
            <p class="text-[#6b7280] text-[10px] pt-2">Dungeons &amp; Dragons y D&amp;D son marcas registradas de Wizards of the Coast LLC. Este tracker no tiene afiliación oficial.</p>
        </div>
    </footer>

    <!-- CORE JAVASCRIPT LOGIC -->
    <script>
        // State variables initialized with serialized data from exporter or defaults
        let characterName = ${serializedName};
        let columns = ${serializedColumns};
        let draggedCardIndex = null;

        // Initialize state from localstorage if present
        const savedName = localStorage.getItem('dnd_local_character_name');
        const savedColumns = localStorage.getItem('dnd_local_columns');
        if (savedName) characterName = savedName;
        if (savedColumns) {
            try {
                columns = JSON.parse(savedColumns);
            } catch(e) {
                console.error(e);
            }
        }

        // DOM elements
        const splashScreen = document.getElementById('splashScreen');
        const appContainer = document.getElementById('appContainer');
        const displayCharName = document.getElementById('displayCharName');
        const columnsGrid = document.getElementById('columnsGrid');
        const emptyState = document.getElementById('emptyState');
        const startForm = document.getElementById('startForm');
        const characterNameInput = document.getElementById('characterNameInput');
        
        // Modal elements
        const addEditModal = document.getElementById('addEditModal');
        const abilityForm = document.getElementById('abilityForm');
        const modalTitle = document.getElementById('modalTitle');
        const editColId = document.getElementById('editColId');
        const formType = document.getElementById('formType');
        const formCustomType = document.getElementById('formCustomType');
        const customTypeContainer = document.getElementById('customTypeContainer');
        const spellLevelContainer = document.getElementById('spellLevelContainer');
        const formSpellLevel = document.getElementById('formSpellLevel');
        const formName = document.getElementById('formName');
        const formMaxUses = document.getElementById('formMaxUses');
        const formRecovery = document.getElementById('formRecovery');
        const formRepresentation = document.getElementById('formRepresentation');
        const representationNote = document.getElementById('representationNote');
        const restModal = document.getElementById('restModal');
        const editNameModal = document.getElementById('editNameModal');
        const newNameInput = document.getElementById('newNameInput');

        // Startup
        if (characterName) {
            startApp();
        }

        startForm.addEventListener('submit', (e) => {
            e.preventDefault();
            characterName = characterNameInput.value.trim() || 'Héroe Legendario';
            // Set initial defaults
            columns = [
                { id: 'def-reaccion', type: 'dnd', name: 'Reacción', maxUses: 1, currentUses: 1, representation: 'cubos', recovery: 'turno' },
                { id: 'def-inspiracion', type: 'dnd', name: 'Inspiración', maxUses: 3, currentUses: 3, representation: 'cubos', recovery: 'dm' }
            ];
            saveState();
            startApp();
        });

        function startApp() {
            splashScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            displayCharName.innerText = characterName;
            newNameInput.value = characterName;
            renderColumns();
        }

        function saveState() {
            localStorage.setItem('dnd_local_character_name', characterName);
            localStorage.setItem('dnd_local_columns', JSON.stringify(columns));
        }

        // Render Ability Cards
        function renderColumns() {
            columnsGrid.innerHTML = '';
            if (columns.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            }
            emptyState.classList.add('hidden');

            columns.forEach((col, index) => {
                const card = document.createElement('div');
                card.className = 'dnd-card rounded-xl p-5 relative overflow-hidden flex flex-col justify-between group cursor-grab';
                card.setAttribute('draggable', 'true');
                
                // Drag Events
                card.addEventListener('dragstart', (e) => {
                    draggedCardIndex = index;
                    card.classList.add('opacity-50');
                });
                card.addEventListener('dragover', (e) => {
                    e.preventDefault();
                });
                card.addEventListener('dragend', () => {
                    card.classList.remove('opacity-50');
                    draggedCardIndex = null;
                });
                card.addEventListener('drop', () => {
                    if (draggedCardIndex !== null && draggedCardIndex !== index) {
                        const temp = columns[draggedCardIndex];
                        columns.splice(draggedCardIndex, 1);
                        columns.splice(index, 0, temp);
                        saveState();
                        renderColumns();
                    }
                });

                // Get icon based on type
                let typeIcon = '';
                let typeLabel = '';
                switch (col.type) {
                    case 'raza':
                        typeIcon = '<svg class="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>';
                        typeLabel = 'Rasgo Racial';
                        break;
                    case 'objeto':
                        typeIcon = '<svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
                        typeLabel = 'Objeto Mágico';
                        if (col.name.toLowerCase().includes('espada') || col.name.toLowerCase().includes('baston') || col.name.toLowerCase().includes('daga')) {
                            typeIcon = '<svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l2-2m0 0l7-7m-7 7l-1 1.25M20 3h-4v4h4V3zM6 18l-3 3M6 18l3-3M6 18l1.25-1"/></svg>';
                        }
                        break;
                    case 'clase':
                        typeIcon = '<svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>';
                        typeLabel = 'Rasgo de Clase';
                        break;
                    case 'hechizo':
                        typeIcon = '<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>';
                        typeLabel = 'Espacio de Hechizo';
                        break;
                    case 'dnd':
                        typeIcon = '<svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>';
                        typeLabel = 'D&amp;D Genérico';
                        break;
                    default:
                        typeIcon = '<svg class="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
                        typeLabel = col.customTypeLabel || 'Otro';
                }

                let recoveryHtml = '';
                if (col.recovery === 'corto') {
                    recoveryHtml = '<span class="inline-flex items-center gap-0.5 text-[10px] text-[#c5a059] bg-[#c5a059]/10 px-1.5 py-0.5 rounded font-serif uppercase tracking-wider border border-[#c5a059]/25"><svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> D. Corto</span>';
                } else if (col.recovery === 'largo') {
                    recoveryHtml = '<span class="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded font-serif uppercase tracking-wider border border-emerald-500/20"><svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg> D. Largo</span>';
                } else if (col.recovery === 'turno') {
                    recoveryHtml = '<span class="inline-flex items-center gap-0.5 text-[10px] text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded font-serif uppercase tracking-wider border border-sky-500/20" title="Inicio de ronda o turno de combate"><svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2a8 8 0 101.21-1.21L19 7h-2"/></svg> Turno</span>';
                } else if (col.recovery === 'dm') {
                    recoveryHtml = '<span class="inline-flex items-center gap-0.5 text-[10px] text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded font-serif uppercase tracking-wider border border-purple-500/20" title="Dungeon Master"><svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> DM</span>';
                }

                // Usages display
                let usagesHtml = '';
                if (col.representation === 'cubos') {
                    usagesHtml += '<div class="flex flex-wrap gap-1.5 mt-2.5 mb-1">';
                    for (let i = 0; i < col.maxUses; i++) {
                        const isFilled = i < col.currentUses;
                        const fillStyle = isFilled 
                            ? 'bg-[#c5a059] border-[#d5b069] shadow-[0_0_8px_rgba(197,160,89,0.5)]' 
                            : 'bg-[#0c0d10] border-[#2d3139] hover:border-[#c5a059]/40';
                        usagesHtml += \`<div onclick="toggleCube('\${col.id}', \${i}, \${isFilled})" class="w-5 h-5 rounded border cursor-pointer transition-all duration-150 \${fillStyle}" title="\${isFilled ? 'Gastarse un uso' : 'Recuperar un uso'}"></div>\`;
                    }
                    usagesHtml += '</div>';
                } else {
                    usagesHtml += \`
                    <div class="flex items-baseline gap-1.5 py-2">
                        <span class="text-4xl font-bold font-mono tracking-tight text-[#c5a059]">\${col.currentUses}</span>
                        <span class="text-stone-600 font-serif text-sm">/</span>
                        <span class="text-stone-400 font-mono text-lg">\${col.maxUses}</span>
                    </div>\`;
                }

                card.innerHTML = \`
                    <div>
                        <!-- Header of card -->
                        <div class="flex items-start justify-between gap-2 mb-2">
                            <span class="inline-flex items-center gap-1 bg-[#0c0d10] border border-[#2d3139] px-2 py-0.5 rounded text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                                \${typeIcon}
                                <span>\${typeLabel}</span>
                            </span>
                            
                            <!-- Reorder and utility buttons -->
                            <div class="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="moveLeft(\${index}, event)" class="text-stone-500 hover:text-[#c5a059] p-0.5 transition-colors" title="Mover Izquierda">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                <button onclick="moveRight(\${index}, event)" class="text-stone-500 hover:text-[#c5a059] p-0.5 transition-colors" title="Mover Derecha">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                                </button>
                                <button onclick="editColumn('\${col.id}', event)" class="text-stone-400 hover:text-[#c5a059] p-1 transition-colors" title="Editar">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                </button>
                                <button onclick="deleteColumn('\${col.id}', event)" class="text-stone-400 hover:text-red-500 p-1 transition-colors" title="Eliminar">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a3 3 0 003 3h10M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Card Title -->
                        <h3 class="font-serif text-base font-bold text-stone-100 leading-tight tracking-wide mb-1">\${col.name}</h3>
                        
                        <!-- Usages area -->
                        \${usagesHtml}
                    </div>

                    <!-- Bottom counter buttons -->
                    <div class="flex items-center justify-between border-t border-[#2d3139] pt-3.5 mt-2">
                        \${recoveryHtml}
                        
                        <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                            <button onclick="changeUses('\${col.id}', -1)" class="w-7 h-7 bg-[#0c0d10] hover:bg-[#16181d] border border-[#2d3139] hover:border-[#c5a059]/30 text-[#c5a059] hover:text-[#d5b069] rounded flex items-center justify-center font-bold transition-all cursor-pointer" title="Gastar un uso">-</button>
                            <span class="font-mono text-xs text-stone-500 w-5 text-center">\${col.currentUses}</span>
                            <button onclick="changeUses('\${col.id}', 1)" class="w-7 h-7 bg-[#0c0d10] hover:bg-[#16181d] border border-[#2d3139] hover:border-[#c5a059]/30 text-[#c5a059] hover:text-[#d5b069] rounded flex items-center justify-center font-bold transition-all cursor-pointer" title="Recuperar un uso">+</button>
                        </div>
                    </div>
                \`;

                columnsGrid.appendChild(card);
            });
        }

        // Action Handlers
        window.changeUses = function(id, amount) {
            const col = columns.find(c => c.id === id);
            if (col) {
                col.currentUses = Math.min(col.maxUses, Math.max(0, col.currentUses + amount));
                saveState();
                renderColumns();
            }
        };

        window.toggleCube = function(id, index, isFilled) {
            const col = columns.find(c => c.id === id);
            if (col) {
                // If clicked filled, set current to index (which empties the clicked one and all above)
                // If clicked empty, set current to index + 1 (which fills the clicked one and all below)
                col.currentUses = isFilled ? index : index + 1;
                saveState();
                renderColumns();
            }
        };

        // Reordering helpers for mobile
        window.moveLeft = function(index, e) {
            e.stopPropagation();
            if (index > 0) {
                const temp = columns[index];
                columns[index] = columns[index - 1];
                columns[index - 1] = temp;
                saveState();
                renderColumns();
            }
        };

        window.moveRight = function(index, e) {
            e.stopPropagation();
            if (index < columns.length - 1) {
                const temp = columns[index];
                columns[index] = columns[index + 1];
                columns[index + 1] = temp;
                saveState();
                renderColumns();
            }
        };

        const deleteConfirmModal = document.getElementById('deleteConfirmModal');
        const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');
        const deleteColId = document.getElementById('deleteColId');
        const resetConfirmModal = document.getElementById('resetConfirmModal');

        window.deleteColumn = function(id, e) {
            if (e) e.stopPropagation();
            const col = columns.find(c => c.id === id);
            if (col) {
                deleteColId.value = id;
                deleteConfirmMessage.innerText = '¿Estás seguro de que deseas eliminar la habilidad "' + col.name + '"?';
                deleteConfirmModal.classList.remove('hidden');
            }
        };

        window.closeDeleteModal = function() {
            deleteConfirmModal.classList.add('hidden');
        };

        window.confirmDeleteColumn = function() {
            const id = deleteColId.value;
            columns = columns.filter(c => c.id !== id);
            saveState();
            renderColumns();
            closeDeleteModal();
        };

        // Name modification
        window.openEditNameModal = function() {
            editNameModal.classList.remove('hidden');
        };
        window.closeEditNameModal = function() {
            editNameModal.classList.add('hidden');
        };
        
        editNameForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = newNameInput.value.trim();
            if (val) {
                characterName = val;
                displayCharName.innerText = val;
                saveState();
                closeEditNameModal();
            }
        });

        // Rest mechanics
        window.openRestModal = function() {
            restModal.classList.remove('hidden');
        };
        window.closeRestModal = function() {
            restModal.classList.add('hidden');
        };
        window.performRest = function(type) {
            columns.forEach(col => {
                if (type === 'largo') {
                    col.currentUses = col.maxUses;
                } else if (type === 'corto' && col.recovery === 'corto') {
                    col.currentUses = col.maxUses;
                }
            });
            saveState();
            renderColumns();
            closeRestModal();
        };

        window.performCombatTurn = function() {
            columns.forEach(col => {
                if (col.recovery === 'turno') {
                    col.currentUses = col.maxUses;
                }
            });
            saveState();
            renderColumns();
        };

        // Add/Edit Modal controls
        window.openAddModal = function() {
            modalTitle.innerText = 'NUEVA HABILIDAD / RECURSO';
            editColId.value = '';
            formType.value = 'dnd';
            formCustomType.value = '';
            formName.value = '';
            formMaxUses.value = 1;
            formRecovery.value = 'corto';
            formRepresentation.value = 'cubos';
            
            handleFormTypeChange();
            addEditModal.classList.remove('hidden');
        };

        window.closeAddModal = function() {
            addEditModal.classList.add('hidden');
        };

        window.editColumn = function(id, e) {
            e.stopPropagation();
            const col = columns.find(c => c.id === id);
            if (!col) return;

            modalTitle.innerText = 'EDITAR RECURSO';
            editColId.value = col.id;
            formType.value = col.type;
            formCustomType.value = col.customTypeLabel || '';
            formSpellLevel.value = col.spellLevel || 1;
            formName.value = col.name;
            formMaxUses.value = col.maxUses;
            formRecovery.value = col.recovery;
            formRepresentation.value = col.representation;

            handleFormTypeChange();
            addEditModal.classList.remove('hidden');
        };

        window.handleFormTypeChange = function() {
            const type = formType.value;
            
            // Toggle sub-containers
            if (type === 'otro') {
                customTypeContainer.classList.remove('hidden');
            } else {
                customTypeContainer.classList.add('hidden');
            }

            if (type === 'hechizo') {
                spellLevelContainer.classList.remove('hidden');
                formName.value = 'Nivel ' + formSpellLevel.value;
                formName.setAttribute('disabled', 'true');
                formRepresentation.value = 'cubos';
                formRepresentation.setAttribute('disabled', 'true');
                representationNote.classList.remove('hidden');
            } else {
                spellLevelContainer.classList.add('hidden');
                formName.removeAttribute('disabled');
                formRepresentation.removeAttribute('disabled');
                representationNote.classList.add('hidden');
                
                // If it was spell slot, clear name input
                if (formName.value.startsWith('Nivel ') || formName.value.startsWith('Espacio de Hechizo')) {
                    formName.value = '';
                }
            }
        };

        window.handleSpellLevelChange = function() {
            if (formType.value === 'hechizo') {
                formName.value = 'Espacio de Hechizo Nivel ' + formSpellLevel.value;
            }
        };

        // Handle ability form submit
        abilityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const colId = editColId.value;
            const typeVal = formType.value;
            let nameVal = formName.value.trim();
            
            if (typeVal === 'hechizo') {
                nameVal = 'Espacio de Hechizo Nivel ' + formSpellLevel.value;
            } else if (!nameVal) {
                nameVal = 'Habilidad';
            }

            const maxUsesVal = parseInt(formMaxUses.value) || 1;

            const colData = {
                id: colId || 'col-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                type: typeVal,
                customTypeLabel: typeVal === 'otro' ? formCustomType.value.trim() || 'Otro' : undefined,
                spellLevel: typeVal === 'hechizo' ? parseInt(formSpellLevel.value) : undefined,
                name: nameVal,
                maxUses: maxUsesVal,
                currentUses: colId ? Math.min(maxUsesVal, (columns.find(c => c.id === colId)?.currentUses ?? maxUsesVal)) : maxUsesVal,
                representation: typeVal === 'hechizo' ? 'cubos' : formRepresentation.value,
                recovery: formRecovery.value
            };

            if (colId) {
                columns = columns.map(c => c.id === colId ? colData : c);
            } else {
                columns.push(colData);
            }

            saveState();
            renderColumns();
            closeAddModal();
        });

        window.resetApp = function() {
            resetConfirmModal.classList.remove('hidden');
        };

        window.closeResetModal = function() {
            resetConfirmModal.classList.add('hidden');
        };

        window.confirmResetApp = function() {
            localStorage.removeItem('dnd_local_character_name');
            localStorage.removeItem('dnd_local_columns');
            characterName = '';
            columns = [];
            splashScreen.classList.remove('hidden');
            appContainer.classList.add('hidden');
            closeResetModal();
        };
    </script>
</body>
</html>`;

    // Trigger file download
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dnd-tracker-${characterName.toLowerCase().replace(/\s+/g, '-') || 'personaje'}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // --- RENDERING ---
  return (
    <div className="min-h-screen bg-[#0c0d10] bg-[radial-gradient(circle_at_center,_#1a1c23_0%,_#0c0d10_100%)] text-[#e0e0e0] font-sans flex flex-col justify-between selection:bg-[#c5a059]/30 selection:text-white">
      
      {/* 1. INITIAL SPLASH SCREEN */}
      {!isInitialized && (
        <div id="splash" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0d10] px-4">
          <div className="max-w-md w-full bg-[#14161b] border border-[#2d3139] rounded-xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl"></div>
            
            {/* Elegant SVG Crest */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#c5a059]/10 to-[#8a6d3b]/30 rounded-2xl flex items-center justify-center border border-[#c5a059]/30 shadow-inner">
              <Sparkles className="w-10 h-10 text-[#c5a059] animate-pulse" />
            </div>
            
            <h1 className="font-serif text-3xl font-bold text-[#c5a059] tracking-wider mb-2">ARCHIVISTA D&amp;D</h1>
            <p className="text-stone-400 text-xs mb-6 uppercase tracking-widest font-mono">Controlador de Recursos 5e</p>
            
            <form onSubmit={handleStartAdventure} className="space-y-4">
              <div className="text-left">
                <label className="block text-stone-300 font-serif text-xs mb-1.5 uppercase tracking-widest">
                  Nombre de tu Personaje
                </label>
                <input 
                  type="text" 
                  id="char-name-input"
                  className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-stone-200 p-3 rounded-lg text-lg focus:ring-1 focus:ring-[#c5a059] font-serif placeholder:text-stone-700 outline-none transition-all" 
                  placeholder="Ej. Elminster Pendragon" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                id="btn-empezar"
                className="w-full bg-gradient-to-r from-[#c5a059] to-[#8a6d3b] hover:from-[#d5b069] hover:to-[#9a7d4b] border border-[#c5a059]/30 text-[#0c0d10] p-3.5 rounded-lg font-serif text-sm font-bold tracking-widest transition-all shadow-md cursor-pointer hover:shadow-[#c5a059]/10 flex items-center justify-center gap-2"
              >
                EMPEZAR AVENTURA
                <ChevronRight className="w-5 h-5 text-[#0c0d10]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. MAIN APPLICATION WORKSPACE */}
      {isInitialized && (
        <div className="flex-1 flex flex-col">
          
          {/* HEADER */}
          <header className="bg-[#14161b] border-b border-[#2d3139] shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              
              {/* Left side name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c5a059] to-[#8a6d3b] rounded-lg flex items-center justify-center text-[#0c0d10] font-bold text-xl shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                  <span>{characterName ? characterName.trim().charAt(0).toUpperCase() : 'E'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id="char-title-display" className="font-serif text-2xl font-bold text-[#c5a059] tracking-wider leading-none">
                      {characterName}
                    </h2>
                    <button 
                      onClick={() => {
                        setEditNameValue(characterName);
                        setIsEditNameOpen(true);
                      }} 
                      id="btn-rename"
                      className="text-stone-500 hover:text-[#c5a059] p-1 transition-colors" 
                      title="Cambiar Nombre"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[#6b7280] text-xs uppercase tracking-widest font-semibold italic mt-1">Héroe de D&amp;D 5ª Edición — Rastreador Activo</p>
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Export Standalone HTML Button */}
                <button 
                  onClick={handleExportHtml}
                  id="btn-export"
                  className="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-[#e0e0e0] hover:text-[#c5a059] px-3.5 py-2 rounded-lg font-serif text-xs font-semibold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Exportar archivo HTML independiente para abrir sin conexión"
                >
                  <Download className="w-4 h-4 text-[#c5a059]" />
                  EXPORTAR HTML
                </button>

                <button 
                  onClick={openAddModal}
                  id="btn-add-ability"
                  className="bg-gradient-to-r from-[#c5a059] to-[#8a6d3b] hover:from-[#d5b069] hover:to-[#9a7d4b] border border-[#c5a059]/30 text-[#0c0d10] px-4 py-2 rounded-lg font-serif text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 text-[#0c0d10]" />
                  NUEVA HABILIDAD
                </button>
                
                <button 
                  onClick={() => setIsRestOpen(true)}
                  id="btn-rest"
                  className="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-[#c5a059] hover:text-[#d5b069] px-4 py-2 rounded-lg font-serif text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Moon className="w-4 h-4 text-[#c5a059]" />
                  DESCANSAR
                </button>

                <button 
                  onClick={handleCombatTurn}
                  id="btn-combat-turn"
                  className="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-sky-400 hover:text-sky-300 px-4 py-2 rounded-lg font-serif text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reiniciar habilidades de inicio de ronda o turno de combate"
                >
                  <RefreshCw className="w-4 h-4 text-sky-400 animate-spin-hover" />
                  INICIO DE RONDA
                </button>
                
                <button 
                  onClick={handleResetApp}
                  id="btn-reset-all"
                  className="bg-red-950/20 hover:bg-red-900/30 border border-red-800/40 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer" 
                  title="Reiniciar Personaje"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* MAIN CONTAINER */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
            
            {/* Empty state */}
            {columns.length === 0 ? (
              <div id="empty-state" className="text-center py-20 max-w-md mx-auto">
                <HelpCircle className="w-16 h-16 text-stone-700 mx-auto mb-4" />
                <h3 className="font-serif text-xl text-[#c5a059] mb-2">No tienes habilidades registradas</h3>
                <p className="text-stone-500 text-sm mb-6">Crea tu primera columna de rastreo usando el botón "+ Nueva Habilidad" de la barra superior.</p>
                <button 
                  onClick={openAddModal}
                  className="bg-gradient-to-r from-[#c5a059] to-[#8a6d3b] hover:from-[#d5b069] hover:to-[#9a7d4b] text-[#0c0d10] font-bold px-6 py-3 rounded-lg font-serif text-xs tracking-widest"
                >
                  AÑADIR MI PRIMERA HABILIDAD
                </button>
              </div>
            ) : (
              <div>
                {/* Help tip */}
                <p className="text-stone-500 text-[11px] mb-4 flex items-center gap-1">
                  <span className="text-[#c5a059] font-bold">★ Sugerencia:</span> 
                  Puedes pulsar directamente en los cubos de las tarjetas para gastar/recuperar sus usos. Arrastra las tarjetas para reordenarlas.
                </p>

                {/* Grid of Column Cards */}
                <div 
                  id="cards-grid"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {columns.map((col, index) => {
                    // Type-specific details
                    let typeIcon = <HelpCircle className="w-4 h-4 text-stone-450" />;
                    let typeLabel = 'Otro';
                    
                    switch (col.type) {
                      case 'raza':
                        typeIcon = <Shield className="w-4 h-4 text-sky-400" />;
                        typeLabel = 'Rasgo Racial';
                        break;
                      case 'objeto':
                        typeIcon = <Sword className="w-4 h-4 text-purple-400" />;
                        typeLabel = 'Objeto Mágico';
                        break;
                      case 'clase':
                        typeIcon = <Flame className="w-4 h-4 text-red-400" />;
                        typeLabel = 'Rasgo de Clase';
                        break;
                      case 'hechizo':
                        typeIcon = <Sparkles className="w-4 h-4 text-emerald-400" />;
                        typeLabel = `Espacio de Hechizo`;
                        break;
                      case 'dnd':
                        typeIcon = <Award className="w-4 h-4 text-[#c5a059]" />;
                        typeLabel = 'D&D Genérico';
                        break;
                      default:
                        typeLabel = col.customTypeLabel || 'Otro';
                    }

                    return (
                      <div
                        key={col.id}
                        id={`card-${col.id}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        className={`bg-[#16181d] border ${draggedIndex === index ? 'opacity-40 border-dashed border-[#c5a059]' : 'border-[#2d3139] hover:border-[#c5a059]/40'} rounded-xl p-5 shadow-xl flex flex-col justify-between group transition-all duration-200 cursor-grab active:cursor-grabbing relative hover:shadow-[0_0_20px_rgba(197,160,89,0.05)]`}
                      >
                        <div>
                          {/* Card Top / Controls */}
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            <span className="inline-flex items-center gap-1.5 bg-[#0c0d10] border border-[#2d3139] px-2 py-0.5 rounded text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                              {typeIcon}
                              <span>{typeLabel}</span>
                            </span>
                            
                            {/* Card Utilities (Visible on Hover/Focus) */}
                            <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Reorder arrows for Accessibility / mobile */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveColumn(index, 'left'); }}
                                className="text-stone-500 hover:text-[#c5a059] p-0.5 disabled:opacity-20"
                                disabled={index === 0}
                                title="Mover izquierda"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveColumn(index, 'right'); }}
                                className="text-stone-500 hover:text-[#c5a059] p-0.5 disabled:opacity-20"
                                disabled={index === columns.length - 1}
                                title="Mover derecha"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              {/* Edit Button */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEditModal(col); }}
                                className="text-stone-500 hover:text-[#c5a059] p-1 transition-colors"
                                title="Editar Habilidad"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {/* Delete Button */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteColumn(col.id); }}
                                className="text-stone-500 hover:text-red-400 p-1 transition-colors"
                                title="Eliminar Habilidad"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Card Name */}
                          <h3 className="font-serif text-base font-bold text-stone-100 tracking-wide mb-2 leading-snug">
                            {col.name}
                          </h3>

                          {/* Usages Visualizer */}
                          {col.representation === 'cubos' ? (
                            <div className="flex flex-wrap gap-1.5 my-3">
                              {Array.from({ length: col.maxUses }).map((_, i) => {
                                const isFilled = i < col.currentUses;
                                return (
                                  <button
                                    key={i}
                                    onClick={() => handleToggleCubeIndex(col.id, i, isFilled)}
                                    className={`w-5.5 h-5.5 rounded border transition-all duration-150 cursor-pointer ${
                                      isFilled 
                                        ? 'bg-[#c5a059] border-[#d5b069] shadow-[0_0_8px_rgba(197,160,89,0.5)] hover:bg-[#d5b069]' 
                                        : 'bg-[#0c0d10] border-[#2d3139] hover:border-[#c5a059]/40'
                                    }`}
                                    title={isFilled ? "Gastar uso" : "Recuperar uso"}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1 py-1 my-2">
                              <span className="text-4xl font-bold font-mono tracking-tight text-[#c5a059]">
                                {col.currentUses}
                              </span>
                              <span className="text-stone-600 font-serif text-sm">/</span>
                              <span className="text-stone-400 font-mono text-lg">
                                {col.maxUses}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer controls */}
                        <div className="flex items-center justify-between border-t border-[#2d3139] pt-3 mt-2">
                          
                          {/* Recovery Type label */}
                          {col.recovery === 'corto' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 px-1.5 py-0.5 rounded font-serif uppercase tracking-wider">
                              <Hourglass className="w-2.5 h-2.5" />
                              D. Corto
                            </span>
                          )}
                          {col.recovery === 'largo' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-serif uppercase tracking-wider">
                              <Moon className="w-2.5 h-2.5" />
                              D. Largo
                            </span>
                          )}
                          {col.recovery === 'turno' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded font-serif uppercase tracking-wider" title="Inicio de ronda o turno de combate">
                              <RefreshCw className="w-2.5 h-2.5" />
                              Turno
                            </span>
                          )}
                          {col.recovery === 'dm' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded font-serif uppercase tracking-wider" title="Dungeon Master">
                              <User className="w-2.5 h-2.5" />
                              DM
                            </span>
                          )}

                          {/* Quick plus/minus incrementors */}
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => adjustUses(col.id, -1)}
                              className="w-7 h-7 bg-[#0c0d10] hover:bg-[#16181d] border border-[#2d3139] text-[#c5a059] hover:text-[#d5b069] rounded flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                              title="Gastar 1 uso"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs text-stone-500 w-4 text-center">
                              {col.currentUses}
                            </span>
                            <button 
                              onClick={() => adjustUses(col.id, 1)}
                              className="w-7 h-7 bg-[#0c0d10] hover:bg-[#16181d] border border-[#2d3139] text-[#c5a059] hover:text-[#d5b069] rounded flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                              title="Restaurar 1 uso"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* FOOTER & INSTRUCTIONS */}
      <footer className="bg-[#14161b] border-t border-[#2d3139] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="text-[#6b7280] text-[10px] font-serif uppercase tracking-widest">
            ARCHIVISTA D&amp;D 5E — TABLERO DE RECURSOS DEL AVENTURERO
          </div>
          
          {/* Instructions Panel */}
          <div className="max-w-3xl mx-auto text-left bg-[#0c0d10]/60 border border-[#2d3139] rounded-xl p-5 text-stone-400 text-xs space-y-2">
            <h4 className="font-serif text-[#c5a059] font-bold tracking-wide uppercase mb-1 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-[#c5a059]" />
              Manual de Instrucciones del Tracker
            </h4>
            <p>1. <strong>Inicio Rápido:</strong> Al ingresar el nombre de tu aventurero, se crean por defecto columnas para <strong>Reacción</strong> (1 uso, recuperación en descanso corto) e <strong>Inspiración</strong> (3 usos, recuperación en descanso largo).</p>
            <p>2. <strong>Hacer Descansos:</strong> Pulsa el botón "Descansar" arriba a la derecha. El <strong>Descanso Corto</strong> recuperará los recursos vinculados a "Descanso Corto". El <strong>Descanso Largo</strong> restaurará absolutamente todas las habilidades y espacios de conjuro.</p>
            <p>3. <strong>Espacios de Conjuros:</strong> Al añadir una columna de tipo "Espacio de hechizo", se bloquea automáticamente su representación en formato visual de <strong>cubos</strong> (indispensable para hechizos) y se autocompleta con el nivel elegido.</p>
            <p>4. <strong>Exportación Standalone:</strong> El botón <strong className="text-[#c5a059]">Exportar HTML</strong> genera un archivo HTML completo y autónomo. El archivo resultante incluirá a este personaje con sus habilidades actuales y se puede abrir en cualquier dispositivo sin conexión a Internet conservando la persistencia de datos local.</p>
          </div>
          
          <p className="text-[#6b7280] text-[9px]">Dungeons &amp; Dragons es propiedad de Wizards of the Coast LLC. Esta es una herramienta hecha por fans.</p>
        </div>
      </footer>

      {/* --- MODALS RENDERED IN REACT --- */}

      {/* MODAL 1: ADD / EDIT RESOURCE */}
      {isAddEditOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="bg-[#1a1c23] border-b border-[#2d3139] p-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#c5a059] tracking-wider uppercase">
                {editingColumnId ? 'Editar Habilidad' : 'Añadir Nueva Habilidad / Columna'}
              </h3>
              <button 
                onClick={() => setIsAddEditOpen(false)}
                className="text-[#6b7280] hover:text-[#c5a059] p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveColumn} className="p-6 space-y-4">
              
              {/* Type Selection */}
              <div>
                <label className="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">
                  Tipo de Habilidad
                </label>
                <select 
                  className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-[#e0e0e0] p-2.5 rounded-lg text-sm font-serif outline-none"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as AbilityType)}
                >
                  <option value="raza">Raza (Rasgo Racial)</option>
                  <option value="objeto">Objeto Mágico</option>
                  <option value="clase">Clase (Rasgo de Clase)</option>
                  <option value="hechizo">Espacio de Hechizo</option>
                  <option value="dnd">D&amp;D (Genérico)</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Custom type input */}
              {formType === 'otro' && (
                <div>
                  <label className="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">
                    Especificar Tipo Personalizado
                  </label>
                  <input 
                    type="text"
                    className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-stone-200 p-2.5 rounded-lg text-sm outline-none"
                    placeholder="Ej. Dote, Pacto, Canalización"
                    value={formCustomType}
                    onChange={(e) => setFormCustomType(e.target.value)}
                  />
                </div>
              )}

              {/* Spell Level Selector */}
              {formType === 'hechizo' && (
                <div>
                  <label className="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">
                    Nivel del Espacio de Conjuro
                  </label>
                  <select 
                    className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-stone-200 p-2.5 rounded-lg text-sm font-mono outline-none"
                    value={formSpellLevel}
                    onChange={(e) => setFormSpellLevel(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8,9].map(num => (
                      <option key={num} value={num}>Nivel {num}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ability Name */}
              <div>
                <label className="block text-[#a0a0a0] font-serif text-xs uppercase tracking-wider mb-1.5">
                  Nombre de la Habilidad / Recurso
                </label>
                <input 
                  type="text"
                  disabled={formType === 'hechizo'}
                  className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-stone-200 p-2.5 rounded-lg text-sm disabled:opacity-55 outline-none"
                  placeholder={formType === 'hechizo' ? `Espacio de Hechizo Nivel ${formSpellLevel}` : "Ej. Furia de Combate, Imposición de Manos"}
                  value={formType === 'hechizo' ? `Espacio de Hechizo Nivel ${formSpellLevel}` : formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required={formType !== 'hechizo'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Max Uses */}
                <div>
                  <label className="block text-[#a0a0a0] font-serif text-xs uppercase tracking-wider mb-1.5">
                    Cantidad Máxima de Usos
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="99"
                    className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-stone-200 p-2.5 rounded-lg text-sm font-mono outline-none"
                    value={formMaxUses}
                    onChange={(e) => setFormMaxUses(Number(e.target.value))}
                    required
                  />
                </div>

                {/* Recovery */}
                <div>
                  <label className="block text-[#a0a0a0] font-serif text-xs uppercase tracking-wider mb-1.5">
                    Tiempo de Recuperación
                  </label>
                  <select 
                    className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-stone-200 p-2.5 rounded-lg text-sm font-serif outline-none"
                    value={formRecovery}
                    onChange={(e) => setFormRecovery(e.target.value as 'corto' | 'largo' | 'turno' | 'dm')}
                  >
                    <option value="corto">Descanso Corto</option>
                    <option value="largo">Descanso Largo</option>
                    <option value="turno">Inicio de ronda o turno de combate</option>
                    <option value="dm">Dungeon Master</option>
                  </select>
                </div>
              </div>

              {/* Representation selection */}
              <div>
                <label className="block text-[#a0a0a0] font-serif text-xs uppercase tracking-wider mb-1.5">
                  Representación Visual
                </label>
                <select 
                  className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-stone-200 p-2.5 rounded-lg text-sm font-serif disabled:opacity-55 outline-none"
                  disabled={formType === 'hechizo'}
                  value={formType === 'hechizo' ? 'cubos' : formRepresentation}
                  onChange={(e) => setFormRepresentation(e.target.value as 'cubos' | 'numerico')}
                >
                  <option value="cubos">Cubos (Visuales)</option>
                  <option value="numerico">Contador Numérico Grande</option>
                </select>
                {formType === 'hechizo' && (
                  <p className="text-[#6b7280] text-[10px] mt-1 italic">
                    *Los espacios de hechizo están bloqueados en representación visual de cubos para mayor autenticidad.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d3139] mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsAddEditOpen(false)}
                  className="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-[#e0e0e0] px-4 py-2 rounded-lg font-serif text-xs tracking-wider cursor-pointer transition-all"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#c5a059] to-[#8a6d3b] hover:from-[#d5b069] hover:to-[#9a7d4b] border border-[#c5a059]/20 text-[#0c0d10] px-5 py-2.5 rounded-lg font-serif text-xs font-bold tracking-widest cursor-pointer shadow transition-all"
                >
                  {editingColumnId ? 'ACTUALIZAR' : 'CREAR HABILIDAD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REST OPTIONS */}
      {isRestOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="bg-[#1a1c23] border-b border-[#2d3139] p-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#c5a059] tracking-wider uppercase">REPOSAR Y RESTAURAR</h3>
              <button 
                onClick={() => setIsRestOpen(false)}
                className="text-[#6b7280] hover:text-[#c5a059] p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-stone-400 text-xs text-center">
                Elige el descanso correspondiente. Tus recursos se actualizarán automáticamente según sus requerimientos de D&amp;D.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Short Rest Option */}
                <button 
                  onClick={() => handlePerformRest('corto')}
                  className="group text-left p-4 rounded-xl border border-[#2d3139] bg-[#0c0d10] hover:bg-[#1a1c23] hover:border-[#c5a059]/40 transition-all cursor-pointer flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-xl flex items-center justify-center text-[#c5a059] group-hover:bg-[#c5a059]/20 transition-colors">
                    <Hourglass className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#c5a059] tracking-wide">Descanso Corto (Short Rest)</h4>
                    <p className="text-[#a0a0a0] text-[11px] mt-0.5">Restaura rasgos de combate rápido o de recuperación corta (como Reacción).</p>
                  </div>
                </button>
                
                {/* Long Rest Option */}
                <button 
                  onClick={() => handlePerformRest('largo')}
                  className="group text-left p-4 rounded-xl border border-[#2d3139] bg-[#0c0d10] hover:bg-[#1a1c23] hover:border-[#c5a059]/40 transition-all cursor-pointer flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <Moon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-emerald-400 tracking-wide">Descanso Largo (Long Rest)</h4>
                    <p className="text-[#a0a0a0] text-[11px] mt-0.5">Duerme en una posada o campamento seguro. Restaura todos los recursos y espacios de conjuros al 100%.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT NAME */}
      {isEditNameOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="bg-[#1a1c23] border-b border-[#2d3139] p-4 flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-[#c5a059] tracking-wider uppercase">RENOMBRAR PERSONAJE</h3>
              <button 
                onClick={() => setIsEditNameOpen(false)}
                className="text-[#6b7280] hover:text-[#c5a059] p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveNameChange} className="p-5 space-y-4">
              <div>
                <label className="block text-stone-400 font-serif text-xs uppercase tracking-wider mb-1.5">
                  Nombre del Aventurero
                </label>
                <input 
                  type="text" 
                  className="w-full bg-[#0c0d10] border border-[#2d3139] focus:border-[#c5a059] text-stone-200 p-2.5 rounded-lg text-sm font-serif outline-none"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditNameOpen(false)}
                  className="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-[#e0e0e0] px-3.5 py-1.5 rounded-lg text-xs tracking-wider cursor-pointer transition-all"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#c5a059] to-[#8a6d3b] hover:from-[#d5b069] hover:to-[#9a7d4b] border border-[#c5a059]/20 px-4 py-1.5 rounded-lg font-serif text-xs font-bold tracking-widest text-[#0c0d10] cursor-pointer shadow transition-all"
                >
                  CONFIRMAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM DELETE */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-[#c5a059] tracking-wider uppercase mb-2">¿ELIMINAR HABILIDAD?</h3>
            <p className="text-[#a0a0a0] text-xs mb-6 font-serif">
              ¿Estás seguro de que deseas eliminar la habilidad "{columns.find(c => c.id === deleteConfirmId)?.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-[#e0e0e0] px-4 py-2 rounded-lg font-serif text-xs tracking-wider cursor-pointer transition-all"
              >
                CANCELAR
              </button>
              <button 
                type="button"
                onClick={() => {
                  setColumns(prev => prev.filter(c => c.id !== deleteConfirmId));
                  setDeleteConfirmId(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-serif text-xs font-bold tracking-widest cursor-pointer transition-all"
              >
                ELIMINAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRM RESET */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161b] border border-[#2d3139] rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-[#c5a059] tracking-wider uppercase mb-2">¿REINICIAR PERSONAJE?</h3>
            <p className="text-[#a0a0a0] text-xs mb-6 font-serif">
              ¿Estás seguro de que deseas borrar todos los datos de tu personaje y empezar de nuevo? Se eliminarán todas tus habilidades personalizadas y el nombre del personaje.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="bg-[#1a1c23] hover:bg-[#2d3139] border border-[#2d3139] text-[#e0e0e0] px-4 py-2 rounded-lg font-serif text-xs tracking-wider cursor-pointer transition-all"
              >
                CANCELAR
              </button>
              <button 
                type="button"
                onClick={() => {
                  localStorage.clear();
                  setCharacterName('');
                  setColumns([]);
                  setTempName('');
                  setIsInitialized(false);
                  setIsResetConfirmOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-serif text-xs font-bold tracking-widest cursor-pointer transition-all"
              >
                REINICIAR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

