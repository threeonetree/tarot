import { Link } from 'react-router-dom';
import { ReadingExperience } from '@/components/ReadingExperience';

export default function ReadingPage() {
  return (
    <main className="flowShell readingShell">
      <header className="flowHeader">
        <Link className="brand" to="/" aria-label="返回塔罗指引首页">
          <span className="brandMark" aria-hidden="true">✦</span>
          <span>塔罗指引</span>
        </Link>
        <span className="stepIndicator">03 / 03 · 翻开牌面</span>
      </header>
      <ReadingExperience />
    </main>
  );
}
