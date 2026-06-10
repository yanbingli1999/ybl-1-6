import { useGameStore } from '@/store/useGameStore'
import { getMedicine, getActionLabel, type StepError } from '@/data/gameData'
import { CheckCircle, XCircle, ArrowRight, Pill, AlertCircle, Coins, AlertTriangle, ListChecks } from 'lucide-react'

export default function DiagnosisResult() {
  const diagnosisResult = useGameStore(s => s.diagnosisResult)
  const dismissResult = useGameStore(s => s.dismissResult)
  const gamePhase = useGameStore(s => s.gamePhase)

  if (gamePhase !== 'result' || !diagnosisResult) return null

  function renderStepError(error: StepError) {
    const playerMed = error.playerMedicine ? getMedicine(error.playerMedicine) : null
    const correctMed = error.correctMedicine ? getMedicine(error.correctMedicine) : null

    return (
      <div key={error.stepIndex} className="bg-gray-800/40 rounded-lg p-2 border border-gray-700/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-red-900/50 border border-red-700/40 flex items-center justify-center text-[10px] font-bold text-red-300">
            {error.stepIndex + 1}
          </span>
          <span className="text-[11px] text-gray-400">第{error.stepIndex + 1}步</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${error.errorType === 'action' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'}`}>
            {error.errorType === 'action' ? '操作错误' : '药品错误'}
          </span>
        </div>

        {error.errorType === 'action' ? (
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            {error.playerAction ? (
              <span className="text-red-400">{getActionLabel(error.playerAction)}</span>
            ) : (
              <span className="text-red-400">（缺失）</span>
            )}
            <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
            {error.correctAction ? (
              <span className="text-green-400">{getActionLabel(error.correctAction)}</span>
            ) : (
              <span className="text-green-400">（不需要此步）</span>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Pill className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
              <span className="text-red-400">{playerMed?.name || '未选药品'}</span>
              <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <Pill className="w-2.5 h-2.5 text-green-400 flex-shrink-0" />
              <span className="text-green-400">{correctMed?.name || '无需药品'}</span>
            </div>
            {error.playerAction && error.correctAction && error.playerAction !== error.correctAction && (
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span>操作也有误：</span>
                <span className="text-red-400">{getActionLabel(error.playerAction)}</span>
                <ArrowRight className="w-2.5 h-2.5 text-gray-600" />
                <span className="text-green-400">{getActionLabel(error.correctAction)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 bg-gray-900 border border-cyan-700/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl shadow-cyan-900/20 max-h-[85vh] overflow-y-auto">
        <div className="text-center">
          {diagnosisResult.success ? (
            <>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-900/30 border border-green-600/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="font-display text-xl text-green-400 tracking-wider mb-1">
                治疗成功！
              </h2>

              <div className="space-y-1 mb-3">
                <p className="text-sm text-gray-300">{diagnosisResult.message}</p>
                {diagnosisResult.complicationName && (
                  <p className="text-[11px] text-purple-400 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    并发症「{diagnosisResult.complicationName}」同步治愈
                  </p>
                )}
              </div>

              <div className="bg-green-900/20 rounded-lg p-3 border border-green-800/20 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">⬡</span>
                  <span className={`font-display text-2xl ${diagnosisResult.coinsEarned >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {diagnosisResult.coinsEarned >= 0 ? '+' : ''}{diagnosisResult.coinsEarned}
                  </span>
                </div>
                {diagnosisResult.medicineCost > 0 && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
                    <span>收入 {diagnosisResult.coinsEarned + diagnosisResult.medicineCost} ⬡</span>
                    <span>−</span>
                    <span className="text-red-400">药品费 {diagnosisResult.medicineCost} ⬡</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-green-400">
                  <ListChecks className="w-2.5 h-2.5" />
                  <span>全部治疗步骤正确</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-900/30 border border-red-600/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="font-display text-xl text-red-400 tracking-wider mb-1">
                治疗失败
              </h2>

              <div className="space-y-1 mb-3">
                <p className="text-sm text-gray-300">{diagnosisResult.message}</p>
                <div className="flex items-center justify-center gap-2 text-[11px]">
                  <span className="text-gray-500">主病：</span>
                  <span className="text-cyan-300">{diagnosisResult.primaryDiseaseName}</span>
                  {diagnosisResult.complicationName && (
                    <>
                      <span className="text-gray-600">+</span>
                      <span className="text-purple-300">{diagnosisResult.complicationName}</span>
                    </>
                  )}
                </div>
              </div>

              {diagnosisResult.stepErrors.length > 0 && (
                <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/30 space-y-2 mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-red-400 uppercase tracking-wider">
                    <AlertCircle className="w-3 h-3" />
                    <span>共 {diagnosisResult.stepErrors.length} 处错误</span>
                  </div>
                  <div className="space-y-1.5">
                    {diagnosisResult.stepErrors.map(renderStepError)}
                  </div>
                </div>
              )}

              <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/30 space-y-1.5">
                <div className="flex items-center justify-center gap-1 text-[10px] text-red-400">
                  <AlertCircle className="w-2.5 h-2.5" />
                  <span>罚款 {Math.abs(diagnosisResult.coinsEarned) - diagnosisResult.medicineCost} ⬡</span>
                </div>
                {diagnosisResult.medicineCost > 0 && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
                    <span>消耗药品费 {diagnosisResult.medicineCost} ⬡</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 pt-1 border-t border-gray-700/50">
                  <Coins className="w-2.5 h-2.5" />
                  <span>总计：</span>
                  <span className="text-red-400 font-medium">-{Math.abs(diagnosisResult.coinsEarned)} ⬡</span>
                </div>
                {diagnosisResult.damagedEquipment && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-orange-400 pt-1 border-t border-gray-700/50">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>设备损坏，需维修！</span>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            onClick={dismissResult}
            className="mt-4 w-full py-2.5 rounded-lg bg-cyan-900/30 border border-cyan-700/30 text-cyan-300 text-sm font-display tracking-wide hover:bg-cyan-900/50 transition-colors"
          >
            继续诊疗
          </button>
        </div>
      </div>
    </div>
  )
}
