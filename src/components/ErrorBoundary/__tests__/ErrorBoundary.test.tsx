import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const labels = {
  title: 'Something went wrong',
  message: 'message',
  download: 'Download',
  reload: 'Reload'
};

const Crash = () => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  it('shows a recovery screen and lets the user download the drawing', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const onDownload = jest.fn();

    render(
      <ErrorBoundary onDownload={onDownload} labels={labels}>
        <Crash />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('renders its children when nothing fails', () => {
    render(
      <ErrorBoundary onDownload={jest.fn()} labels={labels}>
        <p>content</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
