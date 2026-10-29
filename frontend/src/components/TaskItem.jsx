import { CheckIcon, PencilIcon, TrashIcon } from './Icons.jsx';
import { formatDate, isOverdue } from '../dates.js';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);
  const done = !!task.completed;

  return (
    <li className="task">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? 'Marcar como pendente' : 'Marcar como concluída'}
        className={`check ${done ? 'check--on' : ''}`}
        onClick={() => onToggle(task)}
      >
        {done && <CheckIcon />}
      </button>

      <div className="task__body">
        <span className={`task__title ${done ? 'is-done' : ''} ${overdue ? 'is-overdue' : ''}`}>
          {task.title}
        </span>
        {(task.due_date || overdue) && (
          <span className="task__meta">
            {task.due_date && <span className={overdue ? 'is-overdue' : ''}>{formatDate(task.due_date)}</span>}
            {overdue && <span className="badge">Em atraso</span>}
          </span>
        )}
      </div>

      <div className="task__actions">
        <button type="button" className="icon-btn" aria-label={`Editar ${task.title}`} onClick={() => onEdit(task)}>
          <PencilIcon />
        </button>
        <button type="button" className="icon-btn icon-btn--danger" aria-label={`Excluir ${task.title}`} onClick={() => onDelete(task)}>
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}
