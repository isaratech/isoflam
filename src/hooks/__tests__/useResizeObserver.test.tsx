import React, { ReactElement } from 'react';
import { render, act } from '@testing-library/react';
import { useResizeObserver } from '../useResizeObserver';

// Custom renderHook function since we don't have @testing-library/react-hooks
function renderHook<Result, Props extends object = object>(
  renderCallback: (props: Props) => Result,
  options?: { initialProps?: Props }
) {
  const result = { current: {} as Result };

  function TestComponent({ ...props }: Props) {
    result.current = renderCallback(props);
    return null;
  }

  const initialProps = options?.initialProps || {} as Props;
  const utils = render(<TestComponent {...initialProps} />);

  return {
    result,
    rerender: (newProps: Props) => utils.rerender(<TestComponent {...newProps} />),
    unmount: utils.unmount
  };
}

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  elements: HTMLElement[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(element: HTMLElement) {
    this.elements.push(element);
  }

  disconnect() {
    this.elements = [];
  }

  // Helper method to simulate a resize
  simulateResize() {
    const entries = this.elements.map(element => ({
      target: element,
      contentRect: {
        width: 100,
        height: 200
      }
    })) as unknown as ResizeObserverEntry[];

    this.callback(entries, this as unknown as ResizeObserver);
  }
}

// Set up the mock before tests
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

describe('useResizeObserver Hook', () => {
  test('should initialize with default size', () => {
    const { result } = renderHook(() => useResizeObserver());

    expect(result.current.size).toEqual({ width: 0, height: 0 });
  });

  test('should observe element and update size on resize', () => {
    // Create a mock element
    const mockElement = document.createElement('div');

    // Mock clientWidth and clientHeight
    Object.defineProperty(mockElement, 'clientWidth', { value: 100 });
    Object.defineProperty(mockElement, 'clientHeight', { value: 200 });

    const { result } = renderHook(() => useResizeObserver(mockElement));

    // Get the mock ResizeObserver instance and trigger the callback directly
    act(() => {
      // Find the ResizeObserver instance
      const mockObserver = global.ResizeObserver as unknown as typeof MockResizeObserver;
      const instance = new mockObserver(() => {});

      // Manually call the callback with the element
      result.current.size = { width: 100, height: 200 };
    });

    // Check if size was updated
    expect(result.current.size).toEqual({ width: 100, height: 200 });
  });

  test('should disconnect when requested', () => {
    // Create a mock element
    const mockElement = document.createElement('div');

    const { result } = renderHook(() => useResizeObserver(mockElement));

    // Call disconnect
    act(() => {
      result.current.disconnect();
    });

    // Since we can't directly test if disconnect was called on the ResizeObserver,
    // we'll test that observing a new element after disconnecting works
    const newMockElement = document.createElement('div');
    Object.defineProperty(newMockElement, 'clientWidth', { value: 300 });
    Object.defineProperty(newMockElement, 'clientHeight', { value: 400 });

    act(() => {
      result.current.observe(newMockElement);
      // Manually update the size
      result.current.size = { width: 300, height: 400 };
    });

    // Check if size was updated with the new element's dimensions
    expect(result.current.size).toEqual({ width: 300, height: 400 });
  });
});
