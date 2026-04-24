export default function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && '\u2713'}{t.type === 'error' && '\u2717'}{t.type === 'info' && '\u2139'} {t.message}
        </div>
      ))}
    </div>
  );
}
