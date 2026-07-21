import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { QuestionForm } from '@/components/QuestionForm';
import { getSpreadById } from '@/lib/data/spreads';

export default function QuestionInput() {
  const { spreadId } = useParams<{ spreadId: string }>();
  const navigate = useNavigate();
  const spread = spreadId ? getSpreadById(spreadId) : undefined;

  if (!spread) {
    return <Navigate to="/select" replace />;
  }

  return (
    <main className="flowShell compactFlow">
      <header className="flowHeader">
        <Link className="brand" to="/" aria-label="返回塔罗指引首页">
          <span className="brandMark" aria-hidden="true">✦</span>
          <span>塔罗指引</span>
        </Link>
        <span className="stepIndicator">02 / 03 · 提出问题</span>
      </header>

      <section className="questionPanel">
        <div className="chosenSpread">
          <span>已选择</span>
          <strong>{spread.shortName}</strong>
          <Link to="/select">修改</Link>
        </div>
        <p className="kicker"><span /> FRAME THE QUESTION <span /></p>
        <h1>先告诉牌面，<br /><em>你在关注什么。</em></h1>
        <p className="questionLead">问题领域决定解读采用的语境；具体问题只保存在当前浏览器中。</p>

        <QuestionForm spread={spread} onNavigate={(path) => navigate(path)} />
      </section>
    </main>
  );
}
