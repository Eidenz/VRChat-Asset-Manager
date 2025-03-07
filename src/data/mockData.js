// src/data/mockData.js
export const collections = [
  {
    id: 1,
    name: 'Casual Outfits',
    description: 'Everyday clothing for my main avatar',
    thumbnail: 'https://picsum.photos/id/237/220/120',
    itemCount: 24,
    dateCreated: '2025-01-15',
    folderPath: 'D:/VRChat/Assets/Clothing/Casual'
  },
  {
    id: 2,
    name: 'Fantasy Props',
    description: 'Medieval and fantasy weapons and accessories',
    thumbnail: 'https://picsum.photos/id/28/220/120',
    itemCount: 12,
    dateCreated: '2025-01-20',
    folderPath: 'D:/VRChat/Assets/Props/Fantasy'
  },
  {
    id: 3,
    name: 'Cyberpunk',
    description: 'Futuristic neon assets for my cyber avatar',
    thumbnail: 'https://picsum.photos/id/106/220/120',
    itemCount: 18,
    dateCreated: '2025-02-03',
    folderPath: 'D:/VRChat/Assets/Themes/Cyberpunk'
  },
  {
    id: 4,
    name: 'Medieval',
    description: 'Knight armor and medieval accessories',
    thumbnail: 'https://picsum.photos/id/65/220/120',
    itemCount: 9,
    dateCreated: '2025-02-12',
    folderPath: 'D:/VRChat/Assets/Themes/Medieval'
  }
];

export const avatars = [
  {
    id: 1,
    name: 'Neo Cat',
    base: 'Feline3.0',
    thumbnail: 'https://picsum.photos/id/40/160/180',
    dateAdded: '2025-01-05',
    lastUsed: '2025-03-01',
    filePath: 'D:/VRChat/Avatars/NeoCat.vrca',
    notes: 'Main avatar - latest version has fixed tail physics'
  },
  {
    id: 2,
    name: 'Cyber Bunny',
    base: 'Leporidae2.5',
    thumbnail: 'https://picsum.photos/id/119/160/180',
    dateAdded: '2025-01-12',
    lastUsed: '2025-02-24',
    filePath: 'D:/VRChat/Avatars/CyberBunny.vrca',
    notes: 'Need to fix ear clipping issue'
  },
  {
    id: 3,
    name: 'Mech Warrior',
    base: 'HumanMale4.2',
    thumbnail: 'https://picsum.photos/id/250/160/180',
    dateAdded: '2025-01-25',
    lastUsed: '2025-02-10',
    filePath: 'D:/VRChat/Avatars/MechWarrior.vrca',
    notes: 'Heavy but well optimized'
  },
  {
    id: 4,
    name: 'Forest Spirit',
    base: 'Fantasy2.0',
    thumbnail: 'https://picsum.photos/id/167/160/180',
    dateAdded: '2025-02-01',
    lastUsed: '2025-02-28',
    filePath: 'D:/VRChat/Avatars/ForestSpirit.vrca',
    notes: 'My newest avatar - great for nature worlds'
  },
  {
    id: 5,
    name: 'Desert Nomad',
    base: 'HumanSlim3.1',
    thumbnail: 'https://picsum.photos/id/91/160/180',
    dateAdded: '2025-02-15',
    lastUsed: '2025-02-15',
    filePath: 'D:/VRChat/Avatars/DesertNomad.vrca',
    notes: 'Rarely used but keeping as backup'
  }
];

export const assetTypes = [
  { id: 'clothing', name: 'Clothing' },
  { id: 'prop', name: 'Prop' },
  { id: 'accessory', name: 'Accessory' },
  { id: 'texture', name: 'Texture' },
  { id: 'animation', name: 'Animation' },
  { id: 'avatar', name: 'Full Avatar' },
  { id: 'shader', name: 'Shader' },
  { id: 'audio', name: 'Audio' },
  { id: 'prefab', name: 'Prefab' },
  { id: 'script', name: 'Script/Component' }
];

export const avatarBases = [
  { id: 'feline3', name: 'Feline3.0' },
  { id: 'leporidae2', name: 'Leporidae2.5' },
  { id: 'humanMale4', name: 'HumanMale4.2' },
  { id: 'humanFemale4', name: 'HumanFemale4.2' },
  { id: 'fantasy2', name: 'Fantasy2.0' },
  { id: 'humanSlim3', name: 'HumanSlim3.1' },
  { id: 'toon1', name: 'Toon1.0' },
  { id: 'robot2', name: 'Robot2.4' }
];

export const assetTags = [
  'Clothing',
  'Prop',
  'Accessory',
  'Weapon',
  'Hairstyle',
  'Wings',
  'Animated',
  'Cyberpunk',
  'Fantasy',
  'Sci-Fi',
  'Medieval',
  'Modern',
  'Casual',
  'Formal',
  'Cute',
  'Horror',
  'Magical',
  'Steampunk'
];

export const recentAssets = [
  {
    id: 1,
    name: 'Neon Cyberpunk Jacket',
    creator: 'CyberCreator',
    description: 'A futuristic jacket with animated LED patterns that react to audio.',
    thumbnail: 'https://picsum.photos/id/1025/280/200',
    tags: ['Clothing', 'Cyberpunk', 'Upper Body'],
    dateAdded: '2025-03-01',
    lastUsed: '2025-03-03',
    fileSize: '15.2 MB',
    filePath: 'D:/VRChat/Assets/Clothing/Cyberpunk/NeonJacket_v2.unitypackage',
    version: '2.0',
    type: 'Clothing',
    favorited: false,
    compatibleWith: ['HumanMale4.2', 'HumanFemale4.2', 'HumanSlim3.1'],
    notes: 'Works well with my Cyber Bunny avatar, need to adjust colors'
  },
  {
    id: 2,
    name: 'Arcane Magic Staff',
    creator: 'MagicProps',
    description: 'A detailed staff with particle effects and custom animations.',
    thumbnail: 'https://picsum.photos/id/1040/280/200',
    tags: ['Prop', 'Fantasy', 'Weapon'],
    dateAdded: '2025-02-25',
    lastUsed: '2025-03-02',
    fileSize: '22.8 MB',
    filePath: 'D:/VRChat/Assets/Props/Fantasy/ArcaneMagicStaff.unitypackage',
    version: '1.5',
    type: 'Prop',
    favorited: true,
    compatibleWith: ['Fantasy2.0', 'HumanMale4.2', 'HumanFemale4.2'],
    notes: 'Love the particle effects, but a bit heavy on performance'
  },
  {
    id: 3,
    name: 'Fluffy Cat Ears',
    creator: 'NekoDesigns',
    description: 'Realistic fluffy cat ears with physics and multiple color options.',
    thumbnail: 'https://picsum.photos/id/169/280/200',
    tags: ['Accessory', 'Kemonomimi', 'Head'],
    dateAdded: '2025-02-20',
    lastUsed: '2025-02-28',
    fileSize: '8.4 MB',
    filePath: 'D:/VRChat/Assets/Accessories/CatEars_Fluffy.unitypackage',
    version: '1.0',
    type: 'Accessory',
    favorited: false,
    compatibleWith: ['Feline3.0', 'HumanFemale4.2', 'HumanMale4.2', 'Fantasy2.0'],
    notes: 'Very cute, works well with most of my avatars'
  },
  {
    id: 4,
    name: 'LED Angel Wings',
    creator: 'LightEffects',
    description: 'Beautiful angel wings with customizable LED patterns and toggle animations.',
    thumbnail: 'https://picsum.photos/id/160/280/200',
    tags: ['Accessory', 'Back', 'Animated'],
    dateAdded: '2025-02-15',
    lastUsed: '2025-02-26',
    fileSize: '18.6 MB',
    filePath: 'D:/VRChat/Assets/Accessories/Wings/LED_Angel_Wings.unitypackage',
    version: '2.1',
    type: 'Accessory',
    favorited: false,
    compatibleWith: ['HumanFemale4.2', 'HumanMale4.2', 'Fantasy2.0', 'HumanSlim3.1'],
    notes: 'Animations need some work but looks amazing in dark worlds'
  }
];

export const settings = {
  defaultAvatarPath: 'D:/VRChat/Avatars',
  defaultAssetsPath: 'D:/VRChat/Assets',
  unityPath: 'C:/Program Files/Unity/Hub/Editor/2022.3.6f1/Editor/Unity.exe',
  autoSync: true,
  darkMode: true,
  showFilePaths: true,
  backupFrequency: 'weekly',
  lastBackup: '2025-02-28'
};

export const compatibilityMatrix = {
  'Feline3.0': {
    'HumanMale4.2': {
      boneStructure: 'partial',
      materials: 'yes',
      animations: 'partial',
      notes: 'Limb proportions differ significantly'
    },
    'HumanFemale4.2': {
      boneStructure: 'partial',
      materials: 'yes',
      animations: 'partial',
      notes: 'Limb proportions differ significantly'
    },
    'Fantasy2.0': {
      boneStructure: 'mostly',
      materials: 'yes',
      animations: 'mostly',
      notes: 'Good compatibility overall with minor adjustments'
    }
  },
  'HumanMale4.2': {
    'HumanFemale4.2': {
      boneStructure: 'yes',
      materials: 'yes',
      animations: 'yes',
      notes: 'Excellent compatibility with minimal adjustments'
    },
    'HumanSlim3.1': {
      boneStructure: 'mostly',
      materials: 'yes',
      animations: 'mostly',
      notes: 'Some scaling needed for best results'
    }
  }
};