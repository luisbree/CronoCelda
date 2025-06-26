'use client';

import * as React from 'react';

const COLORS = [
  '#FF4500', '#FF8C00', '#FFD700', '#ADFF2F', '#32CD32', '#008080',
  '#00CED1', '#1E90FF', '#4169E1', '#0000CD', '#8A2BE2', '#4B0082',
  '#9400D3', '#C71585', '#FF1493', '#FF69B4', '#FFE4E1', '#F08080',
  '#E9967A', '#FA8072', '#B22222', '#A52A2A', '#800000', '#696969',
  '#778899', '#2F4F4F', '#006400', '#556B2F', '#8B4513', '#A0522D',
  '#BC8F8F', '#CD5C5C', '#F4A460', '#DAA520', '#6B8E23', '#2E8B57'
];

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
}

const Hexagon = ({ color, onClick }: { color: string; onClick: () => void }) => {
  return (
    <div
      className="h-8 w-7 cursor-pointer transition-transform hover:scale-110"
      style={{ 
        backgroundColor: color,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
      }}
      onClick={onClick}
    />
  );
};

export function ColorPicker({ onColorSelect }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2 p-2">
      {COLORS.map((color) => (
        <Hexagon
          key={color}
          color={color}
          onClick={() => onColorSelect(color)}
        />
      ))}
    </div>
  );
}
