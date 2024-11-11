import { renderHook } from '@testing-library/react';
import { useRun } from '../useRun';

const mockOptions = {
  apiSecret: 'test-api-secret',
  clusterId: 'test-cluster',
  runId: 'test-run-id'
};

describe('useRun', () => {
  it('should create an Inferable client', () => {
    const { result } = renderHook(() => useRun(mockOptions));
    expect(result.current.client).toBeDefined();
    expect(typeof result.current.createMessage).toBe('function');
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useRun(mockOptions));
    expect(result.current.messages).toEqual([]);
  });
});
