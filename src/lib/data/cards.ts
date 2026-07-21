import type { MinorRank, OrientationMeaning, QuestionCategory, Suit, TarotCard } from "@/lib/types";
import { MINOR_NARRATIVES } from "@/lib/data/minorNarratives";

const domainKeys: ReadonlyArray<Exclude<QuestionCategory, "general">> = [
  "relationship",
  "career",
  "study",
  "finance",
  "family",
];

function domains(text: string): OrientationMeaning["domains"] {
  const contextLead: Record<(typeof domainKeys)[number], string> = {
    relationship: "放在关系互动与边界中看",
    career: "放在工作方向与协作中看",
    study: "放在学习节奏与能力成长中看",
    finance: "放在资源安排与现实风险中看",
    family: "放在人际角色与家庭沟通中看",
  };
  return Object.fromEntries(domainKeys.map((key) => [key, `${contextLead[key]}：${text}`]));
}

function meaning(
  keywords: string[],
  summary: string,
  advice: string,
  caution: string,
  domainText?: Partial<OrientationMeaning["domains"]>,
): OrientationMeaning {
  return {
    keywords,
    summary,
    advice,
    caution,
    domains: domainText ?? domains(summary),
  };
}

interface MajorDraft {
  name: string;
  nameEn: string;
  uprightKeywords: string[];
  uprightSummary: string;
  reversedKeywords: string[];
  reversedSummary: string;
}

const majorDrafts: readonly MajorDraft[] = [
  {
    name: "愚者",
    nameEn: "The Fool",
    uprightKeywords: ["开始", "冒险", "开放"],
    uprightSummary: "一个尚未完全确定的新阶段正在展开。",
    reversedKeywords: ["冲动", "失焦", "准备不足"],
    reversedSummary: "行动冲动与准备不足可能让方向变得模糊。",
  },
  {
    name: "魔术师",
    nameEn: "The Magician",
    uprightKeywords: ["主动", "能力", "资源"],
    uprightSummary: "已有的能力与资源可以被组织成实际行动。",
    reversedKeywords: ["操控", "分散", "能力未发挥"],
    reversedSummary: "资源可能被分散使用，或行动与真实意图并不一致。",
  },
  {
    name: "女祭司",
    nameEn: "The High Priestess",
    uprightKeywords: ["直觉", "静观", "隐秘"],
    uprightSummary: "眼前的信息尚未完全显现，安静观察比立即行动更重要。",
    reversedKeywords: ["封闭", "忽视直觉", "过度猜测"],
    reversedSummary: "你可能感到不对劲，却仍在回避或过度解释信号。",
  },
  {
    name: "皇后",
    nameEn: "The Empress",
    uprightKeywords: ["滋养", "丰饶", "创造"],
    uprightSummary: "持续投入与照料正在为事物提供成长空间。",
    reversedKeywords: ["匮乏", "依赖", "过度照料"],
    reversedSummary: "照顾与付出可能失去边界，反而压缩自身空间。",
  },
  {
    name: "皇帝",
    nameEn: "The Emperor",
    uprightKeywords: ["结构", "责任", "秩序"],
    uprightSummary: "清晰的边界与稳定结构有助于掌控局面。",
    reversedKeywords: ["僵化", "控制", "失序"],
    reversedSummary: "对秩序的追求可能变成僵化控制，或结构本身已失效。",
  },
  {
    name: "教皇",
    nameEn: "The Hierophant",
    uprightKeywords: ["传统", "学习", "共同规范"],
    uprightSummary: "既有经验、制度或可信指导能够提供参照。",
    reversedKeywords: ["教条", "盲从", "非传统"],
    reversedSummary: "既有规则可能不再适合当前处境，需要检验而非盲从。",
  },
  {
    name: "恋人",
    nameEn: "The Lovers",
    uprightKeywords: ["联结", "选择", "价值一致"],
    uprightSummary: "真正的选择需要让行动与核心价值保持一致。",
    reversedKeywords: ["失衡", "分离", "价值冲突"],
    reversedSummary: "关系或选择中的价值冲突尚未被正面处理。",
  },
  {
    name: "战车",
    nameEn: "The Chariot",
    uprightKeywords: ["推进", "意志", "方向"],
    uprightSummary: "明确方向并协调矛盾力量，可以推动事情前进。",
    reversedKeywords: ["失控", "冲突", "方向偏移"],
    reversedSummary: "推进速度可能超过了协调能力，方向也需要重新确认。",
  },
  {
    name: "力量",
    nameEn: "Strength",
    uprightKeywords: ["勇气", "耐心", "柔性力量"],
    uprightSummary: "稳定而温和的自我掌控比强行压制更有效。",
    reversedKeywords: ["自我怀疑", "失衡", "压抑"],
    reversedSummary: "内在消耗或自我怀疑正在削弱持续行动的能力。",
  },
  {
    name: "隐士",
    nameEn: "The Hermit",
    uprightKeywords: ["内省", "独处", "寻找方向"],
    uprightSummary: "暂时拉开距离，有助于形成独立而清晰的判断。",
    reversedKeywords: ["隔离", "逃避", "封闭"],
    reversedSummary: "独处可能已经从反思转变为回避连接与反馈。",
  },
  {
    name: "命运之轮",
    nameEn: "Wheel of Fortune",
    uprightKeywords: ["周期", "转折", "机遇"],
    uprightSummary: "外部条件正在变化，新的窗口可能随之出现。",
    reversedKeywords: ["反复", "失控", "抗拒变化"],
    reversedSummary: "旧循环可能再次出现，单靠等待难以改变方向。",
  },
  {
    name: "正义",
    nameEn: "Justice",
    uprightKeywords: ["事实", "公平", "责任"],
    uprightSummary: "回到事实、规则与责任分配，判断会更加清晰。",
    reversedKeywords: ["偏差", "逃责", "不公平"],
    reversedSummary: "信息、规则或责任分配中可能存在尚未纠正的偏差。",
  },
  {
    name: "倒吊人",
    nameEn: "The Hanged Man",
    uprightKeywords: ["暂停", "换位", "放下"],
    uprightSummary: "暂停推进并改变观察角度，可能看见新的解释。",
    reversedKeywords: ["停滞", "徒劳牺牲", "固执"],
    reversedSummary: "等待可能已经失去意义，牺牲也未必换来真正变化。",
  },
  {
    name: "死神",
    nameEn: "Death",
    uprightKeywords: ["结束", "转化", "释放"],
    uprightSummary: "某个阶段已接近完成，需要为新的秩序腾出空间。",
    reversedKeywords: ["抗拒改变", "拖延结束", "停滞"],
    reversedSummary: "失去作用的模式仍被维持，转变因此持续延迟。",
  },
  {
    name: "节制",
    nameEn: "Temperance",
    uprightKeywords: ["调和", "节奏", "整合"],
    uprightSummary: "通过调整比例与节奏，不同需求可以逐步取得平衡。",
    reversedKeywords: ["失衡", "过度", "节奏紊乱"],
    reversedSummary: "投入与恢复之间的比例已经失衡，需要重新校准。",
  },
  {
    name: "恶魔",
    nameEn: "The Devil",
    uprightKeywords: ["束缚", "欲望", "依赖模式"],
    uprightSummary: "某种诱惑、依赖或恐惧正在限制自由选择。",
    reversedKeywords: ["松绑", "觉察", "打破循环"],
    reversedSummary: "限制开始被看见，但离开旧循环仍需要实际行动。",
  },
  {
    name: "高塔",
    nameEn: "The Tower",
    uprightKeywords: ["突变", "揭示", "结构松动"],
    uprightSummary: "不稳定的结构正在暴露问题，需要重新建立基础。",
    reversedKeywords: ["回避冲击", "延迟改变", "勉强维持"],
    reversedSummary: "必要调整被持续推迟，表面稳定可能难以长久维持。",
  },
  {
    name: "星星",
    nameEn: "The Star",
    uprightKeywords: ["希望", "疗愈", "方向感"],
    uprightSummary: "经历消耗后，清晰而温和的希望正在恢复。",
    reversedKeywords: ["失望", "信心不足", "方向模糊"],
    reversedSummary: "期待与现实之间的落差正在削弱信心。",
  },
  {
    name: "月亮",
    nameEn: "The Moon",
    uprightKeywords: ["不确定", "潜意识", "投射"],
    uprightSummary: "信息仍然模糊，情绪与想象可能放大不确定性。",
    reversedKeywords: ["迷雾消退", "真相显现", "恐惧松动"],
    reversedSummary: "部分疑虑开始获得解释，但仍需用事实继续确认。",
  },
  {
    name: "太阳",
    nameEn: "The Sun",
    uprightKeywords: ["清晰", "活力", "成果"],
    uprightSummary: "信息与目标趋于清晰，积极成果更容易被看见。",
    reversedKeywords: ["延迟喜悦", "过度乐观", "活力不足"],
    reversedSummary: "积极因素仍然存在，但期待可能过高或进展有所延迟。",
  },
  {
    name: "审判",
    nameEn: "Judgement",
    uprightKeywords: ["觉醒", "复盘", "回应召唤"],
    uprightSummary: "过去经验正在汇聚成一次需要认真回应的决定。",
    reversedKeywords: ["自我否定", "逃避复盘", "迟疑"],
    reversedSummary: "对过去的评判或后悔正在妨碍作出新的回应。",
  },
  {
    name: "世界",
    nameEn: "The World",
    uprightKeywords: ["完成", "整合", "阶段成果"],
    uprightSummary: "一个阶段接近完整收束，经验可以被整合带往下一程。",
    reversedKeywords: ["未完成", "拖延收尾", "缺口"],
    reversedSummary: "事情接近完成，但仍有关键缺口需要收束。",
  },
] as const;

const reviewedMajorOverrides: Partial<Record<number, Pick<TarotCard, "upright" | "reversed">>> = {
  0: {
    upright: meaning(
      ["开始", "冒险", "开放", "可能性"],
      "一个尚未完全确定的新阶段正在展开。",
      "保持开放，同时确认自己能够承担的风险。",
      "不要把勇敢误解为无需准备。",
    ),
    reversed: meaning(
      ["冲动", "失焦", "准备不足", "回避责任"],
      "行动冲动与准备不足可能让方向变得模糊。",
      "先澄清底线与现实条件，再决定是否迈出下一步。",
      "反复追求新鲜感可能掩盖真正需要处理的问题。",
    ),
  },
  2: {
    upright: meaning(
      ["直觉", "静观", "隐秘", "内在智慧"],
      "眼前的信息尚未完全显现，安静观察比立即行动更重要。",
      "区分真实直觉与情绪投射，并给信息浮现留出时间。",
      "沉默可以保护判断，也可能妨碍必要沟通。",
    ),
    reversed: meaning(
      ["封闭", "忽视直觉", "信息遮蔽", "过度猜测"],
      "你可能已经感到不对劲，却仍在回避或过度解释信号。",
      "用可验证的信息校准直觉，不要只依赖猜测。",
      "把一切藏在心里会让不确定性继续扩大。",
    ),
  },
  6: {
    upright: meaning(
      ["联结", "选择", "价值一致", "承诺"],
      "重要关系或选择正在要求你确认，自己的行动是否与核心价值一致。",
      "先说明真正重视的原则，再讨论关系或选择的具体形式。",
      "吸引与认同不能替代边界、责任和现实条件。",
    ),
    reversed: meaning(
      ["价值冲突", "失衡", "沟通断层", "迟疑"],
      "关系或选择中的价值冲突尚未被正面处理，表面妥协可能难以持续。",
      "把不能妥协的原则与可以协商的条件分别说清。",
      "不要因为害怕失去联结而长期忽视明显的不一致。",
    ),
  },
  11: {
    upright: meaning(
      ["事实", "公平", "责任", "清晰判断"],
      "回到事实、规则与责任分配，能够减少情绪和立场造成的判断偏差。",
      "列出已知事实、未知信息和各方责任，再作出可解释的决定。",
      "形式上的平均不一定等于真正公平，需要考虑具体条件。",
    ),
    reversed: meaning(
      ["偏差", "逃避责任", "信息失衡", "不公平"],
      "信息、规则或责任分配中可能存在尚未纠正的偏差。",
      "检查哪些证据被忽略、哪些责任被转移，并补足判断依据。",
      "不要只寻找支持既有立场的证据，也不要把象征提示当作事实裁决。",
    ),
  },
  13: {
    upright: meaning(
      ["结束", "转化", "释放", "重生"],
      "某个阶段已接近完成，继续抓紧旧结构会阻碍更新。",
      "辨认真正已经结束的部分，为新的秩序腾出空间。",
      "转变可能令人不适，但不等同于现实灾难。",
    ),
    reversed: meaning(
      ["抗拒改变", "拖延结束", "停滞", "旧模式回返"],
      "已经失去作用的模式仍被维持，转变因而持续延迟。",
      "把不可逆的事实与仍可调整的部分分别列出。",
      "用熟悉感代替安全感，会延长消耗。",
    ),
  },
  14: {
    upright: meaning(
      ["调和", "节奏", "整合", "适度"],
      "不同需求可以通过调整比例、节奏和顺序逐步取得平衡。",
      "选择一个最需要校准的环节，小幅调整并观察实际反馈。",
      "平衡不是让所有部分完全相同，也不是无限延迟必要决定。",
    ),
    reversed: meaning(
      ["失衡", "过度", "节奏紊乱", "难以整合"],
      "投入与恢复、理想与现实或不同需求之间的比例已经失衡。",
      "先减少最明显的过度消耗，再重新安排节奏与优先级。",
      "短暂补偿不能替代对长期失衡结构的调整。",
    ),
  },
};

const majorCards: TarotCard[] = majorDrafts.map((draft, id) => {
  const override = reviewedMajorOverrides[id];
  return {
    id,
    name: draft.name,
    nameEn: draft.nameEn,
    type: "major",
    illustrationPath: `/cards/major/major-${String(id).padStart(2, "0")}.svg`,
    contentStatus: "reviewed",
    upright:
      override?.upright ??
      meaning(
        draft.uprightKeywords,
        draft.uprightSummary,
        `围绕“${draft.uprightKeywords[0]}”确定一个可以验证的下一步。`,
        "不要把象征性提示理解为必然结果。",
      ),
    reversed:
      override?.reversed ??
      meaning(
        draft.reversedKeywords,
        draft.reversedSummary,
        "先辨认阻滞来自现实条件、情绪还是旧习惯。",
        "逆位表示阻滞或内化，不等同于单纯的负面。",
      ),
  };
});

const suitData: Record<Suit, { name: string; nameEn: string; theme: string; caution: string }> = {
  cups: {
    name: "圣杯",
    nameEn: "Cups",
    theme: "情感、关系与内在感受",
    caution: "不要让情绪代替事实判断",
  },
  swords: {
    name: "宝剑",
    nameEn: "Swords",
    theme: "思想、沟通、冲突与判断",
    caution: "避免把一种解释当成唯一事实",
  },
  wands: {
    name: "权杖",
    nameEn: "Wands",
    theme: "行动、热情、创造与事业推进",
    caution: "行动速度不应超过承受能力",
  },
  pentacles: {
    name: "星币",
    nameEn: "Pentacles",
    theme: "资源、身体、金钱与长期建设",
    caution: "务实不等于只用物质衡量价值",
  },
};

const rankData: ReadonlyArray<{
  rank: MinorRank;
  name: string;
  nameEn: string;
  upright: string;
  reversed: string;
  uprightKeywords: string[];
  reversedKeywords: string[];
}> = [
  {
    rank: "ace",
    name: "王牌",
    nameEn: "Ace",
    upright: "新的潜力正在出现，需要被转化为实际开端",
    reversed: "机会可能尚未成熟，或最初动力未被有效使用",
    uprightKeywords: ["开端", "潜力", "机会"],
    reversedKeywords: ["延迟", "潜力受阻", "起点模糊"],
  },
  {
    rank: "two",
    name: "二",
    nameEn: "Two",
    upright: "两种力量需要协调，选择本身也是关系的一部分",
    reversed: "平衡被打破，迟疑或对立正在消耗注意力",
    uprightKeywords: ["平衡", "选择", "配合"],
    reversedKeywords: ["失衡", "迟疑", "对立"],
  },
  {
    rank: "three",
    name: "三",
    nameEn: "Three",
    upright: "联结与合作让初步成果得以扩大",
    reversed: "合作可能失衡，外部认可与真实需要并不一致",
    uprightKeywords: ["合作", "成长", "初步成果"],
    reversedKeywords: ["协作失衡", "疏离", "成果受阻"],
  },
  {
    rank: "four",
    name: "四",
    nameEn: "Four",
    upright: "稳定结构提供休整和巩固的空间",
    reversed: "稳定可能变成停滞，原有边界也可能过紧",
    uprightKeywords: ["稳定", "休整", "巩固"],
    reversedKeywords: ["停滞", "封闭", "结构僵化"],
  },
  {
    rank: "five",
    name: "五",
    nameEn: "Five",
    upright: "冲突或损失暴露了需要调整的部分",
    reversed: "冲突开始缓和，但遗留影响仍需处理",
    uprightKeywords: ["挑战", "冲突", "变化"],
    reversedKeywords: ["修复", "余波", "避免冲突"],
  },
  {
    rank: "six",
    name: "六",
    nameEn: "Six",
    upright: "局面进入恢复、交换或重新取得平衡的阶段",
    reversed: "恢复过程并不对等，旧问题可能以新形式返回",
    uprightKeywords: ["恢复", "和谐", "进展"],
    reversedKeywords: ["失衡交换", "延迟恢复", "旧题重现"],
  },
  {
    rank: "seven",
    name: "七",
    nameEn: "Seven",
    upright: "需要评估选择、坚持程度与真正优先级",
    reversed: "选择过多或评估失真，容易把精力耗在假设上",
    uprightKeywords: ["评估", "考验", "选择"],
    reversedKeywords: ["迷失", "评估偏差", "精力分散"],
  },
  {
    rank: "eight",
    name: "八",
    nameEn: "Eight",
    upright: "行动与限制同时出现，需要寻找可推进的具体路径",
    reversed: "原有束缚开始松动，但惯性仍会影响行动",
    uprightKeywords: ["进展", "结构", "限制"],
    reversedKeywords: ["松绑", "延迟", "重新调整"],
  },
  {
    rank: "nine",
    name: "九",
    nameEn: "Nine",
    upright: "事情接近成熟，个人承受力和边界成为重点",
    reversed: "接近完成时出现疲惫、怀疑或满足感下降",
    uprightKeywords: ["接近完成", "独立", "承受力"],
    reversedKeywords: ["疲惫", "怀疑", "满足受阻"],
  },
  {
    rank: "ten",
    name: "十",
    nameEn: "Ten",
    upright: "一个周期走向结果，也带来责任和下一阶段问题",
    reversed: "结果尚未真正整合，负担或未完事项继续累积",
    uprightKeywords: ["完成", "结果", "周期"],
    reversedKeywords: ["负担", "未完成", "循环延续"],
  },
  {
    rank: "page",
    name: "侍从",
    nameEn: "Page",
    upright: "以学习者姿态接触新的消息、技能或阶段",
    reversed: "好奇心缺少方向，消息也可能尚未得到验证",
    uprightKeywords: ["学习", "消息", "萌芽"],
    reversedKeywords: ["不成熟", "消息偏差", "缺乏方向"],
  },
  {
    rank: "knight",
    name: "骑士",
    nameEn: "Knight",
    upright: "能量正在向外推进，需要明确速度与目标",
    reversed: "行动走向极端，速度、冲动或固执可能主导局面",
    uprightKeywords: ["行动", "追求", "推进"],
    reversedKeywords: ["冲动", "极端", "方向偏移"],
  },
  {
    rank: "queen",
    name: "皇后",
    nameEn: "Queen",
    upright: "成熟的内在掌控让力量以稳定方式发挥",
    reversed: "内在需求被忽视，照料与控制之间失去平衡",
    uprightKeywords: ["成熟", "滋养", "内在掌控"],
    reversedKeywords: ["内耗", "过度照料", "情绪失衡"],
  },
  {
    rank: "king",
    name: "国王",
    nameEn: "King",
    upright: "经验与责任使资源能够被长期而稳定地管理",
    reversed: "权威可能转为控制，稳定也可能变成固守",
    uprightKeywords: ["责任", "掌控", "领导"],
    reversedKeywords: ["控制", "固守", "权力失衡"],
  },
] as const;

const suitsInIdOrder: readonly Suit[] = ["cups", "swords", "wands", "pentacles"];

function minorDraftCard(suit: Suit, rankIndex: number, suitIndex: number): TarotCard {
  const rank = rankData[rankIndex];
  const suitInfo = suitData[suit];
  const id = 22 + suitIndex * 14 + rankIndex;
  const narrative = MINOR_NARRATIVES[suit][rankIndex];
  if (narrative.rank !== rank.rank) throw new Error(`${suit} 牌义顺序与 rank 不一致。`);
  return {
    id,
    name: `${suitInfo.name}${rank.name}`,
    nameEn: `${rank.nameEn} of ${suitInfo.nameEn}`,
    type: "minor",
    suit,
    rank: rank.rank,
    illustrationPath: `/cards/minor/${suit}-${rank.rank}.svg`,
    contentStatus: "reviewed",
    upright: meaning(
      rank.uprightKeywords,
      narrative.upright,
      `结合现实处境，为“${rank.uprightKeywords[0]}”安排一个可以验证的小行动。`,
      suitInfo.caution,
    ),
    reversed: meaning(
      rank.reversedKeywords,
      narrative.reversed,
      "先确认阻滞来自信息、资源、关系还是自身节奏。",
      `逆位不等同于坏结果；${suitInfo.caution}。`,
    ),
  };
}

const minorCards = suitsInIdOrder.flatMap((suit, suitIndex) =>
  rankData.map((_, rankIndex) => minorDraftCard(suit, rankIndex, suitIndex)),
);

const reviewedMinorOverrides: Record<
  number,
  Partial<TarotCard> & Pick<TarotCard, "upright" | "reversed">
> = {
  24: {
    illustrationPath: "/cards/minor/cups-three.svg",
    contentStatus: "reviewed",
    upright: meaning(
      ["联结", "分享", "庆祝", "支持"],
      "真诚的支持网络正在放大积极成果。",
      "允许自己接受帮助，也主动确认彼此的贡献。",
      "愉快氛围不能替代对边界和责任的讨论。",
    ),
    reversed: meaning(
      ["疏离", "过度社交", "小圈子", "关系失衡"],
      "表面热闹可能掩盖归属感不足或关系分配失衡。",
      "减少无效应酬，把精力留给能够彼此支持的关系。",
      "避免在群体意见中失去自己的判断。",
    ),
  },
  43: {
    illustrationPath: "/cards/minor/swords-eight.svg",
    contentStatus: "reviewed",
    upright: meaning(
      ["限制", "困局", "自我设限", "视角狭窄"],
      "限制感真实存在，但其中一部分可能来自尚未检验的假设。",
      "先寻找一个可以验证的小出口，而非要求一次解决全部问题。",
      "持续重复“没有选择”会遮蔽仍可行动的部分。",
    ),
    reversed: meaning(
      ["松绑", "看见出口", "重新掌控", "恐惧残留"],
      "旧限制开始松动，但行动仍可能受到惯性恐惧影响。",
      "把新获得的选择转化为一个具体动作。",
      "看见出口不等于问题已经自动解决。",
    ),
  },
  77: {
    illustrationPath: "/cards/minor/pentacles-king.svg",
    contentStatus: "reviewed",
    upright: meaning(
      ["稳健", "资源", "责任", "长期建设"],
      "稳定来自持续管理资源，而不是短期运气。",
      "以可复用的制度和长期投入巩固成果。",
      "务实不应变成只以物质价值衡量一切。",
    ),
    reversed: meaning(
      ["控制", "固守", "物质焦虑", "资源失衡"],
      "对稳定的追求可能转化为过度控制或对损失的恐惧。",
      "检查自己是在管理资源，还是被资源焦虑所管理。",
      "拥有较多资源不自动意味着判断更可靠。",
    ),
  },
};

for (const [idText, override] of Object.entries(reviewedMinorOverrides)) {
  const index = Number(idText) - 22;
  minorCards[index] = { ...minorCards[index], ...override };
}

export const CARDS: readonly TarotCard[] = [...majorCards, ...minorCards];

export function getCardById(id: number): TarotCard | undefined {
  return CARDS.find((card) => card.id === id);
}

export const REVIEWED_CARD_IDS = CARDS.filter((card) => card.contentStatus === "reviewed").map(
  (card) => card.id,
);
