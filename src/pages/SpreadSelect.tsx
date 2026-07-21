import { Link } from 'react-router-dom';
import { SPREADS } from '@/lib/data/spreads';

function SpreadDiagram({ id }: { id: (typeof SPREADS)[number]['id'] }) {
  if (id === 'three-card') {
    return (
      <div className="diagram linearDiagram" aria-hidden="true">
        <i /><i /><i />
      </div>
    );
  }
  if (id === 'hexagram') {
    return (
      <div className="diagram hexagramDiagram" aria-hidden="true">
        <i className="slotTop" />
        <i className="slotUpperRight" />
        <i className="slotLowerRight" />
        <i className="slotBottom" />
        <i className="slotUpperLeft" />
        <i className="slotLowerLeft" />
        <b className="slotCenter" />
      </div>
    );
  }
  return (
    <div className="diagram pathsDiagram" aria-hidden="true">
      <i className="pathLeftTop" />
      <i className="pathLeftBottom" />
      <b className="pathCenter" />
      <i className="pathRightTop" />
      <i className="pathRightBottom" />
    </div>
  );
}

export default function SpreadSelect() {
  return (
    <main className="flowShell">
      <header className="flowHeader">
        <Link className="brand" to="/" aria-label="返回塔罗指引首页">
          <span className="brandMark" aria-hidden="true">✦</span>
          <span>塔罗指引</span>
        </Link>
        <span className="stepIndicator">01 / 03 · 选择牌阵</span>
      </header>

      <section className="flowIntro">
        <p className="kicker"><span /> CHOOSE A SPREAD <span /></p>
        <h1>你想从几个角度，<br /><em>重新看见这个问题？</em></h1>
        <p>牌阵决定每张牌承担的角色。问题越复杂，越需要更多位置帮助你区分核心、助力与阻碍。</p>
      </section>

      <section className="selectionGrid" aria-label="可选牌阵">
        {SPREADS.map((spread, index) => (
          <article className="selectionCard" key={spread.id}>
            <div className="selectionTopline">
              <span>0{index + 1}</span>
              <small>{spread.cardCount} CARDS</small>
            </div>
            <SpreadDiagram id={spread.id} />
            <h2>{spread.shortName}</h2>
            <p>{spread.description}</p>
            <ul>
              {spread.positions.map((position) => (
                <li key={position.index}>{position.label}</li>
              ))}
            </ul>
            <Link className="selectSpreadButton" to={`/question/${spread.id}`}>
              选择此牌阵 <span>→</span>
            </Link>
          </article>
        ))}
      </section>

      <div className="flowFootnote">
        <span aria-hidden="true">◈</span>
        <p>不知道怎么选？"时间之箭"适合大多数第一次使用的情境。</p>
      </div>
    </main>
  );
}
