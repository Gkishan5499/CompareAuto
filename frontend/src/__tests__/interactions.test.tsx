import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// ============================================
// INTERACTIVE COMPONENT TEST FIXTURES
// ============================================

// 1. Form Component with Input and Button
interface FormState {
  email: string;
  password: string;
  errors: Record<string, string>;
}

interface FormProps {
  onSubmit: (data: FormState) => void;
  onReset?: () => void;
}

const LoginForm: React.FC<FormProps> = ({ onSubmit, onReset }) => {
  const [state, setState] = useState<FormState>({
    email: '',
    password: '',
    errors: {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newErrors = { ...state.errors };
    delete newErrors[name];
    setState(prev => ({
      ...prev,
      [name]: value,
      errors: newErrors
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!state.email) errors.email = 'Email is required';
    if (!state.password) errors.password = 'Password is required';
    if (state.email && !state.email.includes('@')) errors.email = 'Invalid email';

    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors }));
      return;
    }

    onSubmit({ ...state, errors: {} });
  };

  const handleReset = () => {
    setState({ email: '', password: '', errors: {} });
    onReset?.();
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="text"
          name="email"
          value={state.email}
          onChange={handleChange}
          data-testid="email-input"
        />
        {state.errors.email && (
          <span data-testid="email-error" className="error">{state.errors.email}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          data-testid="password-input"
        />
        {state.errors.password && (
          <span data-testid="password-error" className="error">{state.errors.password}</span>
        )}
      </div>

      <button type="submit" data-testid="submit-btn">
        Login
      </button>
      <button type="reset" onClick={handleReset} data-testid="reset-btn">
        Clear
      </button>
    </form>
  );
};

// 2. Todo List Component with Add/Remove/Toggle
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  onAdd?: (item: TodoItem) => void;
  onRemove?: (id: string) => void;
  onToggle?: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ onAdd, onRemove, onToggle }) => {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Learn React', completed: false },
    { id: '2', text: 'Learn Testing', completed: false },
  ]);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: input,
        completed: false,
      };
      setTodos(prev => [...prev, newTodo]);
      onAdd?.(newTodo);
      setInput('');
    }
  };

  const handleRemove = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    onRemove?.(id);
  };

  const handleToggle = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    onToggle?.(id);
  };

  return (
    <div data-testid="todo-list">
      <div className="todo-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAdd()}
          data-testid="todo-input"
          placeholder="Add a new todo..."
        />
        <button onClick={handleAdd} data-testid="add-todo-btn">
          Add
        </button>
      </div>

      <ul data-testid="todo-items">
        {todos.map(todo => (
          <li key={todo.id} data-testid={`todo-item-${todo.id}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
              data-testid={`todo-checkbox-${todo.id}`}
            />
            <span
              className={todo.completed ? 'completed' : ''}
              data-testid={`todo-text-${todo.id}`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleRemove(todo.id)}
              data-testid={`remove-todo-${todo.id}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <p data-testid="todo-count">{todos.length} items</p>
    </div>
  );
};

// 3. Counter Component with Increment/Decrement
interface CounterProps {
  initialValue?: number;
  onCountChange?: (count: number) => void;
  min?: number;
  max?: number;
}

const Counter: React.FC<CounterProps> = ({ initialValue = 0, onCountChange, min = 0, max = 10 }) => {
  const [count, setCount] = useState(initialValue);

  const handleIncrement = () => {
    if (count < max) {
      const newCount = count + 1;
      setCount(newCount);
      onCountChange?.(newCount);
    }
  };

  const handleDecrement = () => {
    if (count > min) {
      const newCount = count - 1;
      setCount(newCount);
      onCountChange?.(newCount);
    }
  };

  const handleReset = () => {
    setCount(initialValue);
    onCountChange?.(initialValue);
  };

  return (
    <div data-testid="counter">
      <div>
        <button onClick={handleDecrement} data-testid="decrement-btn" disabled={count <= min}>
          -
        </button>
        <span data-testid="counter-value">{count}</span>
        <button onClick={handleIncrement} data-testid="increment-btn" disabled={count >= max}>
          +
        </button>
      </div>
      <button onClick={handleReset} data-testid="reset-counter-btn">
        Reset
      </button>
    </div>
  );
};

// 4. Modal/Dialog Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div data-testid="modal-overlay">
      <div data-testid="modal-content">
        <h2 data-testid="modal-title">{title}</h2>
        <p data-testid="modal-message">{message}</p>
        <button onClick={onConfirm} data-testid="confirm-btn">
          Confirm
        </button>
        <button onClick={onClose} data-testid="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
};

const ModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleConfirm = vi.fn();

  return (
    <>
      <button onClick={() => setIsOpen(true)} data-testid="open-modal-btn">
        Open Modal
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Action"
        message="Are you sure?"
      />
    </>
  );
};

// ============================================
// USER INTERACTION TESTS
// ============================================

describe('User Interactions & State Changes', () => {

  // ========== LOGIN FORM TESTS ==========
  describe('LoginForm - Input & Validation', () => {
    it('should update input value when user types', async () => {
      const handleSubmit = vi.fn();
      render(<LoginForm onSubmit={handleSubmit} />);

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      await userEvent.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should show email validation error when email is empty', async () => {
      const handleSubmit = vi.fn();
      render(<LoginForm onSubmit={handleSubmit} />);

      const submitBtn = screen.getByTestId('submit-btn');
      await userEvent.click(submitBtn);

      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
    });

    it('should show invalid email error for malformed email', async () => {
      const handleSubmit = vi.fn();
      render(<LoginForm onSubmit={handleSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitBtn = screen.getByTestId('submit-btn');

      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
      });
      expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email');
    });

    it('should call onSubmit with form data when validation passes', async () => {
      const handleSubmit = vi.fn();
      render(<LoginForm onSubmit={handleSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitBtn = screen.getByTestId('submit-btn');

      await userEvent.type(emailInput, 'valid@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'valid@example.com',
        password: 'password123',
        errors: {},
      });
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should clear form and call onReset when reset button is clicked', async () => {
      const handleReset = vi.fn();
      render(<LoginForm onSubmit={vi.fn()} onReset={handleReset} />);

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
      const resetBtn = screen.getByTestId('reset-btn');

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');

      await userEvent.click(resetBtn);

      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it('should clear error when user types after validation error', async () => {
      const handleSubmit = vi.fn();
      render(<LoginForm onSubmit={handleSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const submitBtn = screen.getByTestId('submit-btn');

      // Trigger error
      await userEvent.click(submitBtn);
      expect(screen.getByTestId('email-error')).toBeInTheDocument();

      // Type to clear error
      await userEvent.type(emailInput, 'test@example.com');
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
  });

  // ========== TODO LIST TESTS ==========
  describe('TodoList - Add/Remove/Toggle', () => {
    it('should add a new todo when user types and clicks Add', async () => {
      const handleAdd = vi.fn();
      render(<TodoList onAdd={handleAdd} />);

      const input = screen.getByTestId('todo-input');
      const addBtn = screen.getByTestId('add-todo-btn');

      await userEvent.type(input, 'Buy groceries');
      await userEvent.click(addBtn);

      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      expect(handleAdd).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Buy groceries', completed: false })
      );
    });

    it('should add todo when pressing Enter key', async () => {
      const handleAdd = vi.fn();
      render(<TodoList onAdd={handleAdd} />);

      const input = screen.getByTestId('todo-input') as HTMLInputElement;

      await userEvent.type(input, 'New task{Enter}');

      await waitFor(() => {
        expect(input.value).toBe('');
      });
      expect(handleAdd).toHaveBeenCalled();
    });

    it('should not add empty todo', async () => {
      const handleAdd = vi.fn();
      render(<TodoList onAdd={handleAdd} />);

      const addBtn = screen.getByTestId('add-todo-btn');
      await userEvent.click(addBtn);

      expect(handleAdd).not.toHaveBeenCalled();
    });

    it('should toggle todo completion status', async () => {
      const handleToggle = vi.fn();
      render(<TodoList onToggle={handleToggle} />);

      const checkbox = screen.getByTestId('todo-checkbox-1') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      await userEvent.click(checkbox);

      expect(checkbox.checked).toBe(true);
      expect(handleToggle).toHaveBeenCalledWith('1');
    });

    it('should remove todo when delete button is clicked', async () => {
      const handleRemove = vi.fn();
      render(<TodoList onRemove={handleRemove} />);

      const todoItem = screen.getByTestId('todo-item-1');
      const deleteBtn = within(todoItem).getByTestId('remove-todo-1');

      await userEvent.click(deleteBtn);

      expect(screen.queryByTestId('todo-item-1')).not.toBeInTheDocument();
      expect(handleRemove).toHaveBeenCalledWith('1');
    });

    it('should update todo count when todos are added/removed', async () => {
      render(<TodoList />);

      const todoCount = screen.getByTestId('todo-count');
      expect(todoCount).toHaveTextContent('2 items');

      const input = screen.getByTestId('todo-input');
      const addBtn = screen.getByTestId('add-todo-btn');

      await userEvent.type(input, 'Third todo');
      await userEvent.click(addBtn);

      await waitFor(() => {
        expect(todoCount).toHaveTextContent('3 items');
      });
    });
  });

  // ========== COUNTER TESTS ==========
  describe('Counter - Increment/Decrement/Constraints', () => {
    it('should increment counter when increment button is clicked', async () => {
      const handleCountChange = vi.fn();
      render(<Counter initialValue={0} onCountChange={handleCountChange} />);

      const incrementBtn = screen.getByTestId('increment-btn');
      const counterValue = screen.getByTestId('counter-value');

      expect(counterValue).toHaveTextContent('0');

      await userEvent.click(incrementBtn);

      expect(counterValue).toHaveTextContent('1');
      expect(handleCountChange).toHaveBeenCalledWith(1);
    });

    it('should decrement counter when decrement button is clicked', async () => {
      const handleCountChange = vi.fn();
      render(<Counter initialValue={5} onCountChange={handleCountChange} />);

      const decrementBtn = screen.getByTestId('decrement-btn');
      const counterValue = screen.getByTestId('counter-value');

      await userEvent.click(decrementBtn);

      expect(counterValue).toHaveTextContent('4');
      expect(handleCountChange).toHaveBeenCalledWith(4);
    });

    it('should not increment beyond max value', async () => {
      const handleCountChange = vi.fn();
      render(<Counter initialValue={10} onCountChange={handleCountChange} max={10} />);

      const incrementBtn = screen.getByTestId('increment-btn');
      expect(incrementBtn).toBeDisabled();

      expect(handleCountChange).not.toHaveBeenCalled();
    });

    it('should not decrement below min value', async () => {
      const handleCountChange = vi.fn();
      render(<Counter initialValue={0} onCountChange={handleCountChange} min={0} />);

      const decrementBtn = screen.getByTestId('decrement-btn');
      expect(decrementBtn).toBeDisabled();

      expect(handleCountChange).not.toHaveBeenCalled();
    });

    it('should reset counter to initial value', async () => {
      const handleCountChange = vi.fn();
      render(<Counter initialValue={0} onCountChange={handleCountChange} />);

      const incrementBtn = screen.getByTestId('increment-btn');
      const resetBtn = screen.getByTestId('reset-counter-btn');
      const counterValue = screen.getByTestId('counter-value');

      await userEvent.click(incrementBtn);
      await userEvent.click(incrementBtn);
      expect(counterValue).toHaveTextContent('2');

      await userEvent.click(resetBtn);

      expect(counterValue).toHaveTextContent('0');
      expect(handleCountChange).toHaveBeenLastCalledWith(0);
    });

    it('should handle multiple rapid clicks', async () => {
      const handleCountChange = vi.fn();
      render(<Counter initialValue={0} onCountChange={handleCountChange} max={5} />);

      const incrementBtn = screen.getByTestId('increment-btn');

      await userEvent.click(incrementBtn);
      await userEvent.click(incrementBtn);
      await userEvent.click(incrementBtn);

      expect(screen.getByTestId('counter-value')).toHaveTextContent('3');
      expect(handleCountChange).toHaveBeenCalledTimes(3);
    });
  });

  // ========== MODAL TESTS ==========
  describe('Modal - Open/Close/Confirm', () => {
    it('should open modal when button is clicked', async () => {
      render(
        <BrowserRouter>
          <ModalWrapper />
        </BrowserRouter>
      );

      const openBtn = screen.getByTestId('open-modal-btn');
      await userEvent.click(openBtn);

      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Confirm Action');
      expect(screen.getByTestId('modal-message')).toHaveTextContent('Are you sure?');
    });

    it('should close modal when cancel button is clicked', async () => {
      render(
        <BrowserRouter>
          <ModalWrapper />
        </BrowserRouter>
      );

      const openBtn = screen.getByTestId('open-modal-btn');
      await userEvent.click(openBtn);

      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();

      const cancelBtn = screen.getByTestId('cancel-btn');
      await userEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
      });
    });

    it('should hide modal initially when isOpen is false', () => {
      render(
        <Modal
          isOpen={false}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Test"
          message="Test message"
        />
      );

      expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });
  });

  // ========== COMPLEX INTERACTION TESTS ==========
  describe('Complex User Interactions', () => {
    it('should handle rapid input changes in form', async () => {
      const handleSubmit = vi.fn();
      render(<LoginForm onSubmit={handleSubmit} />);

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;

      await userEvent.type(emailInput, 't');
      expect(emailInput.value).toBe('t');

      await userEvent.type(emailInput, 'e');
      expect(emailInput.value).toBe('te');

      await userEvent.type(emailInput, 'st@example.com');
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should maintain state across multiple interactions', async () => {
      render(<TodoList />);

      const input = screen.getByTestId('todo-input') as HTMLInputElement;
      const addBtn = screen.getByTestId('add-todo-btn');

      // Add first todo
      await userEvent.type(input, 'Task 1');
      await userEvent.click(addBtn);

      // Add second todo
      await userEvent.type(input, 'Task 2');
      await userEvent.click(addBtn);

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();

      // Toggle first todo
      await userEvent.click(screen.getByTestId('todo-checkbox-1'));

      const checkbox = screen.getByTestId('todo-checkbox-1') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should handle form submission after multiple failed attempts', async () => {
      const handleSubmit = vi.fn();
      render(<LoginForm onSubmit={handleSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitBtn = screen.getByTestId('submit-btn');

      // First attempt - missing password
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitBtn);
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(handleSubmit).not.toHaveBeenCalled();

      // Second attempt - add password
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
    });
  });
});
