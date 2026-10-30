import type { Camera } from './walk-domain';
import type { ViewState } from './walk-render';
export function setGardenCamera(camera: any, view: Camera, width: number, height: number): void;
export function isPanelVisible(camera: any, point: { x: number; z: number }, blockers: any[]): boolean;
export function createGardenThree(canvas: HTMLCanvasElement): {render(view: Camera, state: ViewState, width: number, height: number): Set<number>; dispose(): void};
