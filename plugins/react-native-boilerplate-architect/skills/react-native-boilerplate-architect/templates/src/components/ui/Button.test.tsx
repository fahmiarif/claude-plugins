import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { Button } from './Button';

/**
 * Reference pattern for testing a presentational component with
 * @testing-library/react-native's render/fireEvent — including the
 * disabled/loading state suppressing onPress, which is non-obvious
 * interaction logic (Button's own `handlePress` early-return) worth a
 * regression test instead of only being caught by manual QA.
 *
 * `render()` in this RTL version returns a Promise (React 19 concurrent
 * rendering support) — always `await` it before querying `screen`, or
 * `screen.getByText(...)` throws "`render` function has not been called"
 * even though render was, in fact, called.
 */
describe('Button', () => {
  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Button label="Simpan" onPress={onPress} />);
    fireEvent.press(screen.getByText('Simpan'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Simpan" onPress={onPress} isLoading />);
    // isLoading swaps the label for an ActivityIndicator, so the label
    // text isn't queryable — that's itself worth asserting on.
    expect(screen.queryByText('Simpan')).toBeNull();
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Simpan" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Simpan'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
