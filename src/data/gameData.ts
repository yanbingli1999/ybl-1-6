export interface Breed {
  id: string
  name: string
  emoji: string
  color: string
  shape: string
}

export interface Symptom {
  id: string
  name: string
  description: string
  vitals: string
  baseWeight: number
}

export interface TreatmentStep {
  action: ActionType
  medicineId: string | null
  label: string
}

export interface Disease {
  id: string
  name: string
  description: string
  accidentType: AccidentType
  symptomWeights: Record<string, number>
  treatmentSteps: TreatmentStep[]
  possibleComplications: string[]
}

export interface Medicine {
  id: string
  name: string
  effect: string
  color: string
  cost: number
}

export interface Equipment {
  id: string
  name: string
  status: 'normal' | 'damaged' | 'repairing'
  repairCost: number
  requiredAction: ActionType
}

export interface DiseaseConfidence {
  diseaseId: string
  diseaseName: string
  confidence: number
}

export interface PetCase {
  id: string
  petName: string
  breedId: string
  primaryDiseaseId: string
  complicationId: string | null
  symptomIds: string[]
  urgency: 'low' | 'medium' | 'high'
  status: 'waiting' | 'diagnosing' | 'treating' | 'cured' | 'accident'
  examined: boolean
  confidences: DiseaseConfidence[]
  playerStepOrder: ActionType[]
}

export interface Player {
  coins: number
  level: number
  exp: number
  cured: number
  misdiagnosed: number
  totalIncome: number
}

export type ActionType = 'examine' | 'medicate' | 'inject' | 'feed' | 'isolate'
export type AccidentType = 'split' | 'float' | 'bite'
export type GamePhase = 'idle' | 'diagnosing' | 'treating' | 'sorting' | 'accident' | 'result'

export interface StepError {
  stepIndex: number
  playerAction: ActionType
  correctAction: ActionType
  playerMedicine: string | null
  correctMedicine: string | null
  errorType: 'action' | 'medicine'
}

export interface DiagnosisResult {
  success: boolean
  primaryDiseaseName: string
  complicationName: string | null
  coinsEarned: number
  medicineCost: number
  accidentType: AccidentType | null
  damagedEquipment: string | null
  message: string
  stepErrors: StepError[]
}

export const breeds: Breed[] = [
  { id: 'slime', name: '黏液球', emoji: '🟢', color: '#00ff88', shape: 'blob' },
  { id: 'tentacle', name: '触手怪', emoji: '🟣', color: '#7b61ff', shape: 'tentacles' },
  { id: 'crystal', name: '晶晶体', emoji: '🔷', color: '#00d4ff', shape: 'prism' },
  { id: 'bubble', name: '气泡兽', emoji: '🟠', color: '#ff8855', shape: 'bubbles' },
  { id: 'shadow', name: '影子虫', emoji: '⚫', color: '#888899', shape: 'shadow' },
  { id: 'flame', name: '火焰崽', emoji: '🔴', color: '#ff4422', shape: 'flame' },
]

export const symptoms: Symptom[] = [
  { id: 'spotted_skin', name: '斑点皮肤', description: '皮肤上出现闪烁的分裂斑点', vitals: '细胞分裂速率: 900%', baseWeight: 85 },
  { id: 'rising_body', name: '身体上升', description: '宠物不受控制地向上飘浮', vitals: '重力系数: -2.3', baseWeight: 90 },
  { id: 'gnashing', name: '磨牙撕咬', description: '疯狂咬任何靠近的东西', vitals: '咬合力: 5000N', baseWeight: 88 },
  { id: 'empty_stomach', name: '胃部空虚', description: '能量场剧烈波动', vitals: '饥饿指数: 99.7%', baseWeight: 92 },
  { id: 'crystal_sputum', name: '晶体痰', description: '咳出小型晶体碎片', vitals: '硬度: 莫氏8.5', baseWeight: 87 },
  { id: 'rust_patches', name: '锈斑', description: '身体表面出现腐蚀锈斑', vitals: '腐蚀速率: 3mm/h', baseWeight: 86 },
  { id: 'trembling', name: '能量震颤', description: '身体不受控制地高频震动', vitals: '震动频率: 120Hz', baseWeight: 60 },
  { id: 'color_shift', name: '体色异变', description: '皮肤颜色不断随机变化', vitals: '色谱偏移: Δ450nm', baseWeight: 55 },
  { id: 'excess_slime', name: '过度分泌', description: '体表不断渗出黏液', vitals: '分泌速率: 20ml/min', baseWeight: 50 },
  { id: 'glowing_eyes', name: '眼睛发光', description: '眼睛发出刺眼的光芒', vitals: '发光强度: 800流明', baseWeight: 45 },
]

export const diseases: Disease[] = [
  {
    id: 'split_pox',
    name: '分裂痘',
    description: '宠物身上出现分裂斑点，细胞异常分裂',
    accidentType: 'split',
    symptomWeights: { spotted_skin: 95, trembling: 50, color_shift: 30 },
    treatmentSteps: [
      { action: 'examine', medicineId: null, label: '深度扫描确诊' },
      { action: 'inject', medicineId: 'stabilizer', label: '注射稳定剂' },
      { action: 'medicate', medicineId: 'stabilizer', label: '口服稳定剂巩固' },
    ],
    possibleComplications: ['float_fever'],
  },
  {
    id: 'float_fever',
    name: '飘浮热',
    description: '宠物不受控制向上飘浮，重力感应异常',
    accidentType: 'float',
    symptomWeights: { rising_body: 95, trembling: 40, glowing_eyes: 35 },
    treatmentSteps: [
      { action: 'examine', medicineId: null, label: '重力场检测' },
      { action: 'medicate', medicineId: 'gravity_pill', label: '服用重力丸' },
      { action: 'feed', medicineId: 'cosmic_kibble', label: '喂食营养粮' },
    ],
    possibleComplications: ['shadow_rust'],
  },
  {
    id: 'chomp_bite',
    name: '噬咬狂',
    description: '宠物疯狂咬周围一切，攻击性异常',
    accidentType: 'bite',
    symptomWeights: { gnashing: 95, glowing_eyes: 50, trembling: 40 },
    treatmentSteps: [
      { action: 'isolate', medicineId: null, label: '隔离约束' },
      { action: 'examine', medicineId: null, label: '神经扫描' },
      { action: 'inject', medicineId: 'shine_serum', label: '注射镇静血清' },
    ],
    possibleComplications: ['split_pox'],
  },
  {
    id: 'hunger_storm',
    name: '饥饿风暴',
    description: '宠物极度饥饿产生能量风暴',
    accidentType: 'float',
    symptomWeights: { empty_stomach: 95, trembling: 55, excess_slime: 30 },
    treatmentSteps: [
      { action: 'examine', medicineId: null, label: '能量场检测' },
      { action: 'feed', medicineId: 'cosmic_kibble', label: '紧急喂食' },
      { action: 'medicate', medicineId: 'soft_syrup', label: '营养糖浆调理' },
    ],
    possibleComplications: ['float_fever'],
  },
  {
    id: 'crystal_cough',
    name: '晶体咳',
    description: '咳出小晶体碎片，体内矿物化',
    accidentType: 'split',
    symptomWeights: { crystal_sputum: 95, color_shift: 45, excess_slime: 35 },
    treatmentSteps: [
      { action: 'examine', medicineId: null, label: '晶体成分分析' },
      { action: 'medicate', medicineId: 'soft_syrup', label: '服用软化糖浆' },
      { action: 'feed', medicineId: 'cosmic_kibble', label: '喂食特殊饲料' },
    ],
    possibleComplications: ['chomp_bite'],
  },
  {
    id: 'shadow_rust',
    name: '暗影锈',
    description: '身体逐渐腐蚀生锈，暗影能量侵蚀',
    accidentType: 'bite',
    symptomWeights: { rust_patches: 95, color_shift: 50, glowing_eyes: 40 },
    treatmentSteps: [
      { action: 'isolate', medicineId: null, label: '隔离防止扩散' },
      { action: 'examine', medicineId: null, label: '腐蚀度检测' },
      { action: 'inject', medicineId: 'shine_serum', label: '注射闪光血清' },
      { action: 'medicate', medicineId: 'shine_serum', label: '口服巩固' },
    ],
    possibleComplications: ['crystal_cough'],
  },
]

export const medicines: Medicine[] = [
  { id: 'stabilizer', name: '稳定剂', effect: '阻止细胞异常分裂', color: '#00ff88', cost: 30 },
  { id: 'gravity_pill', name: '重力丸', effect: '恢复正常引力感应', color: '#7b61ff', cost: 25 },
  { id: 'cosmic_kibble', name: '宇宙粮', effect: '高能量营养饲料', color: '#ff8855', cost: 15 },
  { id: 'soft_syrup', name: '软化糖浆', effect: '溶解体内晶体', color: '#00d4ff', cost: 35 },
  { id: 'shine_serum', name: '闪光血清', effect: '驱散暗影腐蚀', color: '#ffdd00', cost: 40 },
]

export const initialEquipment: Equipment[] = [
  { id: 'scanner', name: '扫描仪', status: 'normal', repairCost: 50, requiredAction: 'examine' },
  { id: 'injector', name: '注射器', status: 'normal', repairCost: 60, requiredAction: 'inject' },
  { id: 'dispenser', name: '药品发放器', status: 'normal', repairCost: 45, requiredAction: 'medicate' },
  { id: 'feeder', name: '喂食器', status: 'normal', repairCost: 30, requiredAction: 'feed' },
  { id: 'isolation_unit', name: '隔离舱', status: 'normal', repairCost: 80, requiredAction: 'isolate' },
]

const petNames: string[] = [
  '咕噜', '哔哔', '噗噗', '嘶嘶', '嗡嗡', '咔咔',
  '哧哧', '咻咻', '嗒嗒', '嘟嘟', '啵啵', '嗷嗷',
  '呱呱', '喵喵', '汪汪', '吱吱', '嘎嘎', '喵呜',
  '波波', '闪闪', '星星', '球球', '泡泡', '萌萌',
]

export function getBreed(id: string): Breed | undefined {
  return breeds.find(b => b.id === id)
}

export function getDisease(id: string): Disease | undefined {
  return diseases.find(d => d.id === id)
}

export function getSymptom(id: string): Symptom | undefined {
  return symptoms.find(s => s.id === id)
}

export function getMedicine(id: string): Medicine | undefined {
  return medicines.find(m => m.id === id)
}

export function getActionLabel(action: ActionType): string {
  switch (action) {
    case 'examine': return '检查'
    case 'medicate': return '用药'
    case 'inject': return '打针'
    case 'feed': return '喂食'
    case 'isolate': return '隔离'
  }
}

export function getAllTreatmentActions(): ActionType[] {
  return ['examine', 'medicate', 'inject', 'feed', 'isolate']
}

export function calculateConfidences(symptomIds: string[]): DiseaseConfidence[] {
  const confidences: DiseaseConfidence[] = diseases.map(disease => {
    let totalWeight = 0
    let matchedWeight = 0

    Object.entries(disease.symptomWeights).forEach(([symptomId, weight]) => {
      totalWeight += weight
      if (symptomIds.includes(symptomId)) {
        matchedWeight += weight
      }
    })

    symptomIds.forEach(symptomId => {
      if (!(symptomId in disease.symptomWeights)) {
        const symptom = getSymptom(symptomId)
        if (symptom) {
          totalWeight += symptom.baseWeight * 0.3
        }
      }
    })

    const confidence = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0
    return {
      diseaseId: disease.id,
      diseaseName: disease.name,
      confidence: Math.max(5, Math.min(98, confidence + Math.floor(Math.random() * 11) - 5)),
    }
  })

  return confidences.sort((a, b) => b.confidence - a.confidence)
}

export function getSymptomsForDisease(diseaseId: string): string[] {
  const disease = getDisease(diseaseId)
  if (!disease) return []
  return Object.keys(disease.symptomWeights)
}

export function getCorrectTreatmentSteps(primaryDiseaseId: string, complicationId: string | null): TreatmentStep[] {
  const primary = getDisease(primaryDiseaseId)
  if (!primary) return []

  if (!complicationId) {
    return primary.treatmentSteps
  }

  const complication = getDisease(complicationId)
  if (!complication) return primary.treatmentSteps

  return [...primary.treatmentSteps, ...complication.treatmentSteps.slice(0, 1)]
}

let caseCounter = 0

export function generatePetCase(): PetCase {
  caseCounter++
  const primaryDisease = diseases[Math.floor(Math.random() * diseases.length)]
  const breed = breeds[Math.floor(Math.random() * breeds.length)]
  const name = petNames[Math.floor(Math.random() * petNames.length)]
  const urgencyLevels: PetCase['urgency'][] = ['low', 'medium', 'high']
  const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)]

  const hasComplication = Math.random() < 0.4
  let complicationId: string | null = null
  if (hasComplication && primaryDisease.possibleComplications.length > 0) {
    complicationId = primaryDisease.possibleComplications[Math.floor(Math.random() * primaryDisease.possibleComplications.length)]
  }

  const primarySymptomIds = getSymptomsForDisease(primaryDisease.id)
  const complicationSymptomIds = complicationId ? getSymptomsForDisease(complicationId) : []

  const allRelevantSymptoms = [...new Set([...primarySymptomIds, ...complicationSymptomIds])]

  const decoySymptoms = symptoms
    .filter(s => !allRelevantSymptoms.includes(s.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 1)
    .map(s => s.id)

  const symptomIds = [...allRelevantSymptoms, ...decoySymptoms].sort(() => Math.random() - 0.5)
  const confidences = calculateConfidences(symptomIds)

  return {
    id: `case_${Date.now()}_${caseCounter}`,
    petName: name,
    breedId: breed.id,
    primaryDiseaseId: primaryDisease.id,
    complicationId,
    symptomIds,
    urgency,
    status: 'waiting',
    examined: false,
    confidences,
    playerStepOrder: [],
  }
}

export function generateInitialCases(count: number): PetCase[] {
  return Array.from({ length: count }, () => generatePetCase())
}

export function generateTestCases(): PetCase[] {
  caseCounter += 4
  return [
    {
      id: `test_hunger_${Date.now()}_${caseCounter - 3}`,
      petName: '饿饿',
      breedId: 'slime',
      primaryDiseaseId: 'hunger_storm',
      complicationId: 'float_fever',
      symptomIds: ['empty_stomach', 'trembling', 'rising_body', 'color_shift'],
      urgency: 'high',
      status: 'waiting',
      examined: false,
      confidences: calculateConfidences(['empty_stomach', 'trembling', 'rising_body', 'color_shift']),
      playerStepOrder: [],
    },
    {
      id: `test_shadow_${Date.now()}_${caseCounter - 1}`,
      petName: '锈锈',
      breedId: 'shadow',
      primaryDiseaseId: 'shadow_rust',
      complicationId: null,
      symptomIds: ['rust_patches', 'color_shift', 'glowing_eyes', 'trembling'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
      confidences: calculateConfidences(['rust_patches', 'color_shift', 'glowing_eyes', 'trembling']),
      playerStepOrder: [],
    },
    {
      id: `test_chomp_${Date.now()}_${caseCounter}`,
      petName: '咬咬',
      breedId: 'tentacle',
      primaryDiseaseId: 'chomp_bite',
      complicationId: 'split_pox',
      symptomIds: ['gnashing', 'glowing_eyes', 'spotted_skin', 'excess_slime'],
      urgency: 'high',
      status: 'waiting',
      examined: false,
      confidences: calculateConfidences(['gnashing', 'glowing_eyes', 'spotted_skin', 'excess_slime']),
      playerStepOrder: [],
    },
    {
      id: `test_crystal_${Date.now()}_${caseCounter + 1}`,
      petName: '晶晶',
      breedId: 'crystal',
      primaryDiseaseId: 'crystal_cough',
      complicationId: null,
      symptomIds: ['crystal_sputum', 'color_shift', 'trembling'],
      urgency: 'low',
      status: 'waiting',
      examined: false,
      confidences: calculateConfidences(['crystal_sputum', 'color_shift', 'trembling']),
      playerStepOrder: [],
    },
  ]
}

export function getSymptomWeightForDisease(symptomId: string, diseaseId: string): number {
  const disease = getDisease(diseaseId)
  if (!disease) return 0
  return disease.symptomWeights[symptomId] || 0
}

export function isDistractorSymptom(symptomId: string, primaryDiseaseId: string, complicationId: string | null): boolean {
  const primarySymptoms = getSymptomsForDisease(primaryDiseaseId)
  const complicationSymptoms = complicationId ? getSymptomsForDisease(complicationId) : []
  return !primarySymptoms.includes(symptomId) && !complicationSymptoms.includes(symptomId)
}
