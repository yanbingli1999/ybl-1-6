import { useGameStore } from '@/store/useGameStore'
import { getBreed, getSymptom, getDisease, isDistractorSymptom } from '@/data/gameData'
import { Activity, Scan, TrendingUp, AlertTriangle } from 'lucide-react'

export default function SymptomCard() {
  const activeCaseId = useGameStore(s => s.activeCaseId)
  const cases = useGameStore(s => s.cases)
  const gamePhase = useGameStore(s => s.gamePhase)

  const activeCase = cases.find(c => c.id === activeCaseId)

  if (!activeCase) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <Scan className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">从左侧选择一个病例开始诊断</p>
      </div>
    )
  }

  const breed = getBreed(activeCase.breedId)
  const primaryDisease = getDisease(activeCase.primaryDiseaseId)
  const complication = activeCase.complicationId ? getDisease(activeCase.complicationId) : null
  const caseSymptoms = activeCase.symptomIds.map(sid => getSymptom(sid)).filter(Boolean)

  const confidences = activeCase.examined ? activeCase.confidences : []

  function getWeightColor(weight: number): string {
    if (weight >= 80) return 'text-red-400'
    if (weight >= 60) return 'text-yellow-400'
    if (weight >= 40) return 'text-cyan-400'
    return 'text-gray-500'
  }

  function getWeightBarColor(weight: number): string {
    if (weight >= 80) return 'bg-red-500/60'
    if (weight >= 60) return 'bg-yellow-500/60'
    if (weight >= 40) return 'bg-cyan-500/60'
    return 'bg-gray-600/40'
  }

  function getSymptomRelevance(symptomId: string): { weight: number; label: string } {
    if (!primaryDisease) return { weight: 0, label: '未知' }

    const primaryWeight = primaryDisease.symptomWeights[symptomId] || 0
    const complicationWeight = complication?.symptomWeights[symptomId] || 0
    const maxWeight = Math.max(primaryWeight, complicationWeight)

    if (maxWeight >= 80) return { weight: maxWeight, label: '高度相关' }
    if (maxWeight >= 50) return { weight: maxWeight, label: '中度相关' }
    if (maxWeight > 0) return { weight: maxWeight, label: '轻度相关' }
    return { weight: 0, label: '干扰项' }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-800/30 bg-gray-900/60 backdrop-blur-sm">
      <div className="scan-line" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{breed?.emoji}</span>
            <div>
              <h3 className="font-display text-base text-cyan-300 tracking-wide">
                {activeCase.petName}
              </h3>
              <p className="text-xs text-gray-500">{breed?.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`
              px-2 py-1 rounded text-xs font-medium
              ${activeCase.urgency === 'high' ? 'bg-red-900/50 text-red-300' :
                activeCase.urgency === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-green-900/50 text-green-300'}
            `}>
              {activeCase.urgency === 'high' ? '⚠ 紧急' :
               activeCase.urgency === 'medium' ? '◉ 一般' : '✦ 轻微'}
            </div>
            {activeCase.complicationId && (
              <div className="px-2 py-0.5 rounded text-[9px] bg-purple-900/50 text-purple-300 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                疑似并发症
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <h4 className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
            <Activity className="w-3 h-3" />症状列表
            <span className="ml-auto text-gray-600">点击「检查」查看置信度</span>
          </h4>
          {caseSymptoms.map((symptom, i) => {
            const relevance = getSymptomRelevance(symptom!.id)
            const isDistractor = isDistractorSymptom(symptom!.id, activeCase.primaryDiseaseId, activeCase.complicationId)
            return (
              <div
                key={symptom!.id}
                className="symptom-item bg-gray-800/60 rounded-lg p-3 border border-gray-700/50"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-200 font-medium">
                    {symptom!.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeCase.examined && (
                      <span className={`text-[10px] font-medium ${getWeightColor(relevance.weight)}`}>
                        {relevance.label}
                      </span>
                    )}
                    {!activeCase.examined && isDistractor && (
                      <span className="text-[9px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                        干扰项
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-2">{symptom!.description}</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full vital-bar ${activeCase.examined ? getWeightBarColor(relevance.weight) : 'bg-cyan-500/60'}`}
                      style={{ width: activeCase.examined ? `${Math.max(relevance.weight, 20)}%` : `${55 + Math.random() * 35}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">{symptom!.vitals}</span>
                  {activeCase.examined && relevance.weight > 0 && (
                    <span className={`text-[10px] font-mono font-medium ${getWeightColor(relevance.weight)}`}>
                      <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                      {relevance.weight}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {activeCase.examined && confidences.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-cyan-900/20 border border-cyan-700/30">
            <h4 className="text-[10px] uppercase tracking-widest text-cyan-500 mb-2 flex items-center gap-1">
              <Scan className="w-3 h-3" />深度扫描 · 疾病置信度分析
            </h4>
            <div className="space-y-1.5">
              {confidences.slice(0, 4).map((conf, i) => (
                <div key={conf.diseaseId} className="flex items-center gap-2">
                  <span className={`text-[10px] w-4 text-center font-mono ${i === 0 ? 'text-cyan-300' : 'text-gray-600'}`}>
                    {i + 1}.
                  </span>
                  <span className={`text-xs flex-1 ${i === 0 ? 'text-cyan-200 font-medium' : 'text-gray-400'}`}>
                    {conf.diseaseName}
                  </span>
                  <div className="w-20 h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        conf.confidence >= 75 ? 'bg-red-500/70' :
                        conf.confidence >= 50 ? 'bg-yellow-500/70' :
                        conf.confidence >= 30 ? 'bg-cyan-500/60' :
                        'bg-gray-600/50'
                      }`}
                      style={{ width: `${conf.confidence}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono font-medium w-8 text-right ${
                    conf.confidence >= 75 ? 'text-red-400' :
                    conf.confidence >= 50 ? 'text-yellow-400' :
                    'text-gray-500'
                  }`}>
                    {conf.confidence}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 italic">
              提示：根据置信度排序治疗步骤，注意主病与并发症的先后顺序
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
