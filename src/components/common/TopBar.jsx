import { ArrowLeft } from 'lucide-react';

export default function TopBar({ onBack, children, backLabel = 'HOME' }) {
  return (
    <div className="lessonTopbar">
      <button className="btnGhost" onClick={onBack} type="button">
        <ArrowLeft size={18} />
        {backLabel}
      </button>

      <div className="lessonMeta">{children}</div>
    </div>
  );
}
