declare module 'react-native-canvas' {
  import React from 'react';

  export interface CanvasRenderingContext2D {
    clearRect(x: number, y: number, width: number, height: number): void;
    strokeRect(x: number, y: number, width: number, height: number): void;
    fillText(text: string, x: number, y: number): void;
    strokeStyle: string;
    fillStyle: string;
    lineWidth: number;
  }

  export interface Canvas {
    width: number;
    height: number;
    getContext(contextType: '2d'): CanvasRenderingContext2D | null;
  }

  export default class CanvasComponent extends React.Component<{
    style?: any;
    ref?: (canvas: Canvas) => void;
  }> {
    width: number;
    height: number;
    getContext(contextType: '2d'): CanvasRenderingContext2D | null;
  }
}

