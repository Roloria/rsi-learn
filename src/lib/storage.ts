import { ExperimentState } from "./engine";

const LAB_KEY = "rsi-labs-v1";
const PATH_KEY = "rsi-path-v1";

export interface LabMeta {
  id: string;
  templateId: string;
  objective: string;
  updatedAt: number;
}

/* ---------------- 实验场存储 ---------------- */

export function loadLabs(): LabMeta[] {
  try {
    const raw = localStorage.getItem(LAB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LabMeta[];
  } catch {
    return [];
  }
}

export function saveLab(state: ExperimentState) {
  try {
    const labs = loadLabs().filter((l) => l.id !== state.id);
    labs.unshift({
      id: state.id,
      templateId: state.templateId,
      objective: state.objective || "(未命名目标)",
      updatedAt: Date.now(),
    });
    while (labs.length > 12) labs.pop();
    localStorage.setItem(LAB_KEY, JSON.stringify(labs));
    localStorage.setItem(`${LAB_KEY}:${state.id}`, JSON.stringify(state));
  } catch {
    /* 存储不可用时静默降级为内存态 */
  }
}

export function loadLabState(id: string): ExperimentState | null {
  try {
    const raw = localStorage.getItem(`${LAB_KEY}:${id}`);
    return raw ? (JSON.parse(raw) as ExperimentState) : null;
  } catch {
    return null;
  }
}

export function deleteLab(id: string) {
  try {
    localStorage.setItem(
      LAB_KEY,
      JSON.stringify(loadLabs().filter((l) => l.id !== id))
    );
    localStorage.removeItem(`${LAB_KEY}:${id}`);
  } catch {
    /* noop */
  }
}

/* ---------------- 学习路径进度 ---------------- */

export function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(PATH_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveProgress(done: Set<string>) {
  try {
    localStorage.setItem(PATH_KEY, JSON.stringify(Array.from(done)));
  } catch {
    /* noop */
  }
}
