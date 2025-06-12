let clientIdCounter = 0

export const generateClientId = (): string => {
  return `allocation_${++clientIdCounter}_${Date.now()}`
}

export const resetClientIdCounter = (): void => {
  clientIdCounter = 0
}
