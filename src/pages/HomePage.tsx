import { Link } from 'react-router-dom';

const sampleCards = [
  { name: '愚者', nameEn: 'THE FOOL', number: '0', image: '/cards/major/major-00.svg', keyword: '开始 · 冒险 · 可能性' },
  { name: '女祭司', nameEn: 'THE HIGH PRIESTESS', number: 'II', image: '/cards/major/major-02.svg', keyword: '直觉 · 静观 · 隐秘' },
  { name: '死神', nameEn: 'DEATH', number: 'XIII', image: '/cards/major/major-13.svg', keyword: '结束 · 转化 · 重生' },
  { name: '恋人', nameEn: 'THE LOVERS', number: 'VI', image: '/cards/major/major-06.svg', keyword: '联结 · 选择 · 价值一致' },
  { name: '正义', nameEn: 'JUSTICE', number: 'XI', image: '/cards/major/major-11.svg', keyword: '事实 · 公平 · 责任' },
  { name: '节制', nameEn: 'TEMPERANCE', number: 'XIV', image: '/cards/major/major-14.svg', keyword: '调和 · 节奏 · 整合' },
  { name: '圣杯三', nameEn: 'THREE OF CUPS', number: 'III', image: '/cards/minor/cups-three.svg', keyword: '联结 · 分享 · 庆祝' },
  { name: '宝剑八', nameEn: 'EIGHT OF SWORDS', number: 'VIII', image: '/cards/minor/swords-eight.svg', keyword: '限制 · 视角 · 松绑' },
  { name: '星币国王', nameEn: 'KING OF PENTACLES', number: 'K', image: '/cards/minor/pentacles-king.svg', keyword: '稳健 · 资源 · 掌控' },
];

const spreads = [
  { eyebrow: '三张牌', title: '时间之箭', copy: '从根源、当下与趋势，梳理问题正在如何发展。', layout: 'past · present · future' },
  { eyebrow: '七张牌', title: '星芒指引', copy: '在保留六芒星位置关系的同时，看见目标、助力与阻碍。', layout: 'core · goal · forces' },
  { eyebrow: '五张牌', title: '抉择之路', copy: '分别理解两条路径的优势与代价，不替你做出决定。', layout: 'path a · now · path b' },
];

export default function HomePage() {
  return (
    <main>
      <div className="ambient ambientOne" aria-hidden="true" />
      <div className="ambient ambientTwo" aria-hidden="true" />

      <header className="siteHeader">
        <a className="brand" href="#top" aria-label="塔罗指引首页">
          <span className="brandMark" aria-hidden="true">✦</span>
          <span>塔罗指引</span>
        </a>
        <nav aria-label="页面导航">
          <a href="#spreads">牌阵</a>
          <a href="#deck">牌组</a>
          <a href="#principles">原则</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="kicker"><span /> A QUIET MIRROR <span /></p>
          <h1>不是预言，<br /><em>是换一个角度看见。</em></h1>
          <p className="heroLead">选择一个牌阵，带着你的问题翻开卡牌。我们依据牌面、位置与彼此关系，为你整理一份克制而清晰的指引。</p>
          <div className="heroActions">
            <Link className="primaryButton" to="/select">开始一次占卜 <span>→</span></Link>
            <a className="textButton" href="#deck">查看牌面设计</a>
          </div>
          <p className="privacyNote"><span aria-hidden="true">◈</span> 无需注册 · 问题只留在你的设备上</p>
        </div>

        <div className="heroOracle" aria-label="几何黑金塔罗牌背预览">
          <div className="orbit orbitOuter" aria-hidden="true" />
          <div className="orbit orbitInner" aria-hidden="true" />
          <div className="cardBack">
            <span className="corner cornerTop">⌜</span>
            <div className="backSigil" aria-hidden="true">
              <span className="sunCore" />
              <span className="ray rayOne" />
              <span className="ray rayTwo" />
              <span className="crescent">◐</span>
            </div>
            <span className="corner cornerBottom">⌟</span>
          </div>
          <span className="floatStar starOne" aria-hidden="true">✦</span>
          <span className="floatStar starTwo" aria-hidden="true">✧</span>
          <span className="floatStar starThree" aria-hidden="true">·</span>
        </div>
      </section>

      <section className="section spreadsSection" id="spreads">
        <div className="sectionHeading">
          <p>CHOOSE A SPREAD</p>
          <h2>从你真正想看清的事开始</h2>
          <span className="goldRule" />
        </div>
        <div className="spreadGrid">
          {spreads.map((spread, index) => (
            <article className="spreadCard" key={spread.title}>
              <div className={`spreadGlyph glyph${index + 1}`} aria-hidden="true">
                {index === 0 && <><i /><i /><i /></>}
                {index === 1 && <><b /><i /><i /><i /><i /><i /><i /></>}
                {index === 2 && <><i /><i /><b /><i /><i /></>}
              </div>
              <p>{spread.eyebrow}</p>
              <h3>{spread.title}</h3>
              <span>{spread.copy}</span>
              <small>{spread.layout}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section deckSection" id="deck">
        <div className="sectionHeading alignLeft">
          <p>THE DECK</p>
          <h2>几何黑金牌组</h2>
          <span className="goldRule" />
          <div className="headingRow">
            <span>简洁的几何象征、统一的黑金语言，并为正位与逆位保留清晰可读的细节。</span>
            <span className="phaseBadge">几何黑金 · 正逆位</span>
          </div>
        </div>

        <div className="deckGrid">
          {sampleCards.map((card) => (
            <figure className="tarotSample" key={card.name}>
              <div className="sampleFrame">
                <img src={card.image} alt={`${card.name}几何黑金插画`} loading="lazy" />
                <span className="sampleNumber">{card.number}</span>
              </div>
              <figcaption>
                <strong>{card.name}</strong>
                <small>{card.nameEn}</small>
                <span>{card.keyword}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section principles" id="principles">
        <div className="principleIntro">
          <p>HOW IT READS</p>
          <h2>牌面不替你决定，<br />只帮助你整理线索。</h2>
        </div>
        <div className="principleList">
          <article>
            <span>01</span>
            <div>
              <h3>位置化解读</h3>
              <p>同一张牌落在"助力"或"阻碍"位置，会从不同角度展开。</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>看见牌间关系</h3>
              <p>结合花色、正逆位与关键位置的呼应，而不是逐张复述。</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>保留你的判断</h3>
              <p>所有结果都以可能性和行动建议表达，不作确定性预测。</p>
            </div>
          </article>
        </div>
      </section>

      <footer>
        <div className="footerSigil" aria-hidden="true">☾ ✦ ☽</div>
        <p>塔罗解读仅用于娱乐与自我反思，不构成医疗、法律、财务或其他专业建议。</p>
        <small>© 2026 TAROT GUIDE</small>
      </footer>
    </main>
  );
}
