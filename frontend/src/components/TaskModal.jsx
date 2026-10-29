import { useEffect, useRef, useState } from 'react';

// task = null → "Create Task"; task = objeto → "Edit Task"
export default function TaskModal({ task, onClose, onSave }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError('O nome da tarefa é obrigatório.');
    setSaving(true);
    try {
      await onSave({ title: title.trim(), dueDate: dueDate || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{isEdit ? 'Edit Task' : 'Create Task'}</h2>

        <label className="field">
          <span>Título</span>
          <input
            ref={inputRef}
            type="text"
            maxLength={255}
            value={title}
            placeholder="Ex.: Planejar as férias"
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
          />
        </label>

        <label className="field">
          <span>Data limite (opcional)</span>
          <div className="date-row">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            {dueDate && (
              <button type="button" className="link-btn" onClick={() => setDueDate('')}>Remover</button>
            )}
          </div>
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar tarefa'}
          </button>
        </div>
      </form>
    </div>
  );
}
