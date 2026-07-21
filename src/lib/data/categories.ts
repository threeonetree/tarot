import type { QuestionCategory } from "@/lib/types";

export const QUESTION_CATEGORIES: ReadonlyArray<{
  id: QuestionCategory;
  name: string;
  description: string;
}> = [
  { id: "relationship", name: "感情关系", description: "亲密关系、相处模式与情感边界" },
  { id: "career", name: "事业工作", description: "职业方向、工作机会与协作关系" },
  { id: "study", name: "学业成长", description: "学习选择、能力发展与长期积累" },
  { id: "finance", name: "财务现实", description: "资源安排、风险边界与现实条件" },
  { id: "family", name: "人际家庭", description: "家庭角色、朋友关系与沟通边界" },
  { id: "general", name: "一般问题", description: "尚未归类或希望整体梳理的问题" },
];
