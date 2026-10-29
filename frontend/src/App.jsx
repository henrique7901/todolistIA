import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { useDebounce } from './hooks/useDebounce.js';
import TaskItem from './components/TaskItem.jsx';
import TaskModal from './components/TaskModal.jsx';
import { ChevronIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon } from './components/Icons.jsx';

const FILTERS = [
  { value: 'all', label: 'ALL' },
  { value: 'pending', label: 'PENDING' },
  { value: 'completed', label: 'COMPLETED' },
];

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [data, setData] = useState({ tasks: [], total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | { task: null | Task }
  const [reloadKey, setReloadKey] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Busca no backend; o AbortController descarta respostas antigas (evita race condition).
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api
      .list({ search: debouncedSearch.trim(), status }, controller.signal)
      .then((res) => { setData(res); setError(''); })
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Não foi possível carregar as tarefas. O backend está rodando?');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [debouncedSearch, status, reloadKey]);

  async function handleSave(payload) {
    if (modal.task) await api.update(modal.task.id, payload);
    else await api.create(payload);
    setModal(null);
    reload();
  }

  async function handleToggle(task) {
    const next = !task.completed;
    // atualização otimista
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, completed: next ? 1 : 0 } : t)),
      completed: d.completed + (next ? 1 : -1),
    }));
    try {
      await api.update(task.id, { completed: next });
    } catch {
      setError('Não foi possível atualizar a tarefa.');
    }
    reload();
  }

  async function handleDelete(task) {
    if (!window.confirm(`Excluir a tarefa "${task.title}"?`)) return;
    try {
      await api.remove(task.id);
    } catch (err) {
      setError(err.message);
    }
    reload();
  }

  const isFiltering = debouncedSearch.trim() !== '' || status !== 'all';
  const emptyText = isFiltering ? 'No tasks found.' : 'You have no pending tasks.';

  return (
    <main className="stage">
      <section className="card">
        <header className="card__header">
          <h1>TODO LIST</h1>

          <div className="toolbar">
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar tarefas"
              />
            </label>

            <div className="select">
              <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status">
                {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <ChevronIcon />
            </div>

            <button
              type="button"
              className="square-btn"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>

          <p className="counters" aria-live="polite">
            <span>Total: <strong>{data.total}</strong></span>
            <span>Concluídas: <strong>{data.completed}</strong></span>
          </p>
        </header>

        {error && <p className="error banner" role="alert">{error}</p>}

        <div className="card__list">
          {!loading && data.tasks.length === 0 && !error ? (
            <div className="empty">
              <EmptyArt />
              <p>{emptyText}</p>
            </div>
          ) : (
            <ul className={`list ${loading ? 'is-loading' : ''}`}>
              {data.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={(t) => setModal({ task: t })}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </div>

        <button type="button" className="fab" aria-label="Create Task" onClick={() => setModal({ task: null })}>
          <PlusIcon />
        </button>
      </section>

      {modal && <TaskModal task={modal.task} onClose={() => setModal(null)} onSave={handleSave} />}
    </main>
  );
}

function EmptyArt() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="18" y="14" width="60" height="68" rx="8" stroke="currentColor" strokeWidth="3" />
      <path d="M32 36h32M32 50h32M32 64h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
