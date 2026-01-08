import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

function Button({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Mock Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return <div className={`card ${className || ''}`} data-testid="card">{children}</div>;
}

// Mock NavLink Component
interface NavLinkProps {
  to: string;
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
}

function MockNavLink({ 
  to, 
  className, 
  children,
  ...props 
}: NavLinkProps) {
  return (
    <a href={to} className={className} data-testid={`navlink-${to}`} {...props}>
      {children}
    </a>
  );
}

// Render with Router wrapper
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// ============ TESTS ============

describe('Frontend Component Tests', () => {
  
  // Button Component Tests
  describe('Button Component Rendering', () => {
    it('should render button with text content', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render button element', () => {
      render(<Button>Submit</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have default variant class', () => {
      render(<Button>Submit</Button>);
      const button = screen.getByText('Submit');
      expect(button).toHaveClass('btn-default');
    });

    it('should have default size class', () => {
      render(<Button>Button</Button>);
      const button = screen.getByText('Button');
      expect(button).toHaveClass('btn-md');
    });
  });

  describe('Button Component Props Handling', () => {
    it('should apply custom variant class', () => {
      render(<Button variant="outline">Outline Button</Button>);
      const button = screen.getByText('Outline Button');
      expect(button).toHaveClass('btn-outline');
    });

    it('should apply size prop class', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByText('Large Button');
      expect(button).toHaveClass('btn-lg');
    });

    it('should apply custom className', () => {
      render(<Button className="custom-btn">Custom</Button>);
      const button = screen.getByText('Custom');
      expect(button).toHaveClass('custom-btn');
    });

    it('should handle disabled prop', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
    });

    it('should apply all classes together', () => {
      render(
        <Button variant="ghost" size="sm" className="extra">
          Multi Class
        </Button>
      );
      const button = screen.getByText('Multi Class');
      expect(button).toHaveClass('btn-ghost');
      expect(button).toHaveClass('btn-sm');
      expect(button).toHaveClass('extra');
    });
  });

  describe('Button Component Text Content', () => {
    it('should render text content correctly', () => {
      render(<Button>Submit Form</Button>);
      expect(screen.getByText('Submit Form')).toBeInTheDocument();
    });

    it('should render special characters in text', () => {
      render(<Button>Button & More!</Button>);
      expect(screen.getByText('Button & More!')).toBeInTheDocument();
    });

    it('should render multiple buttons with different text', () => {
      render(
        <div>
          <Button>Save</Button>
          <Button>Cancel</Button>
          <Button>Delete</Button>
        </div>
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Button Component Interactions', () => {
    it('should trigger onClick handler', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      
      fireEvent.click(screen.getByText('Click'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Click</Button>);
      
      const button = screen.getByText('Click');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // Card Component Tests
  describe('Card Component Rendering', () => {
    it('should render card element', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(<Card>Test content</Card>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should have card class', () => {
      render(<Card>Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('card');
    });
  });

  describe('Card Component Props Handling', () => {
    it('should apply custom className', () => {
      render(<Card className="custom-card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card');
      expect(card).toHaveClass('card');
    });

    it('should render nested elements', () => {
      render(
        <Card>
          <h2>Title</h2>
          <p>Description</p>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Card Component Text Content', () => {
    it('should render text content correctly', () => {
      render(<Card>This is card content</Card>);
      expect(screen.getByText('This is card content')).toBeInTheDocument();
    });

    it('should render multiple cards with different content', () => {
      render(
        <div>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
          <Card>Card 3</Card>
        </div>
      );
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
    });
  });

  // NavLink Component Tests
  describe('NavLink Component Rendering', () => {
    it('should render NavLink element', () => {
      renderWithRouter(
        <MockNavLink to="/dashboard">Dashboard</MockNavLink>
      );
      expect(screen.getByTestId('navlink-/dashboard')).toBeInTheDocument();
    });

    it('should have correct href attribute', () => {
      renderWithRouter(
        <MockNavLink to="/about">About</MockNavLink>
      );
      const link = screen.getByTestId('navlink-/about');
      expect(link).toHaveAttribute('href', '/about');
    });

    it('should render link text', () => {
      renderWithRouter(
        <MockNavLink to="/home">Home</MockNavLink>
      );
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  describe('NavLink Component Props Handling', () => {
    it('should apply custom className', () => {
      renderWithRouter(
        <MockNavLink to="/home" className="custom-class">
          Home
        </MockNavLink>
      );
      const link = screen.getByTestId('navlink-/home');
      expect(link).toHaveClass('custom-class');
    });

    it('should handle different routes', () => {
      renderWithRouter(
        <nav>
          <MockNavLink to="/page1">Page 1</MockNavLink>
          <MockNavLink to="/page2">Page 2</MockNavLink>
          <MockNavLink to="/page3">Page 3</MockNavLink>
        </nav>
      );
      expect(screen.getByTestId('navlink-/page1')).toBeInTheDocument();
      expect(screen.getByTestId('navlink-/page2')).toBeInTheDocument();
      expect(screen.getByTestId('navlink-/page3')).toBeInTheDocument();
    });
  });

  describe('NavLink Component Text Content', () => {
    it('should render text content correctly', () => {
      renderWithRouter(
        <MockNavLink to="/">Dashboard Link</MockNavLink>
      );
      expect(screen.getByText('Dashboard Link')).toBeInTheDocument();
    });

    it('should render multiple links with different text', () => {
      renderWithRouter(
        <nav>
          <MockNavLink to="/home">Home</MockNavLink>
          <MockNavLink to="/about">About</MockNavLink>
          <MockNavLink to="/contact">Contact</MockNavLink>
        </nav>
      );
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  // Integration Tests
  describe('Component Integration', () => {
    it('should render Button inside Card', () => {
      render(
        <Card>
          <Button>Action</Button>
        </Card>
      );
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render NavLink inside Card', () => {
      renderWithRouter(
        <Card>
          <MockNavLink to="/dashboard">Dashboard</MockNavLink>
        </Card>
      );
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render all components together', () => {
      renderWithRouter(
        <Card>
          <h2>Navigation</h2>
          <MockNavLink to="/home">Home</MockNavLink>
          <Button>Save</Button>
        </Card>
      );
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should handle multiple variants together', () => {
      render(
        <Card className="settings">
          <h2>Settings</h2>
          <Button variant="outline" size="sm">Cancel</Button>
          <Button variant="default" size="lg">Save</Button>
        </Card>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('settings');
      
      const cancelBtn = screen.getByText('Cancel');
      expect(cancelBtn).toHaveClass('btn-outline');
      expect(cancelBtn).toHaveClass('btn-sm');
      
      const saveBtn = screen.getByText('Save');
      expect(saveBtn).toHaveClass('btn-default');
      expect(saveBtn).toHaveClass('btn-lg');
    });
  });

  // Props Update Tests
  describe('Props Update Tests', () => {
    it('should update Button variant on prop change', () => {
      const { rerender } = render(<Button variant="default">Button</Button>);
      
      let button = screen.getByText('Button');
      expect(button).toHaveClass('btn-default');
      
      rerender(<Button variant="outline">Button</Button>);
      
      button = screen.getByText('Button');
      expect(button).toHaveClass('btn-outline');
    });

    it('should update Card className on prop change', () => {
      const { rerender } = render(<Card className="old">Content</Card>);
      
      let card = screen.getByTestId('card');
      expect(card).toHaveClass('old');
      
      rerender(<Card className="new">Content</Card>);
      
      card = screen.getByTestId('card');
      expect(card).toHaveClass('new');
    });

    it('should update Button disabled state', () => {
      const { rerender } = render(<Button>Click</Button>);
      
      let button = screen.getByText('Click');
      expect(button).not.toBeDisabled();
      
      rerender(<Button disabled>Click</Button>);
      
      button = screen.getByText('Click');
      expect(button).toBeDisabled();
    });
  });
});
