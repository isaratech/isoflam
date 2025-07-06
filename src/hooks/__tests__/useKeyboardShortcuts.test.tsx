import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useKeyboardShortcuts } from 'src/shortcuts';

// Mock dependencies
const mockSetMode = jest.fn();
const mockSetItemControls = jest.fn();
const mockDeleteViewItem = jest.fn();
const mockDeleteConnector = jest.fn();
const mockDeleteTextBox = jest.fn();
const mockDeleteRectangle = jest.fn();
const mockCreateTextBox = jest.fn();
const mockCreateViewItem = jest.fn();
const mockCreateConnector = jest.fn();
const mockCreateRectangle = jest.fn();
const mockUndo = jest.fn();
const mockRedo = jest.fn();
const mockApplyAction = jest.fn();

// Mock useUiStateStore
jest.mock('src/stores/uiStateStore', () => ({
  useUiStateStore: {
    getState: () => ({
      mouse: {
        position: {
          tile: { x: 5, y: 5 }
        }
      }
    })
  }
}));

// Test component that uses the hook
const TestComponent = ({ editorMode, itemControls }: any) => {
  useKeyboardShortcuts({
    editorMode,
    itemControls,
    scene: {
      items: [],
      connectors: [],
      textBoxes: [],
      rectangles: [],
      deleteViewItem: mockDeleteViewItem,
      deleteConnector: mockDeleteConnector,
      deleteTextBox: mockDeleteTextBox,
      deleteRectangle: mockDeleteRectangle,
      createTextBox: mockCreateTextBox,
      createViewItem: mockCreateViewItem,
      createConnector: mockCreateConnector,
      createRectangle: mockCreateRectangle,
      applyAction: mockApplyAction
    },
    uiStateActions: {
      setMode: mockSetMode,
      setItemControls: mockSetItemControls
    },
    historyActions: {
      undo: mockUndo,
      redo: mockRedo
    }
  });

  return <div data-testid="test-component">Test Component</div>;
};

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not trigger shortcuts when editor mode is not EDITABLE', () => {
    render(<TestComponent editorMode="VIEW_ONLY" itemControls={null} />);
    
    // Press '1' key
    fireEvent.keyDown(document, { key: '1' });
    
    // Verify that setMode was not called
    expect(mockSetMode).not.toHaveBeenCalled();
  });

  it('should set cursor mode when pressing 1', () => {
    render(<TestComponent editorMode="EDITABLE" itemControls={null} />);
    
    // Press '1' key
    fireEvent.keyDown(document, { key: '1' });
    
    // Verify that setMode was called with the correct arguments
    expect(mockSetMode).toHaveBeenCalledWith({
      type: 'CURSOR',
      showCursor: true,
      mousedownItem: null
    });
  });

  it('should set pan mode when pressing 2', () => {
    render(<TestComponent editorMode="EDITABLE" itemControls={null} />);
    
    // Press '2' key
    fireEvent.keyDown(document, { key: '2' });
    
    // Verify that setMode was called with the correct arguments
    expect(mockSetMode).toHaveBeenCalledWith({
      type: 'PAN',
      showCursor: false
    });
    expect(mockSetItemControls).toHaveBeenCalledWith(null);
  });

  it('should set place icon mode when pressing 3', () => {
    render(<TestComponent editorMode="EDITABLE" itemControls={null} />);
    
    // Press '3' key
    fireEvent.keyDown(document, { key: '3' });
    
    // Verify that setItemControls and setMode were called with the correct arguments
    expect(mockSetItemControls).toHaveBeenCalledWith({
      type: 'ADD_ITEM'
    });
    expect(mockSetMode).toHaveBeenCalledWith({
      type: 'PLACE_ICON',
      showCursor: true,
      id: null
    });
  });

  it('should set rectangle draw mode when pressing 4', () => {
    render(<TestComponent editorMode="EDITABLE" itemControls={null} />);
    
    // Press '4' key
    fireEvent.keyDown(document, { key: '4' });
    
    // Verify that setMode was called with the correct arguments
    expect(mockSetMode).toHaveBeenCalledWith({
      type: 'RECTANGLE.DRAW',
      showCursor: true,
      id: null
    });
  });

  it('should set connector mode when pressing 5', () => {
    render(<TestComponent editorMode="EDITABLE" itemControls={null} />);
    
    // Press '5' key
    fireEvent.keyDown(document, { key: '5' });
    
    // Verify that setMode was called with the correct arguments
    expect(mockSetMode).toHaveBeenCalledWith({
      type: 'CONNECTOR',
      id: null,
      showCursor: true
    });
  });

  it('should create text box when pressing 6', () => {
    render(<TestComponent editorMode="EDITABLE" itemControls={null} />);
    
    // Press '6' key
    fireEvent.keyDown(document, { key: '6' });
    
    // Verify that createTextBox and setMode were called
    expect(mockCreateTextBox).toHaveBeenCalled();
    expect(mockSetMode).toHaveBeenCalledWith(expect.objectContaining({
      type: 'TEXTBOX',
      showCursor: false
    }));
  });

  it('should delete item when pressing Delete with item selected', () => {
    const itemControls = { type: 'ITEM', id: 'item1' };
    render(<TestComponent editorMode="EDITABLE" itemControls={itemControls} />);
    
    // Press 'Delete' key
    fireEvent.keyDown(document, { key: 'Delete' });
    
    // Verify that deleteViewItem was called with the correct ID
    expect(mockDeleteViewItem).toHaveBeenCalledWith('item1');
    expect(mockSetItemControls).toHaveBeenCalledWith(null);
  });

  it('should perform undo when pressing Ctrl+Z', () => {
    // Mock undo to return an action
    mockUndo.mockReturnValue({ type: 'UNDO_ACTION' });
    
    render(<TestComponent editorMode="EDITABLE" itemControls={null} />);
    
    // Press 'Ctrl+Z'
    fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
    
    // Verify that undo and applyAction were called
    expect(mockUndo).toHaveBeenCalled();
    expect(mockApplyAction).toHaveBeenCalledWith({ type: 'UNDO_ACTION' });
  });

  it('should perform redo when pressing Ctrl+Y', () => {
    // Mock redo to return an action
    mockRedo.mockReturnValue({ type: 'REDO_ACTION' });
    
    render(<TestComponent editorMode="EDITABLE" itemControls={null} />);
    
    // Press 'Ctrl+Y'
    fireEvent.keyDown(document, { key: 'y', ctrlKey: true });
    
    // Verify that redo and applyAction were called
    expect(mockRedo).toHaveBeenCalled();
    expect(mockApplyAction).toHaveBeenCalledWith({ type: 'REDO_ACTION' });
  });

  // Additional tests for copy/paste functionality could be added here
});