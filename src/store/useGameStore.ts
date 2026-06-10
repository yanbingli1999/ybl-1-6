import { create } from 'zustand'
import {
  type PetCase,
  type Player,
  type Equipment,
  type GamePhase,
  type DiagnosisResult,
  type ActionType,
  type AccidentType,
  type StepError,
  type TreatmentStep,
  initialEquipment,
  generatePetCase,
  generateInitialCases,
  generateTestCases,
  getDisease,
  getMedicine,
  getActionLabel,
  getCorrectTreatmentSteps,
} from '@/data/gameData'

interface PlayerStep {
  action: ActionType
  medicineId: string | null
}

interface GameState {
  cases: PetCase[]
  activeCaseId: string | null
  player: Player
  equipment: Equipment[]
  gamePhase: GamePhase
  accidentType: AccidentType | null
  diagnosisResult: DiagnosisResult | null
  actionCooldowns: Record<ActionType, number>
  playerSteps: PlayerStep[]
  showStepEditor: number | null

  selectCase: (id: string) => void
  examine: () => void
  addStep: (action: ActionType) => void
  removeStep: (index: number) => void
  moveStep: (fromIndex: number, toIndex: number) => void
  openStepMedicine: (index: number) => void
  setStepMedicine: (index: number, medicineId: string | null) => void
  closeStepEditor: () => void
  submitTreatment: () => void
  repairEquipment: (id: string) => void
  dismissResult: () => void
  dismissAccident: () => void
  generateNewCase: () => void
  loadTestCases: () => void
  resetGame: () => void
}

const initialPlayer: Player = {
  coins: 200,
  level: 1,
  exp: 0,
  cured: 0,
  misdiagnosed: 0,
  totalIncome: 0,
}

const expPerLevel = 100

function getCoinsForUrgency(urgency: PetCase['urgency']): number {
  switch (urgency) {
    case 'low': return 30
    case 'medium': return 50
    case 'high': return 80
  }
}

function getPenaltyForAccident(urgency: PetCase['urgency']): number {
  switch (urgency) {
    case 'low': return 20
    case 'medium': return 35
    case 'high': return 60
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  cases: generateInitialCases(5),
  activeCaseId: null,
  player: { ...initialPlayer },
  equipment: initialEquipment.map(e => ({ ...e })),
  gamePhase: 'idle',
  accidentType: null,
  diagnosisResult: null,
  actionCooldowns: {
    examine: 0,
    medicate: 0,
    inject: 0,
    feed: 0,
    isolate: 0,
  },
  playerSteps: [],
  showStepEditor: null,

  selectCase: (id: string) => {
    const state = get()
    if (state.gamePhase === 'accident' || state.gamePhase === 'result') return
    set({
      activeCaseId: id,
      gamePhase: 'diagnosing',
      playerSteps: [],
      showStepEditor: null,
    })
  },

  examine: () => {
    const state = get()
    const activeCase = state.cases.find(c => c.id === state.activeCaseId)
    if (!activeCase) return

    const scanner = state.equipment.find(e => e.requiredAction === 'examine')
    if (scanner?.status !== 'normal') return
    if (state.actionCooldowns.examine > Date.now()) return

    const updatedCases = state.cases.map(c =>
      c.id === activeCase.id ? { ...c, examined: true } : c
    )

    set({
      cases: updatedCases,
      actionCooldowns: { ...state.actionCooldowns, examine: Date.now() + 3000 },
      gamePhase: 'sorting',
    })
  },

  addStep: (action: ActionType) => {
    const state = get()
    const equip = state.equipment.find(e => e.requiredAction === action)
    if (equip?.status !== 'normal') return

    set({
      playerSteps: [...state.playerSteps, { action, medicineId: null }],
    })
  },

  removeStep: (index: number) => {
    const state = get()
    const newSteps = state.playerSteps.filter((_, i) => i !== index)
    set({ playerSteps: newSteps, showStepEditor: null })
  },

  moveStep: (fromIndex: number, toIndex: number) => {
    const state = get()
    const steps = [...state.playerSteps]
    const [removed] = steps.splice(fromIndex, 1)
    steps.splice(toIndex, 0, removed)
    set({ playerSteps: steps })
  },

  openStepMedicine: (index: number) => {
    set({ showStepEditor: index })
  },

  setStepMedicine: (index: number, medicineId: string | null) => {
    const state = get()
    const newSteps = state.playerSteps.map((step, i) =>
      i === index ? { ...step, medicineId } : step
    )
    set({ playerSteps: newSteps, showStepEditor: null })
  },

  closeStepEditor: () => {
    set({ showStepEditor: null })
  },

  submitTreatment: () => {
    const state = get()
    const activeCase = state.cases.find(c => c.id === state.activeCaseId)
    if (!activeCase) return

    const primaryDisease = getDisease(activeCase.primaryDiseaseId)
    const complication = activeCase.complicationId ? getDisease(activeCase.complicationId) : null
    if (!primaryDisease) return

    const correctSteps = getCorrectTreatmentSteps(activeCase.primaryDiseaseId, activeCase.complicationId)
    const playerSteps = state.playerSteps

    const stepErrors: StepError[] = []
    let totalMedicineCost = 0
    let firstErrorAccident: AccidentType | null = null
    let firstErrorDamagedEquip: string | null = null

    const maxLen = Math.max(correctSteps.length, playerSteps.length)

    for (let i = 0; i < maxLen; i++) {
      const correctStep = correctSteps[i]
      const playerStep = playerSteps[i]

      if (!playerStep) {
        stepErrors.push({
          stepIndex: i,
          playerAction: ('' as ActionType),
          correctAction: correctStep.action,
          playerMedicine: null,
          correctMedicine: correctStep.medicineId,
          errorType: 'action',
        })
        if (!firstErrorAccident) {
          firstErrorAccident = primaryDisease.accidentType
        }
        continue
      }

      if (!correctStep) {
        stepErrors.push({
          stepIndex: i,
          playerAction: playerStep.action,
          correctAction: ('' as ActionType),
          playerMedicine: playerStep.medicineId,
          correctMedicine: null,
          errorType: 'action',
        })
        if (!firstErrorAccident) {
          firstErrorAccident = primaryDisease.accidentType
        }
        if (playerStep.medicineId) {
          const med = getMedicine(playerStep.medicineId)
          if (med) totalMedicineCost += med.cost
        }
        continue
      }

      if (playerStep.action !== correctStep.action) {
        stepErrors.push({
          stepIndex: i,
          playerAction: playerStep.action,
          correctAction: correctStep.action,
          playerMedicine: playerStep.medicineId,
          correctMedicine: correctStep.medicineId,
          errorType: 'action',
        })
        if (!firstErrorAccident) {
          firstErrorAccident = primaryDisease.accidentType
          if (primaryDisease.accidentType === 'bite') {
            const equip = state.equipment.find(e => e.requiredAction === playerStep.action)
            firstErrorDamagedEquip = equip?.id || null
          }
        }
      } else if (playerStep.medicineId !== correctStep.medicineId) {
        stepErrors.push({
          stepIndex: i,
          playerAction: playerStep.action,
          correctAction: correctStep.action,
          playerMedicine: playerStep.medicineId,
          correctMedicine: correctStep.medicineId,
          errorType: 'medicine',
        })
        if (!firstErrorAccident) {
          firstErrorAccident = primaryDisease.accidentType
        }
      }

      if (playerStep.medicineId) {
        const med = getMedicine(playerStep.medicineId)
        if (med) totalMedicineCost += med.cost
      }
    }

    const isCorrect = stepErrors.length === 0

    if (isCorrect) {
      const correctMedicineCost = correctSteps.reduce((sum, step) => {
        if (step.medicineId) {
          const med = getMedicine(step.medicineId)
          return sum + (med?.cost || 0)
        }
        return sum
      }, 0)

      const baseCoins = getCoinsForUrgency(activeCase.urgency)
      const complicationBonus = activeCase.complicationId ? 30 : 0
      const coinsEarned = baseCoins + complicationBonus
      const expGain = (activeCase.urgency === 'high' ? 30 : activeCase.urgency === 'medium' ? 20 : 10) + (activeCase.complicationId ? 15 : 0)
      const netCoins = coinsEarned - correctMedicineCost
      const newExp = state.player.exp + expGain
      const levelUp = newExp >= expPerLevel
      const newLevel = levelUp ? state.player.level + 1 : state.player.level
      const newExpAfterLevel = levelUp ? newExp - expPerLevel : newExp

      const updatedCases = state.cases.map(c =>
        c.id === activeCase.id ? { ...c, status: 'cured' as const } : c
      )

      let message = `治疗成功！${activeCase.petName} 的「${primaryDisease.name}」已治愈！`
      if (activeCase.complicationId && complication) {
        message += `并发症「${complication.name}」也已控制！`
      }
      if (correctMedicineCost > 0) {
        message += `（扣除药品费 ${correctMedicineCost} ⬡）`
      }

      const result: DiagnosisResult = {
        success: true,
        primaryDiseaseName: primaryDisease.name,
        complicationName: complication?.name || null,
        coinsEarned: netCoins,
        medicineCost: correctMedicineCost,
        accidentType: null,
        damagedEquipment: null,
        message,
        stepErrors: [],
      }

      set({
        cases: updatedCases,
        player: {
          ...state.player,
          coins: state.player.coins + netCoins,
          level: newLevel,
          exp: newExpAfterLevel,
          cured: state.player.cured + 1,
          totalIncome: state.player.totalIncome + coinsEarned,
        },
        gamePhase: 'result',
        diagnosisResult: result,
      })
    } else {
      const penalty = getPenaltyForAccident(activeCase.urgency)
      const totalDeduction = penalty + totalMedicineCost

      const updatedCases = state.cases.map(c =>
        c.id === activeCase.id ? { ...c, status: 'accident' as const } : c
      )

      const updatedEquipment = firstErrorDamagedEquip
        ? state.equipment.map(e =>
            e.id === firstErrorDamagedEquip ? { ...e, status: 'damaged' as const } : e
          )
        : state.equipment

      const firstError = stepErrors[0]
      let message = ''
      if (firstError) {
        if (firstError.errorType === 'action') {
          if (firstError.correctAction && firstError.playerAction) {
            message = `第${firstError.stepIndex + 1}步操作错误！应该${getActionLabel(firstError.correctAction)}而不是${getActionLabel(firstError.playerAction)}！`
          } else if (!firstError.playerAction) {
            message = `缺少第${firstError.stepIndex + 1}步：应该执行${getActionLabel(firstError.correctAction)}！`
          } else {
            message = `第${firstError.stepIndex + 1}步多余：不应该执行${getActionLabel(firstError.playerAction)}！`
          }
        } else {
          const correctMed = firstError.correctMedicine ? getMedicine(firstError.correctMedicine)?.name : '无需药品'
          const playerMed = firstError.playerMedicine ? getMedicine(firstError.playerMedicine)?.name : '未选药品'
          message = `第${firstError.stepIndex + 1}步药品错误！应该用「${correctMed}」而不是「${playerMed}」！`
        }
      }
      if (totalMedicineCost > 0) {
        message += `（消耗药品费 ${totalMedicineCost} ⬡）`
      }

      const result: DiagnosisResult = {
        success: false,
        primaryDiseaseName: primaryDisease.name,
        complicationName: complication?.name || null,
        coinsEarned: -totalDeduction,
        medicineCost: totalMedicineCost,
        accidentType: firstErrorAccident,
        damagedEquipment: firstErrorDamagedEquip,
        message,
        stepErrors,
      }

      set({
        cases: updatedCases,
        equipment: updatedEquipment,
        player: {
          ...state.player,
          coins: Math.max(0, state.player.coins - totalDeduction),
          misdiagnosed: state.player.misdiagnosed + 1,
        },
        gamePhase: 'accident',
        accidentType: firstErrorAccident,
        diagnosisResult: result,
      })
    }
  },

  repairEquipment: (id: string) => {
    const state = get()
    const equip = state.equipment.find(e => e.id === id)
    if (!equip || equip.status === 'normal') return
    if (state.player.coins < equip.repairCost) return

    set({
      equipment: state.equipment.map(e =>
        e.id === id ? { ...e, status: 'normal' as const } : e
      ),
      player: {
        ...state.player,
        coins: state.player.coins - equip.repairCost,
      },
    })
  },

  dismissResult: () => {
    const state = get()
    const remainingCases = state.cases.filter(c => c.status !== 'cured' && c.status !== 'accident')
    while (remainingCases.length < 4) {
      remainingCases.push(generatePetCase())
    }

    set({
      activeCaseId: null,
      gamePhase: 'idle',
      diagnosisResult: null,
      cases: remainingCases,
      playerSteps: [],
      showStepEditor: null,
    })
  },

  dismissAccident: () => {
    const state = get()
    const remainingCases = state.cases.filter(c => c.status !== 'cured' && c.status !== 'accident')
    while (remainingCases.length < 4) {
      remainingCases.push(generatePetCase())
    }

    set({
      activeCaseId: null,
      gamePhase: 'idle',
      accidentType: null,
      diagnosisResult: null,
      cases: remainingCases,
      playerSteps: [],
      showStepEditor: null,
    })
  },

  generateNewCase: () => {
    const state = get()
    const newCase = generatePetCase()
    set({ cases: [...state.cases, newCase] })
  },

  loadTestCases: () => {
    set({
      cases: generateTestCases(),
      activeCaseId: null,
      gamePhase: 'idle',
      accidentType: null,
      diagnosisResult: null,
      playerSteps: [],
      showStepEditor: null,
    })
  },

  resetGame: () => {
    set({
      cases: generateInitialCases(5),
      activeCaseId: null,
      player: { ...initialPlayer },
      equipment: initialEquipment.map(e => ({ ...e })),
      gamePhase: 'idle',
      accidentType: null,
      diagnosisResult: null,
      actionCooldowns: {
        examine: 0,
        medicate: 0,
        inject: 0,
        feed: 0,
        isolate: 0,
      },
      playerSteps: [],
      showStepEditor: null,
    })
  },
}))
