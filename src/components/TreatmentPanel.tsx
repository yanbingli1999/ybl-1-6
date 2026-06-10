import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { getBreed, medicines, getMedicine, getActionLabel, type ActionType } from '@/data/gameData'
import {
  Search, Pill, Syringe, UtensilsCrossed, ShieldAlert, X,
  ChevronUp, ChevronDown, Plus, ArrowRight, CheckCircle, AlertCircle, Trash2
} from 'lucide-react'

const actionDefs: { type: ActionType; label: string; icon: typeof Search; color: string; bgColor: string; borderColor: string }[] = [
  { type: 'examine', label: '检查', icon: Search, color: 'text-cyan-400', bgColor: 'from-cyan-900/40 to-cyan-800/20', borderColor: 'hover:border-cyan-600/40' },
  { type: 'medicate', label: '用药', icon: Pill, color: 'text-purple-400', bgColor: 'from-purple-900/40 to-purple-800/20', borderColor: 'hover:border-purple-600/40' },
  { type: 'inject', label: '打针', icon: Syringe, color: 'text-green-400', bgColor: 'from-green-900/40 to-green-800/20', borderColor: 'hover:border-green-600/40' },
  { type: 'feed', label: '喂食', icon: UtensilsCrossed, color: 'text-orange-400', bgColor: 'from-orange-900/40 to-orange-800/20', borderColor: 'hover:border-orange-600/40' },
  { type: 'isolate', label: '隔离', icon: ShieldAlert, color: 'text-red-400', bgColor: 'from-red-900/40 to-red-800/20', borderColor: 'hover:border-red-600/40' },
]

export default function TreatmentPanel() {
  const activeCaseId = useGameStore(s => s.activeCaseId)
  const cases = useGameStore(s => s.cases)
  const equipment = useGameStore(s => s.equipment)
  const gamePhase = useGameStore(s => s.gamePhase)
  const playerSteps = useGameStore(s => s.playerSteps)
  const showStepEditor = useGameStore(s => s.showStepEditor)
  const examine = useGameStore(s => s.examine)
  const addStep = useGameStore(s => s.addStep)
  const removeStep = useGameStore(s => s.removeStep)
  const moveStep = useGameStore(s => s.moveStep)
  const openStepMedicine = useGameStore(s => s.openStepMedicine)
  const setStepMedicine = useGameStore(s => s.setStepMedicine)
  const closeStepEditor = useGameStore(s => s.closeStepEditor)
  const submitTreatment = useGameStore(s => s.submitTreatment)

  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const activeCase = cases.find(c => c.id === activeCaseId)
  const breed = activeCase ? getBreed(activeCase.breedId) : null

  if (!activeCase || !breed) return null

  const isDisabled = gamePhase === 'accident' || gamePhase === 'result'
  const canSort = gamePhase === 'sorting' || gamePhase === 'diagnosing'
  const showSortingUI = activeCase.examined && canSort

  function isActionAvailable(type: ActionType): boolean {
    if (isDisabled) return false
    const equip = equipment.find(e => e.requiredAction === type)
    return equip?.status === 'normal'
  }

  function getActionDef(type: ActionType) {
    return actionDefs.find(a => a.type === type) || actionDefs[0]
  }

  function stepNeedsMedicine(action: ActionType): boolean {
    return action === 'medicate' || action === 'inject' || action === 'feed'
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== dropIndex) {
      moveStep(dragIndex, dropIndex)
    }
    setDragIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs tracking-widest text-gray-400 uppercase">
          {showSortingUI ? '治疗步骤排序' : '诊疗操作'}
        </h3>
        {activeCase.examined && (
          <span className="text-[10px] text-cyan-500 bg-cyan-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" />
            已扫描
          </span>
        )}
      </div>

      {!showSortingUI ? (
        <>
          <div className="grid grid-cols-5 gap-2">
            {actionDefs.map(({ type, label, icon: Icon, color, bgColor, borderColor }) => {
              const available = isActionAvailable(type)
              const equip = equipment.find(e => e.requiredAction === type)

              return (
                <button
                  key={type}
                  onClick={() => type === 'examine' ? examine() : null}
                  disabled={!available || type !== 'examine'}
                  className={`
                    relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200
                    bg-gradient-to-b ${bgColor}
                    border ${available ? 'border-gray-700/50 ' + borderColor : 'border-gray-800/30'}
                    ${available && type === 'examine' ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                    ${type === 'examine' && activeCase.examined ? 'ring-1 ring-cyan-700/30' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 ${available ? color : 'text-gray-600'}`} />
                  <span className={`text-[11px] font-medium ${available ? 'text-gray-300' : 'text-gray-600'}`}>
                    {label}
                  </span>
                  {equip?.status === 'damaged' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>

          {!activeCase.examined && (
            <div className="text-center py-2 px-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
              <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                <Search className="w-3 h-3 text-cyan-500" />
                请先点击「检查」进行深度扫描，获取疾病置信度后排序治疗步骤
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">添加步骤</span>
              <div className="flex-1 h-px bg-gray-700/50" />
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {actionDefs.map(({ type, label, icon: Icon, color, bgColor, borderColor }) => {
                const available = isActionAvailable(type)
                return (
                  <button
                    key={type}
                    onClick={() => available && addStep(type)}
                    disabled={!available}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150
                      bg-gradient-to-b ${bgColor}
                      border ${available ? 'border-gray-700/40 ' + borderColor : 'border-gray-800/20'}
                      ${available ? 'hover:scale-105 cursor-pointer' : 'opacity-30 cursor-not-allowed'}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${available ? color : 'text-gray-600'}`} />
                    <span className={`text-[9px] font-medium ${available ? 'text-gray-400' : 'text-gray-600'}`}>
                      {label}
                    </span>
                    <Plus className="w-3 h-3 text-gray-600 opacity-60" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">治疗流程 ({playerSteps.length} 步)</span>
              <div className="flex-1 h-px bg-gray-700/50" />
              {playerSteps.length > 0 && (
                <span className="text-[9px] text-gray-600">拖拽调整顺序</span>
              )}
            </div>

            {playerSteps.length === 0 ? (
              <div className="py-8 text-center rounded-lg border border-dashed border-gray-700/50 bg-gray-800/20">
                <div className="text-gray-600 text-3xl mb-2">📋</div>
                <p className="text-xs text-gray-500">点击上方按钮添加治疗步骤</p>
                <p className="text-[10px] text-gray-600 mt-1">按正确顺序排列：检查 → 治疗 → 护理</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {playerSteps.map((step, index) => {
                  const def = getActionDef(step.action)
                  const Icon = def.icon
                  const med = step.medicineId ? getMedicine(step.medicineId) : null
                  const needsMed = stepNeedsMedicine(step.action)
                  const isEditing = showStepEditor === index

                  return (
                    <div key={index}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`
                          flex items-center gap-2 p-2.5 rounded-lg border transition-all
                          bg-gray-800/60 border-gray-700/50
                          ${dragIndex === index ? 'opacity-50 scale-95' : ''}
                          ${isEditing ? 'ring-1 ring-purple-500/40 border-purple-600/40' : ''}
                          hover:border-gray-600/50 cursor-grab active:cursor-grabbing
                        `}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono bg-gradient-to-b ${def.bgColor} ${def.color} border border-gray-700/50`}>
                          {index + 1}
                        </div>

                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-b ${def.bgColor} ${def.color} border border-gray-700/50`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-200 font-medium">{getActionLabel(step.action)}</div>
                          {needsMed && (
                            med ? (
                              <div className="flex items-center gap-1 text-[10px]">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: med.color }} />
                                <span className="text-gray-400">{med.name}</span>
                                <span className="text-yellow-500/80">{med.cost}⬡</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-yellow-500/80">
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span>未选择药品</span>
                              </div>
                            )
                          )}
                        </div>

                        <div className="flex items-center gap-0.5">
                          {needsMed && (
                            <button
                              onClick={() => openStepMedicine(index)}
                              className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-purple-400 transition-colors"
                              title="选择药品"
                            >
                              <Pill className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => index > 0 && moveStep(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => index < playerSteps.length - 1 && moveStep(index, index + 1)}
                            disabled={index === playerSteps.length - 1}
                            className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeStep(index)}
                            className="p-1 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {isEditing && needsMed && (
                        <div className="ml-8 mt-1 p-2 rounded-lg bg-gray-900/80 border border-purple-700/30">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-purple-400 font-medium">选择药品/物品</span>
                            <button
                              onClick={closeStepEditor}
                              className="text-gray-500 hover:text-gray-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {medicines.map(med => (
                              <button
                                key={med.id}
                                onClick={() => setStepMedicine(index, med.id)}
                                className={`
                                  flex items-center gap-2 p-1.5 rounded text-left transition-all
                                  ${step.medicineId === med.id ? 'bg-purple-900/30 border border-purple-600/40' : 'bg-gray-800/60 border border-gray-700/40 hover:border-purple-600/30'}
                                `}
                              >
                                <div
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: med.color, boxShadow: `0 0 6px ${med.color}40` }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] text-gray-200">{med.name}</div>
                                  <div className="text-[9px] text-gray-500">{med.effect}</div>
                                </div>
                                <span className="text-[10px] text-yellow-500 font-mono">{med.cost}⬡</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {index < playerSteps.length - 1 && (
                        <div className="flex items-center justify-center py-0.5">
                          <ArrowRight className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {playerSteps.length > 0 && (
            <button
              onClick={submitTreatment}
              className={`
                w-full py-2.5 rounded-lg font-display text-sm tracking-wide transition-all
                flex items-center justify-center gap-2
                ${playerSteps.every(s => !stepNeedsMedicine(s.action) || s.medicineId)
                  ? 'bg-gradient-to-r from-cyan-900/50 to-green-900/40 border border-cyan-600/40 text-cyan-300 hover:from-cyan-900/70 hover:to-green-900/50 hover:shadow-lg'
                  : 'bg-gray-800/50 border border-yellow-700/30 text-yellow-400/80 hover:bg-gray-800/70'
                }
              `}
            >
              <CheckCircle className="w-4 h-4" />
              {playerSteps.every(s => !stepNeedsMedicine(s.action) || s.medicineId)
                ? '确认治疗方案'
                : '仍有步骤未选药品，确认提交？'
              }
            </button>
          )}
        </>
      )}

      <div className="flex items-center justify-center py-2">
        <div className="pet-display">
          <div className={`pet-${breed.shape}`} style={{ color: breed.color }}>
            <span className="text-5xl block animate-pet-idle">{breed.emoji}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
