import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock Dashboard Component
interface DashboardProps {
  admins: AdminItem[];
  isLoading: boolean;
  onAddAdmin: (admin: AdminItem) => void;
  onDeleteAdmin: (id: string) => void;
  onEditAdmin: (id: string, admin: Partial<AdminItem>) => void;
}

interface AdminItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

// Mock Component
function Dashboard({ admins, isLoading, onAddAdmin, onDeleteAdmin, onEditAdmin }: DashboardProps) {
  if (isLoading) {
    return <div data-testid="loading-spinner">Loading...</div>;
  }

  return (
    <div data-testid="dashboard">
      <h1>Admin Dashboard</h1>
      <div data-testid="admin-count">{admins.length} admins</div>

      <table data-testid="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} data-testid={`admin-row-${admin.id}`}>
              <td>{admin.name}</td>
              <td>{admin.email}</td>
              <td>{admin.role}</td>
              <td>
                <button
                  data-testid={`edit-${admin.id}`}
                  onClick={() => onEditAdmin(admin.id, { name: 'Updated' })}
                >
                  Edit
                </button>
                <button
                  data-testid={`delete-${admin.id}`}
                  onClick={() => onDeleteAdmin(admin.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {admins.length === 0 && (
        <div data-testid="empty-state">No admins found</div>
      )}
    </div>
  );
}

// Mock Admin Card Component
interface AdminCardProps {
  admin: AdminItem;
  onEdit: () => void;
  onDelete: () => void;
}

function AdminCard({ admin, onEdit, onDelete }: AdminCardProps) {
  return (
    <div data-testid={`admin-card-${admin.id}`} className="admin-card">
      <h2>{admin.name}</h2>
      <p>{admin.email}</p>
      <p>{admin.role}</p>
      <button data-testid={`card-edit-${admin.id}`} onClick={onEdit}>
        Edit
      </button>
      <button data-testid={`card-delete-${admin.id}`} onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

// Mock Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  icon?: string;
}

function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div data-testid={`stats-card-${title}`} className="stats-card">
      {icon && <span data-testid={`stats-icon-${title}`}>{icon}</span>}
      <h3>{title}</h3>
      <p data-testid={`stats-value-${title}`}>{value}</p>
    </div>
  );
}

// Tests
describe('Admin Dashboard Components', () => {
  let mockAdmins: AdminItem[];
  let mockOnAddAdmin: any;
  let mockOnDeleteAdmin: any;
  let mockOnEditAdmin: any;

  beforeEach(() => {
    mockAdmins = [
      {
        id: 'admin_1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'super_admin',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'admin_2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        createdAt: '2024-01-02T00:00:00Z',
      },
    ];

    mockOnAddAdmin = vi.fn();
    mockOnDeleteAdmin = vi.fn();
    mockOnEditAdmin = vi.fn();
  });

  // Dashboard Rendering Tests
  describe('Dashboard Rendering', () => {
    it('should render dashboard with title', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('should display admin count', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('admin-count')).toHaveTextContent('2 admins');
    });

    it('should render admin table', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('admin-table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display loading spinner when isLoading is true', () => {
      render(
        <Dashboard
          admins={[]}
          isLoading={true}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show empty state when no admins', () => {
      render(
        <Dashboard
          admins={[]}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No admins found')).toBeInTheDocument();
    });
  });

  // Admin Table Tests
  describe('Admin Table Interactions', () => {
    it('should render all admin rows', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('admin-row-admin_1')).toBeInTheDocument();
      expect(screen.getByTestId('admin-row-admin_2')).toBeInTheDocument();
    });

    it('should display correct admin data in table', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('super_admin')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('should call onEditAdmin when edit button is clicked', async () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      const editButton = screen.getByTestId('edit-admin_1');
      fireEvent.click(editButton);

      expect(mockOnEditAdmin).toHaveBeenCalledWith('admin_1', { name: 'Updated' });
    });

    it('should call onDeleteAdmin when delete button is clicked', async () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      const deleteButton = screen.getByTestId('delete-admin_2');
      fireEvent.click(deleteButton);

      expect(mockOnDeleteAdmin).toHaveBeenCalledWith('admin_2');
    });

    it('should render edit and delete buttons for each admin', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('edit-admin_1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-admin_1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-admin_2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-admin_2')).toBeInTheDocument();
    });
  });

  // Admin Card Component Tests
  describe('Admin Card Component', () => {
    it('should render admin card with admin data', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCard
          admin={mockAdmins[0]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('super_admin')).toBeInTheDocument();
      expect(screen.getByTestId('admin-card-admin_1')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked on card', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCard
          admin={mockAdmins[0]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByTestId('card-edit-admin_1');
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalled();
    });

    it('should call onDelete when delete button is clicked on card', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <AdminCard
          admin={mockAdmins[0]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTestId('card-delete-admin_1');
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalled();
    });

    it('should render multiple admin cards', () => {
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();

      const { container } = render(
        <>
          {mockAdmins.map((admin) => (
            <AdminCard
              key={admin.id}
              admin={admin}
              onEdit={mockOnEdit}
              onDelete={mockOnDelete}
            />
          ))}
        </>
      );

      expect(screen.getByTestId('admin-card-admin_1')).toBeInTheDocument();
      expect(screen.getByTestId('admin-card-admin_2')).toBeInTheDocument();
    });
  });

  // Stats Card Component Tests
  describe('Stats Card Component', () => {
    it('should render stats card with title and value', () => {
      render(<StatsCard title="Total Admins" value={10} />);

      expect(screen.getByTestId('stats-card-Total Admins')).toBeInTheDocument();
      expect(screen.getByText('Total Admins')).toBeInTheDocument();
      expect(screen.getByTestId('stats-value-Total Admins')).toHaveTextContent('10');
    });

    it('should render stats card with icon', () => {
      render(<StatsCard title="Active Users" value={5} icon="👥" />);

      expect(screen.getByTestId('stats-icon-Active Users')).toHaveTextContent('👥');
    });

    it('should display correct value in stats card', () => {
      render(<StatsCard title="Total Admins" value={15} />);

      expect(screen.getByTestId('stats-value-Total Admins')).toHaveTextContent('15');
    });

    it('should render multiple stats cards', () => {
      const { container } = render(
        <>
          <StatsCard title="Total Admins" value={10} />
          <StatsCard title="Active Admins" value={8} />
          <StatsCard title="Inactive Admins" value={2} />
        </>
      );

      expect(screen.getByTestId('stats-card-Total Admins')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-Active Admins')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-Inactive Admins')).toBeInTheDocument();
    });

    it('should handle zero values in stats card', () => {
      render(<StatsCard title="Pending Requests" value={0} />);

      expect(screen.getByTestId('stats-value-Pending Requests')).toHaveTextContent('0');
    });
  });

  // Props Handling Tests
  describe('Props Handling', () => {
    it('should update when admins prop changes', () => {
      const { rerender } = render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('admin-count')).toHaveTextContent('2 admins');

      const newAdmins = [
        ...mockAdmins,
        {
          id: 'admin_3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'editor',
          createdAt: '2024-01-03T00:00:00Z',
        },
      ];

      rerender(
        <Dashboard
          admins={newAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('admin-count')).toHaveTextContent('3 admins');
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should toggle loading state', () => {
      const { rerender } = render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();

      rerender(
        <Dashboard
          admins={mockAdmins}
          isLoading={true}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  // Event Handling Tests
  describe('Event Handling', () => {
    it('should handle multiple edit actions', async () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      fireEvent.click(screen.getByTestId('edit-admin_1'));
      fireEvent.click(screen.getByTestId('edit-admin_2'));

      expect(mockOnEditAdmin).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple delete actions', async () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      fireEvent.click(screen.getByTestId('delete-admin_1'));
      fireEvent.click(screen.getByTestId('delete-admin_2'));

      expect(mockOnDeleteAdmin).toHaveBeenCalledTimes(2);
      expect(mockOnDeleteAdmin).toHaveBeenNthCalledWith(1, 'admin_1');
      expect(mockOnDeleteAdmin).toHaveBeenNthCalledWith(2, 'admin_2');
    });

    it('should pass correct parameters to callbacks', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      fireEvent.click(screen.getByTestId('delete-admin_1'));

      expect(mockOnDeleteAdmin).toHaveBeenCalledWith('admin_1');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      const table = container.querySelector('table');
      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');

      expect(table).toBeInTheDocument();
      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
    });

    it('should have proper table headers', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      render(
        <Dashboard
          admins={mockAdmins}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');

      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle single admin', () => {
      render(
        <Dashboard
          admins={[mockAdmins[0]]}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByTestId('admin-count')).toHaveTextContent('1 admins');
    });

    it('should handle special characters in admin data', () => {
      const adminWithSpecialChars = {
        id: 'admin_special',
        name: "O'Brien & Associates",
        email: 'test+admin@example.com',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
      };

      render(
        <Dashboard
          admins={[adminWithSpecialChars]}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(screen.getByText("O'Brien & Associates")).toBeInTheDocument();
      expect(screen.getByText('test+admin@example.com')).toBeInTheDocument();
    });

    it('should handle long admin names', () => {
      const adminWithLongName = {
        id: 'admin_long',
        name: 'This is a very long admin name that might wrap in the UI',
        email: 'long@example.com',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
      };

      render(
        <Dashboard
          admins={[adminWithLongName]}
          isLoading={false}
          onAddAdmin={mockOnAddAdmin}
          onDeleteAdmin={mockOnDeleteAdmin}
          onEditAdmin={mockOnEditAdmin}
        />
      );

      expect(
        screen.getByText('This is a very long admin name that might wrap in the UI')
      ).toBeInTheDocument();
    });
  });
});
