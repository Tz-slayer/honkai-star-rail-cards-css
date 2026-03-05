import { create } from 'zustand'

interface OrientationData {
  absolute: { alpha: number; beta: number; gamma: number }
  relative: { alpha: number; beta: number; gamma: number }
}

interface OrientationStore {
  orientation: OrientationData
  resetBaseOrientation: () => void
}

let baseOrientation = { alpha: 0, beta: 0, gamma: 0 }
let firstReading = true

const defaultOrientation: OrientationData = {
  absolute: { alpha: 0, beta: 0, gamma: 0 },
  relative: { alpha: 0, beta: 0, gamma: 0 },
}

export const useOrientation = create<OrientationStore>((set) => {
  if (typeof window !== 'undefined') {
    window.addEventListener(
      'deviceorientation',
      (e: DeviceOrientationEvent) => {
        const raw = {
          alpha: e.alpha ?? 0,
          beta: e.beta ?? 0,
          gamma: e.gamma ?? 0,
        }

        if (firstReading) {
          firstReading = false
          baseOrientation = { ...raw }
        }

        set({
          orientation: {
            absolute: raw,
            relative: {
              alpha: raw.alpha - baseOrientation.alpha,
              beta: raw.beta - baseOrientation.beta,
              gamma: raw.gamma - baseOrientation.gamma,
            },
          },
        })
      },
      true
    )
  }

  return {
    orientation: defaultOrientation,
    resetBaseOrientation: () => {
      firstReading = true
      baseOrientation = { alpha: 0, beta: 0, gamma: 0 }
    },
  }
})
