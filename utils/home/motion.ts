export interface Motion {
  position: number;
  velocity: number;
}

/** Exact critically damped spring step. Retargeting keeps both position and velocity. */
export function advanceMotion(
  state: Motion,
  target: number,
  elapsed: number,
  frequency = 12,
): Motion {
  const dt = Math.min(0.05, Math.max(0, elapsed));
  const displacement = state.position - target;
  const coefficient = state.velocity + frequency * displacement;
  const decay = Math.exp(-frequency * dt);
  return {
    position: target + (displacement + coefficient * dt) * decay,
    velocity: (state.velocity - frequency * coefficient * dt) * decay,
  };
}
